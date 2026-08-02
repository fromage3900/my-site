#include "MelodiaDungeonRunCoordinator.h"

#include "DungeonGeneratorBase.h"
#include "EngineUtils.h"
#include "MelodiaBattleSession.h"
#include "MelodiaRoomExit.h"
#include "MelodiaRoomEntrance.h"
#include "MelodiaEncounterTrigger.h"
#include "MelodiaRoguelikeRewardWidget.h"
#include "MelodiaSirMelodiousIntroActor.h"
#include "Blueprint/UserWidget.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

AMelodiaDungeonRunCoordinator::AMelodiaDungeonRunCoordinator()
{
	PrimaryActorTick.bCanEverTick = false;
}

void AMelodiaDungeonRunCoordinator::BeginPlay()
{
	Super::BeginPlay();
	RunSubsystem = UMelodiaRoguelikeRunSubsystem::Get(this);
	BattleSession = UMelodiaBattleSession::Get(this);
	if (!DungeonGenerator)
	{
		for (TActorIterator<ADungeonGeneratorBase> It(GetWorld()); It; ++It)
		{
			DungeonGenerator = *It;
			break;
		}
	}
	ResolveActiveRoomExit();

	if (BattleSession)
	{
		BattleSession->OnBattlePhaseChanged.AddUniqueDynamic(this, &AMelodiaDungeonRunCoordinator::HandleBattlePhaseChanged);
		BattleSession->OnEncounterEnded.AddUniqueDynamic(this, &AMelodiaDungeonRunCoordinator::HandleEncounterEnded);
	}
	if (RunSubsystem)
	{
		RunSubsystem->OnRewardCandidatesReady.AddUniqueDynamic(this, &AMelodiaDungeonRunCoordinator::HandleRewardsReady);
		RunSubsystem->OnRunCompleted.AddUniqueDynamic(this, &AMelodiaDungeonRunCoordinator::HandleRunCompleted);
	}
	if (DungeonGenerator)
	{
		DungeonGenerator->OnPostGenerationEvent.AddUniqueDynamic(this, &AMelodiaDungeonRunCoordinator::HandleGenerationComplete);
		DungeonGenerator->OnGenerationFailedEvent.AddUniqueDynamic(this, &AMelodiaDungeonRunCoordinator::HandleGenerationFailed);
	}

	if (RunSubsystem && bStartRunOnBeginPlay && RunSubsystem->Phase == EMelodiaRunPhase::Inactive)
	{
		SetRoomExitLocked(true);
		RunSubsystem->StartNewRun(InitialRunSeed);
		if (DungeonGenerator)
		{
			DungeonGenerator->Generate();
		}
	}
}

void AMelodiaDungeonRunCoordinator::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	if (BattleSession)
	{
		BattleSession->OnBattlePhaseChanged.RemoveDynamic(this, &AMelodiaDungeonRunCoordinator::HandleBattlePhaseChanged);
		BattleSession->OnEncounterEnded.RemoveDynamic(this, &AMelodiaDungeonRunCoordinator::HandleEncounterEnded);
	}
	if (RunSubsystem)
	{
		RunSubsystem->OnRewardCandidatesReady.RemoveDynamic(this, &AMelodiaDungeonRunCoordinator::HandleRewardsReady);
		RunSubsystem->OnRunCompleted.RemoveDynamic(this, &AMelodiaDungeonRunCoordinator::HandleRunCompleted);
	}
	if (DungeonGenerator)
	{
		DungeonGenerator->OnPostGenerationEvent.RemoveDynamic(this, &AMelodiaDungeonRunCoordinator::HandleGenerationComplete);
		DungeonGenerator->OnGenerationFailedEvent.RemoveDynamic(this, &AMelodiaDungeonRunCoordinator::HandleGenerationFailed);
	}
	Super::EndPlay(EndPlayReason);
}

void AMelodiaDungeonRunCoordinator::HandleBattlePhaseChanged(const EMelodiaBattlePhase NewPhase, const EMelodiaBattlePhase PreviousPhase)
{
	if (RunSubsystem && NewPhase == EMelodiaBattlePhase::AwaitingPlayerCommand && PreviousPhase == EMelodiaBattlePhase::None)
	{
		RunSubsystem->NotifyEncounterStarted();
	}
}

void AMelodiaDungeonRunCoordinator::HandleEncounterEnded(const EMelodiaEncounterResult Result)
{
	if (RunSubsystem)
	{
		RunSubsystem->RecordEncounterResult(Result);
	}
}

