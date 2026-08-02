#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MelodiaDissonanceBeat.generated.h"

class UBoxComponent;
class UPostProcessComponent;
class UPrimitiveComponent;
class AActor;
struct FHitResult;

/** A one-shot, restrained opening Dissonance presentation trigger. */
UCLASS(Blueprintable)
class MELODIACORE_API AMelodiaDissonanceBeat : public AActor
{
	GENERATED_BODY()

public:
	AMelodiaDissonanceBeat();

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void HandleOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
		UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Melodia|Dissonance")
	TObjectPtr<UBoxComponent> Trigger;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Melodia|Dissonance")
	TObjectPtr<UPostProcessComponent> PostProcess;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Melodia|Dissonance", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float SongcraftScalar = 0.75f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Melodia|Dissonance")
	bool bOneShot = true;

private:
	bool bTriggered = false;
};
