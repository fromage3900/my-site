#include "MelodiaRhythmReactivitySubsystem.h"

#include "Materials/MaterialParameterCollection.h"
#include "Materials/MaterialParameterCollectionInstance.h"
#include "Engine/World.h"

const FName UMelodiaRhythmReactivitySubsystem::AudioCollectionPath(TEXT("/Game/EnvSandbox/Materials/Functions/MPC_Portfolio_Audio"));

void UMelodiaRhythmReactivitySubsystem::Tick(const float DeltaTime)
{
	const float BeatDecay = FMath::Max(0.01f, DeltaTime * 6.0f);
	Signal.BeatPulse = FMath::Max(0.0f, Signal.BeatPulse - BeatDecay);
	Signal.CommandPulse = FMath::Max(0.0f, Signal.CommandPulse - DeltaTime * 5.0f);
	Signal.BreakPulse = FMath::Max(0.0f, Signal.BreakPulse - DeltaTime * 3.0f);
	Signal.VictoryPulse = FMath::Max(0.0f, Signal.VictoryPulse - DeltaTime * 2.0f);
	Signal.EnemyTension = FMath::FInterpTo(Signal.EnemyTension, 0.0f, DeltaTime, 1.5f);
	Publish();
}

TStatId UMelodiaRhythmReactivitySubsystem::GetStatId() const
{
	RETURN_QUICK_DECLARE_CYCLE_STAT(UMelodiaRhythmReactivitySubsystem, STATGROUP_Tickables);
}

void UMelodiaRhythmReactivitySubsystem::NotifyBeat(const float InBPM, const float InBeatPhase)
{
	Signal.BPM = FMath::Clamp(InBPM, 20.0f, 400.0f);
	Signal.BeatPhase = FMath::Clamp(InBeatPhase, 0.0f, 1.0f);
	Signal.BeatPulse = 1.0f;
	Publish();
}

void UMelodiaRhythmReactivitySubsystem::NotifyCommandResolved(const EMelodiaRhythmGrade Grade, const float InCommandEnergy, const float InComboNormalized, const float InCrescendoNormalized, const uint8 InRhythmElement)
{
	Signal.LastRhythmGrade = Grade;
	Signal.CommandEnergy = FMath::Clamp(InCommandEnergy, 0.0f, 2.0f);
	Signal.ComboNormalized = FMath::Clamp(InComboNormalized, 0.0f, 1.0f);
	Signal.CrescendoNormalized = FMath::Clamp(InCrescendoNormalized, 0.0f, 1.0f);
	Signal.RhythmElement = InRhythmElement;
	Signal.CommandPulse = 1.0f;
	Publish();
}

void UMelodiaRhythmReactivitySubsystem::NotifyBreak() { Signal.BreakPulse = 1.0f; Publish(); }
void UMelodiaRhythmReactivitySubsystem::NotifyVictory() { Signal.VictoryPulse = 1.0f; Publish(); }
void UMelodiaRhythmReactivitySubsystem::NotifyEnemyIntent(const float Tension) { Signal.EnemyTension = FMath::Clamp(Tension, 0.0f, 1.0f); Publish(); }

void UMelodiaRhythmReactivitySubsystem::ResetEncounter()
{
	Signal.ComboNormalized = 0.0f;
	Signal.CrescendoNormalized = 0.0f;
	Signal.CommandEnergy = 0.0f;
	Signal.CommandPulse = 0.0f;
	Signal.BreakPulse = 0.0f;
	Signal.VictoryPulse = 0.0f;
	Signal.EnemyTension = 0.0f;
	Publish();
}

void UMelodiaRhythmReactivitySubsystem::Publish()
{
	SetMPCScalar(TEXT("BeatPulse"), Signal.BeatPulse);
	SetMPCScalar(TEXT("BeatPhase"), Signal.BeatPhase);
	SetMPCScalar(TEXT("GlobalAudioReactivity"), 1.0f);
	SetMPCScalar(TEXT("BassIntensity"), Signal.BeatPulse);
	SetMPCScalar(TEXT("MidIntensity"), Signal.CommandEnergy);
	SetMPCScalar(TEXT("TrebleIntensity"), Signal.VictoryPulse);
	SetMPCScalar(TEXT("ComboNormalized"), Signal.ComboNormalized);
	SetMPCScalar(TEXT("CrescendoNormalized"), Signal.CrescendoNormalized);
	SetMPCScalar(TEXT("CommandEnergy"), Signal.CommandEnergy);
	SetMPCScalar(TEXT("BreakPulse"), Signal.BreakPulse);
	SetMPCScalar(TEXT("VictoryPulse"), Signal.VictoryPulse);
	SetMPCScalar(TEXT("EnemyTension"), Signal.EnemyTension);
	OnSignalChanged.Broadcast(Signal);
}

void UMelodiaRhythmReactivitySubsystem::SetMPCScalar(const FName Parameter, const float Value) const
{
	if (!GetWorld()) return;
	UMaterialParameterCollection* Collection = LoadObject<UMaterialParameterCollection>(nullptr, *AudioCollectionPath.ToString());
	if (!Collection) return;
	if (UMaterialParameterCollectionInstance* Instance = GetWorld()->GetParameterCollectionInstance(Collection))
	{
		Instance->SetScalarParameterValue(Parameter, FMath::Clamp(Value, 0.0f, 2.0f));
	}
}
