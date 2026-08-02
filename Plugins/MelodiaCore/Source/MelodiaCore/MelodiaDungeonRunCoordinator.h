#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MelodiaBattleTypes.h"
#include "MelodiaRoguelikeRunSubsystem.h"
#include "MelodiaDungeonRunCoordinator.generated.h"

class ADungeonGeneratorBase;
class AMelodiaRoomEntrance;
class AMelodiaRoomExit;
class UMelodiaBattleSession;
class UMelodiaRoguelikeRewardWidget;
struct FTimerHandle;

/** World bridge between streamed dungeon generation and persistent run state. */
UCLASS(Blueprintable)
class MELODIACORE_API AMelodiaDungeonRunCoordinator : public AActor
{
	GENERATED_BODY()

public:
	AMelodiaDungeonRunCoordinator();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Roguelike")
	TObjectPtr<ADungeonGeneratorBase> DungeonGenerator;

	/** The one doorway authorized to advance this run. Assign explicitly in authored maps. */
	UPROPERTY(EditInstanceOnly, BlueprintReadWrite, Category="Melodia|Roguelike")
	TObjectPtr<AMelodiaRoomExit> ActiveRoomExit;

	/** Optional authored fallback. Generated rooms should expose exactly one entrance after generation. */
	UPROPERTY(EditInstanceOnly, BlueprintReadWrite, Category="Melodia|Roguelike")
	TObjectPtr<AMelodiaRoomEntrance> ActiveRoomEntrance;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Roguelike")
	bool bStartRunOnBeginPlay = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Roguelike")
	int32 InitialRunSeed = 1337;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Roguelike")
	FVector SirMelodiousReunionOffset = FVector(650.0f, 0.0f, 120.0f);

	/** Fails a stage transition cleanly if ProceduralDungeon never reports completion. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Roguelike|Safety", meta=(ClampMin="5.0"))
	float GenerationTimeoutSeconds = 30.0f;

	/** Move the local player to the generated-room entrance after post-generation succeeds. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Roguelike|Safety")
	bool bRelocatePlayerAfterGeneration = true;

	UFUNCTION(BlueprintCallable, Category="Melodia|Roguelike")
	bool CommitRewardAndAdvance(int32 CandidateIndex);

	/** Called by the unlocked room exit after the player crosses it. */
	UFUNCTION(BlueprintCallable, Category="Melodia|Roguelike")
	bool RequestNextStage();

	/** Starts the first generated stage after the authored opening unlocks it. */
	UFUNCTION(BlueprintCallable, Category="Melodia|Roguelike")
	bool StartFirstDungeonRun(int32 Seed = 1337);

	UFUNCTION(BlueprintImplementableEvent, Category="Melodia|Roguelike")
	void PresentRewardChoices(const TArray<FMelodiaRunRewardCandidate>& Candidates);

	UFUNCTION(BlueprintNativeEvent, Category="Melodia|Roguelike")
	void SetRoomExitLocked(bool bLocked);

	UFUNCTION(BlueprintImplementableEvent, Category="Melodia|Roguelike")
	void BeginStageTransition();

protected:
	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

private:
	UFUNCTION()
	void HandleBattlePhaseChanged(EMelodiaBattlePhase NewPhase, EMelodiaBattlePhase PreviousPhase);

	UFUNCTION()
	void HandleEncounterEnded(EMelodiaEncounterResult Result);

	UFUNCTION()
	void HandleRewardsReady(const TArray<FMelodiaRunRewardCandidate>& Candidates);

	UFUNCTION()
	void HandleGenerationComplete();

	UFUNCTION()
	void HandleGenerationFailed();

	void HandleGenerationTimeout();

	UFUNCTION()
	void HandleRunCompleted();

	bool ResolveActiveRoomExit();
	bool ResolveActiveRoomEntrance();
	void SetPlayerTransitionLocked(bool bLocked);

	UPROPERTY()
	TObjectPtr<UMelodiaRoguelikeRunSubsystem> RunSubsystem;

	UPROPERTY()
	TObjectPtr<UMelodiaBattleSession> BattleSession;

	UPROPERTY()
	TObjectPtr<UMelodiaRoguelikeRewardWidget> RewardWidget;

	FTimerHandle GenerationTimeoutHandle;
};
