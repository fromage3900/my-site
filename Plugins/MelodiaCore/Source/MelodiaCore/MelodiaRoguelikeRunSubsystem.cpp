#include "MelodiaRoguelikeRunSubsystem.h"

// Runtime-only implementation; editor Python is intentionally not a dependency.

#include "Engine/GameInstance.h"
#include "Engine/World.h"
#include "MelodiaBattleSession.h"

UMelodiaRoguelikeRunSubsystem* UMelodiaRoguelikeRunSubsystem::Get(const UObject* WorldContextObject)
{
	const UWorld* World = WorldContextObject ? WorldContextObject->GetWorld() : nullptr;
	return World && World->GetGameInstance()
		? World->GetGameInstance()->GetSubsystem<UMelodiaRoguelikeRunSubsystem>()
		: nullptr;
}

void UMelodiaRoguelikeRunSubsystem::StartNewRun(const int32 Seed)
{
	RunSeed = Seed;
	CurrentStageIndex = 0;
	RandomStream.Initialize(RunSeed);
	PendingRewards.Reset();
	AcquiredRewardIds.Reset();
	SongPowerMultiplier = 1.0f;
	RecoveryMultiplier = 1.0f;
	Dissonance = 0.0f;
	HeartMelodyTokensConsumed = 0;
	SwirlMelodyTokensConsumed = 0;
	bSirMelodiousAvailable = false;
	bEncounterResultRecorded = false;
	bRewardCommitted = false;
	SetPhase(EMelodiaRunPhase::Generating);
	BuildCurrentStage();
}

void UMelodiaRoguelikeRunSubsystem::BuildCurrentStage()
{
	static const TArray<FName> StageIds = {
		TEXT("Grove"), TEXT("ResonantBridge"), TEXT("DissonantClearing"), TEXT("MemoryCache"), TEXT("Crescendo")
	};
	static const TArray<FName> EnemyIds = {
		TEXT("CrystalShard"), TEXT("StoneGolem"), TEXT("VoidWraith"), TEXT("FireDrake")
	};

	CurrentStage.StageIndex = CurrentStageIndex;
	CurrentStage.StageSeed = RandomStream.RandHelper(MAX_int32);
	CurrentStage.StageId = CurrentStageIndex == 0 ? FName(TEXT("SakuraThreshold")) : StageIds[RandomStream.RandHelper(StageIds.Num())];
	CurrentStage.EnemyId = CurrentStageIndex == 0 ? FName(TEXT("SakuraPhantom")) : EnemyIds[RandomStream.RandHelper(EnemyIds.Num())];
	OnStageRecipeReady.Broadcast(CurrentStage);
	UE_LOG(LogTemp, Log, TEXT("Melodia run: stage %d recipe %s / %s (seed %d)"),
		CurrentStageIndex, *CurrentStage.StageId.ToString(), *CurrentStage.EnemyId.ToString(), CurrentStage.StageSeed);
}

bool UMelodiaRoguelikeRunSubsystem::RecordEncounterResult(const EMelodiaEncounterResult Result)
{
	if (Phase != EMelodiaRunPhase::Encounter || bEncounterResultRecorded)
	{
		return false;
	}

	bEncounterResultRecorded = true;
	if (Result == EMelodiaEncounterResult::Victory)
	{
		if (CurrentStageIndex >= StagesPerDungeon - 1)
		{
			bSirMelodiousAvailable = true;
			SetPhase(EMelodiaRunPhase::Complete);
			OnRunCompleted.Broadcast();
			return true;
		}
		BuildRewardCandidates();
		SetPhase(EMelodiaRunPhase::RewardChoice);
		OnRewardCandidatesReady.Broadcast(PendingRewards);
	}
	else if (Result == EMelodiaEncounterResult::Defeat)
	{
		SetPhase(EMelodiaRunPhase::Defeated);
	}
	else
	{
		bEncounterResultRecorded = false;
		SetPhase(EMelodiaRunPhase::Exploring);
	}
	return true;
}

bool UMelodiaRoguelikeRunSubsystem::NotifyEncounterStarted()
{
	if (Phase != EMelodiaRunPhase::Exploring)
	{
		return false;
	}
	bEncounterResultRecorded = false;
	SetPhase(EMelodiaRunPhase::Encounter);
	return true;
}

