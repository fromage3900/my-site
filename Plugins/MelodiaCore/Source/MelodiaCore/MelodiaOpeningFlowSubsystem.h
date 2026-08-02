#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "MelodiaOpeningFlowSubsystem.generated.h"

UENUM(BlueprintType)
enum class EMelodiaOpeningPhase : uint8
{
	NotStarted UMETA(DisplayName="Not Started"),
	Morning UMETA(DisplayName="Melusina's Morning"),
	SirDeparted UMETA(DisplayName="Sir Melodious Departed"),
	Dreamstate UMETA(DisplayName="Dreamstate"),
	ZenExploration UMETA(DisplayName="Zen Forest Exploration"),
	FirstDungeonUnlocked UMETA(DisplayName="First Dungeon Unlocked")
};

UENUM(BlueprintType)
enum class EMelodiaOpeningTravelEvent : uint8
{
	None UMETA(DisplayName="None"),
	EnterDreamstate UMETA(DisplayName="Enter Dreamstate"),
	CompleteDreamstate UMETA(DisplayName="Complete Dreamstate")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FMelodiaOpeningPhaseChanged, EMelodiaOpeningPhase, NewPhase, EMelodiaOpeningPhase, PreviousPhase);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FMelodiaFirstDungeonUnlocked);

/** Persistent authority for the authored bedroom -> Dreamstate -> Zen opening. */
UCLASS()
class MELODIACORE_API UMelodiaOpeningFlowSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintPure, Category="Melodia|Opening", meta=(WorldContext="WorldContextObject"))
	static UMelodiaOpeningFlowSubsystem* Get(const UObject* WorldContextObject);

	UFUNCTION(BlueprintCallable, Category="Melodia|Opening")
	bool BeginMorning();

	UFUNCTION(BlueprintCallable, Category="Melodia|Opening")
	bool NotifySirDeparted();

	UFUNCTION(BlueprintCallable, Category="Melodia|Opening")
	bool NotifyDreamstateEntered();

	UFUNCTION(BlueprintCallable, Category="Melodia|Opening")
	bool NotifyDreamstateCompleted();

	/** Unlocks once, and only for the authored Zen tutorial encounter. */
	UFUNCTION(BlueprintCallable, Category="Melodia|Opening")
	bool NotifyZenEncounterVictory(FName EnemyId);

	UFUNCTION(BlueprintCallable, Category="Melodia|Opening")
	bool ApplyTravelEvent(EMelodiaOpeningTravelEvent TravelEvent);

	UFUNCTION(BlueprintCallable, Category="Melodia|Opening")
	void ResetOpening();

	UFUNCTION(BlueprintPure, Category="Melodia|Opening")
	bool IsFirstDungeonUnlocked() const { return Phase == EMelodiaOpeningPhase::FirstDungeonUnlocked; }

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Opening")
	EMelodiaOpeningPhase Phase = EMelodiaOpeningPhase::NotStarted;

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Opening")
	bool bHeartMelodyTokenGranted = false;

	UPROPERTY(BlueprintAssignable, Category="Melodia|Opening")
	FMelodiaOpeningPhaseChanged OnPhaseChanged;

	UPROPERTY(BlueprintAssignable, Category="Melodia|Opening")
	FMelodiaFirstDungeonUnlocked OnFirstDungeonUnlocked;

private:
	bool TransitionTo(EMelodiaOpeningPhase ExpectedPhase, EMelodiaOpeningPhase NewPhase);
};
