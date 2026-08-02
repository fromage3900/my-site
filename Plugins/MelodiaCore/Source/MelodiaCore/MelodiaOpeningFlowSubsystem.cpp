#include "MelodiaOpeningFlowSubsystem.h"

#include "Engine/GameInstance.h"
#include "Engine/World.h"
#include "MelodiaRulesGenerated.h"

UMelodiaOpeningFlowSubsystem* UMelodiaOpeningFlowSubsystem::Get(const UObject* WorldContextObject)
{
	const UWorld* World = WorldContextObject ? WorldContextObject->GetWorld() : nullptr;
	return World && World->GetGameInstance()
		? World->GetGameInstance()->GetSubsystem<UMelodiaOpeningFlowSubsystem>()
		: nullptr;
}

bool UMelodiaOpeningFlowSubsystem::BeginMorning()
{
	return TransitionTo(EMelodiaOpeningPhase::NotStarted, EMelodiaOpeningPhase::Morning);
}

bool UMelodiaOpeningFlowSubsystem::NotifySirDeparted()
{
	return TransitionTo(EMelodiaOpeningPhase::Morning, EMelodiaOpeningPhase::SirDeparted);
}

bool UMelodiaOpeningFlowSubsystem::NotifyDreamstateEntered()
{
	return TransitionTo(EMelodiaOpeningPhase::SirDeparted, EMelodiaOpeningPhase::Dreamstate);
}

bool UMelodiaOpeningFlowSubsystem::NotifyDreamstateCompleted()
{
	return TransitionTo(EMelodiaOpeningPhase::Dreamstate, EMelodiaOpeningPhase::ZenExploration);
}

bool UMelodiaOpeningFlowSubsystem::NotifyZenEncounterVictory(const FName EnemyId)
{
	if (Phase != EMelodiaOpeningPhase::ZenExploration || EnemyId != FName(MelodiaRulesGen::OpeningTutorialEnemyId))
	{
		return false;
	}

	const EMelodiaOpeningPhase Previous = Phase;
	Phase = EMelodiaOpeningPhase::FirstDungeonUnlocked;
	bHeartMelodyTokenGranted = true;
	OnPhaseChanged.Broadcast(Phase, Previous);
	OnFirstDungeonUnlocked.Broadcast();
	return true;
}

bool UMelodiaOpeningFlowSubsystem::ApplyTravelEvent(const EMelodiaOpeningTravelEvent TravelEvent)
{
	switch (TravelEvent)
	{
	case EMelodiaOpeningTravelEvent::EnterDreamstate:
		return NotifyDreamstateEntered();
	case EMelodiaOpeningTravelEvent::CompleteDreamstate:
		return NotifyDreamstateCompleted();
	case EMelodiaOpeningTravelEvent::None:
	default:
		return true;
	}
}

void UMelodiaOpeningFlowSubsystem::ResetOpening()
{
	const EMelodiaOpeningPhase Previous = Phase;
	Phase = EMelodiaOpeningPhase::NotStarted;
	bHeartMelodyTokenGranted = false;
	if (Previous != Phase)
	{
		OnPhaseChanged.Broadcast(Phase, Previous);
	}
}

bool UMelodiaOpeningFlowSubsystem::TransitionTo(const EMelodiaOpeningPhase ExpectedPhase, const EMelodiaOpeningPhase NewPhase)
{
	if (Phase != ExpectedPhase)
	{
		return false;
	}

	const EMelodiaOpeningPhase Previous = Phase;
	Phase = NewPhase;
	OnPhaseChanged.Broadcast(Phase, Previous);
	return true;
}