void UMelodiaRoguelikeRunSubsystem::BuildRewardCandidates()
{
	PendingRewards.Reset();
	const float PowerMagnitude = RandomStream.FRandRange(0.10f, 0.18f);
	const float RecoveryMagnitude = RandomStream.FRandRange(0.12f, 0.22f);
	const float BargainMagnitude = RandomStream.FRandRange(0.22f, 0.35f);

	FMelodiaRunRewardCandidate Power;
	Power.RewardId = TEXT("ResonantCrescendo");
	Power.DisplayName = FText::FromString(TEXT("Resonant Crescendo"));
	Power.Type = EMelodiaRunRewardType::SongPower;
	Power.Magnitude = PowerMagnitude;
	PendingRewards.Add(Power);

	FMelodiaRunRewardCandidate Recovery;
	if (CurrentStageIndex == 0)
	{
		Recovery.RewardId = TEXT("HeartMelodyToken");
		Recovery.DisplayName = FText::FromString(TEXT("Heart Melody Token - consume to restore 30 HP"));
		Recovery.Type = EMelodiaRunRewardType::Recovery;
		Recovery.Magnitude = RecoveryMagnitude;
	}
	else
	{
		Recovery.RewardId = TEXT("SwirlMelodyToken");
		Recovery.DisplayName = FText::FromString(TEXT("Swirl Melody Token - consume to restore 2 SP"));
		Recovery.Type = EMelodiaRunRewardType::SkillPointRegen;
		Recovery.Magnitude = 2.0f;
	}
	PendingRewards.Add(Recovery);

	FMelodiaRunRewardCandidate Bargain;
	Bargain.RewardId = TEXT("CrimsonOvertone");
	Bargain.DisplayName = FText::FromString(TEXT("Crimson Overtone"));
	Bargain.Type = EMelodiaRunRewardType::DissonantBargain;
	Bargain.Magnitude = BargainMagnitude;
	Bargain.DissonanceCost = 15.0f;
	PendingRewards.Add(Bargain);
}

bool UMelodiaRoguelikeRunSubsystem::SelectReward(const int32 CandidateIndex)
{
	if (Phase != EMelodiaRunPhase::RewardChoice || bRewardCommitted || !PendingRewards.IsValidIndex(CandidateIndex))
	{
		return false;
	}

	const FMelodiaRunRewardCandidate Reward = PendingRewards[CandidateIndex];
	bRewardCommitted = true;
	AcquiredRewardIds.Add(Reward.RewardId);
	if (Reward.Type == EMelodiaRunRewardType::Recovery)
	{
		++HeartMelodyTokens;
		ConsumeHeartMelodyToken();
	}
	else if (Reward.Type == EMelodiaRunRewardType::SkillPointRegen)
	{
		++SwirlMelodyTokens;
		ConsumeSwirlMelodyToken();
	}
	else
	{
		SongPowerMultiplier += Reward.Magnitude;
		Dissonance = FMath::Clamp(Dissonance + Reward.DissonanceCost, 0.0f, 100.0f);
	}
	PendingRewards.Reset();
	OnRewardSelected.Broadcast(Reward);
	SetPhase(EMelodiaRunPhase::Transitioning);
	return true;
}

bool UMelodiaRoguelikeRunSubsystem::ConsumeHeartMelodyToken()
{
	if (HeartMelodyTokens <= 0)
	{
		return false;
	}
	UMelodiaBattleSession* Session = GetGameInstance() ? GetGameInstance()->GetSubsystem<UMelodiaBattleSession>() : nullptr;
	if (!Session)
	{
		return false;
	}
	if (Session->PersistentPartyHP >= Session->PersistentPartyMaxHP)
	{
		return false;
	}
	--HeartMelodyTokens;
	++HeartMelodyTokensConsumed;
	Session->RestorePersistentPartyHealth(30.0f);
	return true;
}

int32 UMelodiaRoguelikeRunSubsystem::GrantHeartMelodyTokens(const int32 Amount)
{
	if (Amount > 0)
	{
		HeartMelodyTokens += Amount;
	}
	return HeartMelodyTokens;
}

bool UMelodiaRoguelikeRunSubsystem::ConsumeSwirlMelodyToken()
{
	if (SwirlMelodyTokens <= 0)
	{
		return false;
	}
	UMelodiaBattleSession* Session = GetGameInstance() ? GetGameInstance()->GetSubsystem<UMelodiaBattleSession>() : nullptr;
	if (!Session || Session->PersistentSkillPoints >= Session->PersistentSkillPointMax)
	{
		return false;
	}
	--SwirlMelodyTokens;
	++SwirlMelodyTokensConsumed;
	Session->RestorePersistentSkillPoints(2);
	return true;
}

bool UMelodiaRoguelikeRunSubsystem::AdvanceStage()
{
	if (Phase != EMelodiaRunPhase::Transitioning || !bRewardCommitted)
	{
		return false;
	}
	++CurrentStageIndex;
	bEncounterResultRecorded = false;
	bRewardCommitted = false;
	BuildCurrentStage();
	SetPhase(EMelodiaRunPhase::Generating);
	return true;
}

void UMelodiaRoguelikeRunSubsystem::NotifyGenerationComplete(const bool bSucceeded)
{
	if (Phase != EMelodiaRunPhase::Generating)
	{
		return;
	}
	SetPhase(bSucceeded ? EMelodiaRunPhase::Exploring : EMelodiaRunPhase::Inactive);
}

void UMelodiaRoguelikeRunSubsystem::EndRun(const bool bCompleted)
{
	PendingRewards.Reset();
	SetPhase(bCompleted ? EMelodiaRunPhase::Complete : EMelodiaRunPhase::Inactive);
}

void UMelodiaRoguelikeRunSubsystem::SetPhase(const EMelodiaRunPhase NewPhase)
{
	if (Phase == NewPhase)
	{
		return;
	}
	const EMelodiaRunPhase Previous = Phase;
	Phase = NewPhase;
	OnRunPhaseChanged.Broadcast(NewPhase, Previous);
}
