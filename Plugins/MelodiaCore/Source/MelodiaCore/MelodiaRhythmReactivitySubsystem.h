#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "MelodiaCoreRulesLibrary.h"
#include "MelodiaRhythmReactivitySubsystem.generated.h"

USTRUCT(BlueprintType)
struct FMelodiaRhythmReactivitySignal
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float BeatPulse = 0.0f;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float BeatPhase = 0.0f;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float BPM = 128.0f;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float ComboNormalized = 0.0f;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float CrescendoNormalized = 0.0f;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float CommandEnergy = 0.0f;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") EMelodiaRhythmGrade LastRhythmGrade = EMelodiaRhythmGrade::Miss;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") uint8 RhythmElement = 0;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float CommandPulse = 0.0f;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float BreakPulse = 0.0f;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float VictoryPulse = 0.0f;
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity") float EnemyTension = 0.0f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FMelodiaRhythmReactivityChanged, const FMelodiaRhythmReactivitySignal&, Signal);

UCLASS()
class MELODIACORE_API UMelodiaRhythmReactivitySubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	static const FName AudioCollectionPath;

	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override;
	virtual bool IsTickable() const override { return true; }

	UFUNCTION(BlueprintCallable, Category="Melodia|Reactivity")
	void NotifyBeat(float InBPM, float InBeatPhase = 0.0f);

	UFUNCTION(BlueprintCallable, Category="Melodia|Reactivity")
	void NotifyCommandResolved(EMelodiaRhythmGrade Grade, float InCommandEnergy, float InComboNormalized, float InCrescendoNormalized, uint8 InRhythmElement);

	UFUNCTION(BlueprintCallable, Category="Melodia|Reactivity")
	void NotifyBreak();

	UFUNCTION(BlueprintCallable, Category="Melodia|Reactivity")
	void NotifyVictory();

	UFUNCTION(BlueprintCallable, Category="Melodia|Reactivity")
	void NotifyEnemyIntent(float Tension = 1.0f);

	UFUNCTION(BlueprintCallable, Category="Melodia|Reactivity")
	void ResetEncounter();

	UFUNCTION(BlueprintPure, Category="Melodia|Reactivity")
	const FMelodiaRhythmReactivitySignal& GetSignal() const { return Signal; }

	UPROPERTY(BlueprintAssignable, Category="Melodia|Reactivity")
	FMelodiaRhythmReactivityChanged OnSignalChanged;

private:
	void Publish();
	void SetMPCScalar(const FName Parameter, float Value) const;

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Reactivity", meta=(AllowPrivateAccess="true"))
	FMelodiaRhythmReactivitySignal Signal;
};
