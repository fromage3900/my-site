#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "MelodiaCoreRulesLibrary.h"
#include "MelodiaAudioComponent.generated.h"

class USoundWave;
class UAudioComponent;

UCLASS(Blueprintable, ClassGroup=(Melodia), meta=(BlueprintSpawnableComponent))
class MELODIACORE_API UMelodiaAudioComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UMelodiaAudioComponent();

	virtual void BeginPlay() override;

	/** Play a hit sound corresponding to the given grade */
	UFUNCTION(BlueprintCallable, Category="Melodia|Audio")
	void PlayHitSFX(EMelodiaRhythmGrade Grade);

	/** Play a miss sound effect */
	UFUNCTION(BlueprintCallable, Category="Melodia|Audio")
	void PlayMissSFX();

	/** Play a metronome click on the current beat */
	UFUNCTION(BlueprintCallable, Category="Melodia|Audio")
	void PlayMetronomeClick();

	/** Start BGM for a given skill/song */
	UFUNCTION(BlueprintCallable, Category="Melodia|Audio")
	void PlayBGM(FName SkillId);

	/** Stop current BGM */
	UFUNCTION(BlueprintCallable, Category="Melodia|Audio")
	void StopBGM();

	/** Master volume scalar for SFX */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Audio", meta=(ClampMin="0.0", ClampMax="1.0"))
	float SFXVolume = 0.5f;

	/** Master volume scalar for BGM */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Audio", meta=(ClampMin="0.0", ClampMax="1.0"))
	float BGMVolume = 0.3f;

private:
	/** Create a simple sine-wave sound wave at runtime */
	USoundWave* CreateTone(float FrequencyHz, float DurationSec, float Volume = 0.5f);

	/** Create a metronome click (short burst at ~1kHz) */
	USoundWave* CreateClickTone();

	/** Spawn and play a sound wave */
	void PlaySound(USoundWave* Sound, float VolumeMultiplier = 1.0f);

	UPROPERTY()
	TObjectPtr<UAudioComponent> BGMComponent;

	/** Cached tone sounds generated at runtime */
	UPROPERTY()
	TObjectPtr<USoundWave> PerfectTone;

	UPROPERTY()
	TObjectPtr<USoundWave> GreatTone;

	UPROPERTY()
	TObjectPtr<USoundWave> GoodTone;

	UPROPERTY()
	TObjectPtr<USoundWave> MissTone;

	UPROPERTY()
	TObjectPtr<USoundWave> ClickTone;
};
