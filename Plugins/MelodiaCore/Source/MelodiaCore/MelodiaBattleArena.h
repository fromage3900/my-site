// Battle arena actor ΓÇö spawns enemy mesh, owns combat state, manages camera during encounters.
// Replaces the 2.1MB BP_BattleController from the JRPG template.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MelodiaCombatStateComponent.h"
#include "MelodiaRhythmExecutionComponent.h"
#include "MelodiaEnemyDefinition.h"
#include "MelodiaBattleArena.generated.h"

class UStaticMeshComponent;
class USceneComponent;

UCLASS(Blueprintable)
class MELODIACORE_API AMelodiaBattleArena : public AActor
{
	GENERATED_BODY()

public:
	AMelodiaBattleArena();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Melodia|Arena")
	TObjectPtr<USceneComponent> ArenaRoot;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Melodia|Arena")
	TObjectPtr<UStaticMeshComponent> EnemyMeshComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Melodia|Arena")
	TObjectPtr<UMelodiaCombatStateComponent> CombatState;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Melodia|Arena")
	TObjectPtr<UMelodiaRhythmExecutionComponent> RhythmExecution;

	/** Offset for the enemy mesh relative to the arena root. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Arena")
	FVector EnemySpawnOffset = FVector(0.0f, 0.0f, 50.0f);

	/** Camera offset during battle (relative to arena center). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Arena")
	FVector BattleCameraOffset = FVector(-400.0f, 200.0f, 150.0f);

	/** Camera rotation during battle. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Arena")
	FRotator BattleCameraRotation = FRotator(-15.0f, -25.0f, 0.0f);

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Arena")
	FMelodiaEnemyDef ActiveEnemy;

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Arena")
	bool bArenaActive = false;

	/** Set up the arena for a specific enemy definition. */
	UFUNCTION(BlueprintCallable, Category="Melodia|Arena")
	void SetupArena(const FMelodiaEnemyDef& EnemyDef);

	/** Activate the arena ΓÇö show enemy, start battle camera. */
	UFUNCTION(BlueprintCallable, Category="Melodia|Arena")
	void ActivateArena();

	/** Deactivate the arena ΓÇö hide enemy, restore camera. */
	UFUNCTION(BlueprintCallable, Category="Melodia|Arena")
	void DeactivateArena();

	/** Get this actor as a valid battle controller for the BattleSession. */
	UFUNCTION(BlueprintPure, Category="Melodia|Arena")
	AActor* AsBattleController() { return this; }

protected:
	virtual void BeginPlay() override;

private:
	FVector SavedCameraLocation;
	FRotator SavedCameraRotation;
	bool bCameraSaved = false;
};