void AMelodiaDungeonRunCoordinator::HandleRewardsReady(const TArray<FMelodiaRunRewardCandidate>& Candidates)
{
	SetRoomExitLocked(true);
	if (!RewardWidget)
	{
		if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
		{
			RewardWidget = CreateWidget<UMelodiaRoguelikeRewardWidget>(PC, UMelodiaRoguelikeRewardWidget::StaticClass());
			if (RewardWidget)
			{
				RewardWidget->Coordinator = this;
			}
		}
	}
	if (RewardWidget)
	{
		RewardWidget->ShowCandidates(Candidates);
	}
	PresentRewardChoices(Candidates);
}

bool AMelodiaDungeonRunCoordinator::CommitRewardAndAdvance(const int32 CandidateIndex)
{
	if (!RunSubsystem || !RunSubsystem->SelectReward(CandidateIndex))
	{
		return false;
	}
	// GS-007 fix: auto-advance stage after reward commit
	if (!RunSubsystem->AdvanceStage())
	{
		UE_LOG(LogTemp, Warning, TEXT("Melodia reward committed but AdvanceStage failed ΓÇö run may be complete."));
	}
	SetRoomExitLocked(false);
	if (RewardWidget)
	{
		RewardWidget->HideChoices();
	}
	return true;
}

bool AMelodiaDungeonRunCoordinator::RequestNextStage()
{
	if (!RunSubsystem || !DungeonGenerator || !RunSubsystem->AdvanceStage())
	{
		UE_LOG(LogTemp, Error, TEXT("Melodia stage transition rejected: run=%s generator=%s phase=%d."),
			RunSubsystem ? TEXT("valid") : TEXT("missing"), DungeonGenerator ? TEXT("valid") : TEXT("missing"),
			RunSubsystem ? static_cast<int32>(RunSubsystem->Phase) : -1);
		return false;
	}
	SetRoomExitLocked(true);
	SetPlayerTransitionLocked(true);
	BeginStageTransition();
	GetWorldTimerManager().SetTimer(GenerationTimeoutHandle, this,
		&AMelodiaDungeonRunCoordinator::HandleGenerationTimeout, GenerationTimeoutSeconds, false);
	DungeonGenerator->Generate();
	return true;
}

bool AMelodiaDungeonRunCoordinator::StartFirstDungeonRun(const int32 Seed)
{
	if (!RunSubsystem || !DungeonGenerator || RunSubsystem->Phase != EMelodiaRunPhase::Inactive)
	{
		return false;
	}

	SetRoomExitLocked(true);
	RunSubsystem->StartNewRun(Seed);
	BeginStageTransition();
	GetWorldTimerManager().SetTimer(GenerationTimeoutHandle, this,
		&AMelodiaDungeonRunCoordinator::HandleGenerationTimeout, GenerationTimeoutSeconds, false);
	DungeonGenerator->Generate();
	return true;
}

void AMelodiaDungeonRunCoordinator::HandleGenerationComplete()
{
	GetWorldTimerManager().ClearTimer(GenerationTimeoutHandle);
	// A pawn can overlap a departing room's encounter volume during the exit sweep.
	// Clear that transient encounter before configuring the newly streamed stage.
	if (BattleSession && BattleSession->IsEncounterActive())
	{
		BattleSession->SubmitFleeCommand();
	}
	if (RunSubsystem)
	{
		RunSubsystem->NotifyGenerationComplete(true);
		for (TActorIterator<AMelodiaEncounterTrigger> It(GetWorld()); It; ++It)
		{
			It->EnemyId = RunSubsystem->CurrentStage.EnemyId;
			It->EncounterDisplayName = RunSubsystem->CurrentStage.StageIndex == 0
				? FText::FromString(TEXT("Sakura Sprite"))
				: FText::FromName(RunSubsystem->CurrentStage.EnemyId);
			It->EncounterLevel = RunSubsystem->CurrentStage.StageIndex + 1;
		}
	}

	if (bRelocatePlayerAfterGeneration)
	{
		if (ResolveActiveRoomEntrance())
		{
			if (APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0))
			{
				const bool bMoved = PlayerPawn->TeleportTo(
					ActiveRoomEntrance->GetActorLocation(), ActiveRoomEntrance->GetActorRotation(), false, true);
				if (!bMoved)
				{
					UE_LOG(LogTemp, Error, TEXT("Melodia coordinator '%s' could not place the player at entrance '%s'."),
						*GetName(), *GetNameSafe(ActiveRoomEntrance));
				}
			}
		}
	}
	SetPlayerTransitionLocked(false);
}

