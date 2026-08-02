#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MelodiaSirMelodiousIntroActor.generated.h"

class USkeletalMeshComponent;
class USceneComponent;
class USphereComponent;
class UPointLightComponent;
class UPrimitiveComponent;
class AActor;
struct FHitResult;

/**
 * Authored first-room presentation of Sir Melodious. It owns the reunion beat
 * but intentionally defers companion movement and flight to a later controller.
 */
UCLASS(Blueprintable)
class MELODIACORE_API AMelodiaSirMelodiousIntroActor : public AActor
{
	GENERATED_BODY()

public:
	AMelodiaSirMelodiousIntroActor();

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	UFUNCTION()
	void HandleReunionOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
		UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Melodia|Sir Melodious")
	TObjectPtr<USceneComponent> Root;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Melodia|Sir Melodious")
	TArray<TObjectPtr<USkeletalMeshComponent>> PresentationMeshes;

	/** One-shot approach volume that records Sir's first reunion with Melusina. */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Melodia|Resonance")
	TObjectPtr<USphereComponent> ReunionTrigger;

	/** Dormant until Melusina reaches Sir; a small authored cue for the reunion. */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Melodia|Resonance")
	TObjectPtr<UPointLightComponent> ReunionLight;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Melodia|Resonance")
	bool bEnableReunionBeat = true;

	/** Bedroom-only second beat: Sir flies through the window into Dreamstate. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Melodia|Opening|Departure")
	bool bDepartAfterReunion = true;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Melodia|Opening|Departure", meta=(ClampMin="0.0"))
	float DepartureDelaySeconds = 1.25f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Melodia|Opening|Departure", meta=(ClampMin="0.1"))
	float DepartureDurationSeconds = 1.8f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Melodia|Opening|Departure")
	FVector DepartureOffset = FVector(650.0f, 0.0f, 260.0f);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Melodia|Opening|Departure", meta=(AllowedClasses="/Script/Engine.World"))
	FName DepartureDestinationLevel = TEXT("/Game/Melodia/Levels/Opening/L_Melodia_Dreamstate");

	UFUNCTION(BlueprintCallable, Category = "Melodia|Opening|Departure")
	bool BeginWindowDeparture();

private:
	void HandleDepartureDelayElapsed();
	bool bReunionTriggered = false;
	bool bDepartureActive = false;
	bool bDepartureCompleted = false;
	float DepartureElapsed = 0.0f;
	FVector DepartureStartLocation = FVector::ZeroVector;
	FTimerHandle DepartureDelayHandle;
};
