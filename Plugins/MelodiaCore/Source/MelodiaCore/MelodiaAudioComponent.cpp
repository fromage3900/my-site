#include "MelodiaAudioComponent.h"

#include "Components/AudioComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Sound/SoundWaveProcedural.h"

UMelodiaAudioComponent::UMelodiaAudioComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UMelodiaAudioComponent::BeginPlay()
{
	Super::BeginPlay();

	PerfectTone = CreateTone(880.0f, 0.12f);
	GreatTone = CreateTone(660.0f, 0.12f);
	GoodTone = CreateTone(440.0f, 0.10f);
	MissTone = CreateTone(220.0f, 0.20f);
	ClickTone = CreateTone(1000.0f, 0.04f);
}

USoundWave* UMelodiaAudioComponent::CreateTone(float FrequencyHz, float DurationSec, float Volume)
{
	constexpr int32 SampleRate = 44100;
	const int32 NumSamples = FMath::Max(32, FMath::CeilToInt(SampleRate * DurationSec));

	TArray<uint8> RawData;
	RawData.SetNumUninitialized(NumSamples * sizeof(int16));
	int16* SampleData = reinterpret_cast<int16*>(RawData.GetData());

	const float EnvDuration = FMath::Min(0.008f, DurationSec * 0.15f);

	for (int32 i = 0; i < NumSamples; ++i)
	{
		const float t = static_cast<float>(i) / SampleRate;
		float Envelope = 1.0f;
		if (t < EnvDuration)
		{
			Envelope = t / EnvDuration;
		}
		else if (t > DurationSec - EnvDuration)
		{
			Envelope = (DurationSec - t) / EnvDuration;
		}
		const float Sample = FMath::Sin(2.0f * PI * FrequencyHz * t) * Envelope * FMath::Clamp(Volume, 0.0f, 1.0f);
		SampleData[i] = static_cast<int16>(FMath::Clamp(Sample * 32767.0f, -32767.0f, 32767.0f));
	}

	USoundWaveProcedural* Sound = NewObject<USoundWaveProcedural>(GetTransientPackage());
	Sound->Duration = DurationSec;
	Sound->SetSampleRate(SampleRate);
	Sound->NumChannels = 1;
	Sound->SoundGroup = SOUNDGROUP_UI;
	Sound->QueueAudio(RawData.GetData(), RawData.Num());

	return Sound;
}

void UMelodiaAudioComponent::PlaySound(USoundWave* Sound, float VolumeMultiplier)
{
	if (!Sound || SFXVolume <= 0.0f)
	{
		return;
	}

	UAudioComponent* AC = UGameplayStatics::SpawnSound2D(this, Sound, SFXVolume * VolumeMultiplier, 1.0f, 0.0f, nullptr, false, false);
	if (AC)
	{
		AC->bIsUISound = true;
	}
}

void UMelodiaAudioComponent::PlayHitSFX(EMelodiaRhythmGrade Grade)
{
	switch (Grade)
	{
	case EMelodiaRhythmGrade::Perfect:
		PlaySound(PerfectTone, 1.0f);
		break;
	case EMelodiaRhythmGrade::Great:
		PlaySound(GreatTone, 0.8f);
		break;
	case EMelodiaRhythmGrade::Good:
		PlaySound(GoodTone, 0.6f);
		break;
	default:
		PlayMissSFX();
		break;
	}
}

void UMelodiaAudioComponent::PlayMissSFX()
{
	PlaySound(MissTone, 1.0f);
}

void UMelodiaAudioComponent::PlayMetronomeClick()
{
	PlaySound(ClickTone, 0.3f);
}

void UMelodiaAudioComponent::PlayBGM(FName SkillId)
{
	StopBGM();

	USoundWave* BGM_Sound = LoadObject<USoundWave>(nullptr,
		*FString::Printf(TEXT("/Game/Audio/BGM/BGM_%s.BGM_%s"), *SkillId.ToString(), *SkillId.ToString()));
	if (!BGM_Sound)
	{
		UE_LOG(LogTemp, Verbose, TEXT("MelodiaAudio: BGM asset not found for %s"), *SkillId.ToString());
		return;
	}

	BGMComponent = UGameplayStatics::SpawnSound2D(this, BGM_Sound, BGMVolume, 1.0f, 0.0f, nullptr, true, false);
	if (BGMComponent)
	{
		BGMComponent->bIsUISound = false;
	}
}

void UMelodiaAudioComponent::StopBGM()
{
	if (BGMComponent)
	{
		BGMComponent->Stop();
		BGMComponent = nullptr;
	}
}