void AMelodiaDungeonRunCoordinator::HandleGenerationFailed()
{
	GetWorldTimerManager().ClearTimer(GenerationTimeoutHandle);
	SetPlayerTransitionLocked(false);
	if (RunSubsystem)
	{
		RunSubsystem->NotifyGenerationComplete(false);
	}
}

void AMelodiaDungeonRunCoordinator::HandleGenerationTimeout()
{
	UE_LOG(LogTemp, Error, TEXT("Melodia stage generation timed out after %.1f seconds; run returned to Inactive."),
		GenerationTimeoutSeconds);
	HandleGenerationFailed();
}

void AMelodiaDungeonRunCoordinator::HandleRunCompleted()
{
	SetRoomExitLocked(true);
	const FVector SpawnLocation = GetActorTransform().TransformPosition(SirMelodiousReunionOffset);
	GetWorld()->SpawnActor<AMelodiaSirMelodiousIntroActor>(AMelodiaSirMelodiousIntroActor::StaticClass(), SpawnLocation, GetActorRotation());
	UE_LOG(LogTemp, Log, TEXT("Melodia run: dungeon complete - Sir Melodious reunion spawned."));
}

void AMelodiaDungeonRunCoordinator::SetRoomExitLocked_Implementation(const bool bLocked)
{
	if (!IsValid(ActiveRoomExit) && !ResolveActiveRoomExit())
	{
		UE_LOG(LogTemp, Error, TEXT("Melodia coordinator '%s' cannot %s room exit: no unique active exit."),
			*GetName(), bLocked ? TEXT("lock") : TEXT("unlock"));
		return;
	}
	ActiveRoomExit->SetLocked(bLocked);
}

bool AMelodiaDungeonRunCoordinator::ResolveActiveRoomExit()
{
	if (IsValid(ActiveRoomExit))
	{
		return true;
	}

	int32 CandidateCount = 0;
	AMelodiaRoomExit* Candidate = nullptr;
	for (TActorIterator<AMelodiaRoomExit> It(GetWorld()); It; ++It)
	{
		if (It->Coordinator == this || !It->Coordinator)
		{
			++CandidateCount;
			Candidate = *It;
		}
	}
	if (CandidateCount != 1)
	{
		UE_LOG(LogTemp, Error, TEXT("Melodia coordinator '%s' expected exactly one owned room exit; found %d."),
			*GetName(), CandidateCount);
		return false;
	}
	ActiveRoomExit = Candidate;
	if (!ActiveRoomExit->Coordinator)
	{
		ActiveRoomExit->Coordinator = this;
	}
	return true;
}

bool AMelodiaDungeonRunCoordinator::ResolveActiveRoomEntrance()
{
	if (IsValid(ActiveRoomEntrance))
	{
		return true;
	}

	int32 TotalCount = 0;
	int32 PrimaryCount = 0;
	AMelodiaRoomEntrance* OnlyCandidate = nullptr;
	AMelodiaRoomEntrance* PrimaryCandidate = nullptr;
	for (TActorIterator<AMelodiaRoomEntrance> It(GetWorld()); It; ++It)
	{
		++TotalCount;
		OnlyCandidate = *It;
		if (It->bPrimaryRunEntrance)
		{
			++PrimaryCount;
			PrimaryCandidate = *It;
		}
	}
	if (PrimaryCount == 1)
	{
		ActiveRoomEntrance = PrimaryCandidate;
		return true;
	}
	if (PrimaryCount == 0 && TotalCount == 1)
	{
		ActiveRoomEntrance = OnlyCandidate;
		return true;
	}
	UE_LOG(LogTemp, Error, TEXT("Melodia coordinator '%s' expected one primary generated-room entrance; found %d primary among %d total. Player was not moved."),
		*GetName(), PrimaryCount, TotalCount);
	return false;
}

void AMelodiaDungeonRunCoordinator::SetPlayerTransitionLocked(const bool bLocked)
{
	if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
	{
		if (bLocked)
		{
			PC->SetIgnoreMoveInput(true);
			PC->SetIgnoreLookInput(true);
		}
		else
		{
			PC->ResetIgnoreMoveInput();
			PC->ResetIgnoreLookInput();
		}
	}
}
