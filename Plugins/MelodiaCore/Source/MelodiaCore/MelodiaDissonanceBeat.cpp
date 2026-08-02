#include "MelodiaDissonanceBeat.h"

#include "Components/BoxComponent.h"
#include "Components/PostProcessComponent.h"
#include "GameFramework/Pawn.h"
#include "EngineUtils.h"
#include "MelodiaOpeningStateAnchor.h"
#include "MelodiaOpeningStateComponent.h"

AMelodiaDissonanceBeat::AMelodiaDissonanceBeat()
{
	Trigger = CreateDefaultSubobject<UBoxComponent>(TEXT("Trigger"));
	SetRootComponent(Trigger);
	Trigger->SetBoxExtent(FVector(180.f, 450.f, 280.f));
	Trigger->SetCollisionProfileName(TEXT("Trigger"));
	Trigger->SetGenerateOverlapEvents(true);

	PostProcess = CreateDefaultSubobject<UPostProcessComponent>(TEXT("DissonancePostProcess"));
	PostProcess->SetupAttachment(Trigger);
	PostProcess->bUnbound = true;
	PostProcess->BlendWeight = 0.f;
	PostProcess->Settings.bOverride_ColorSaturation = true;
	PostProcess->Settings.ColorSaturation = FVector4(0.72f, 0.64f, 0.86f, 1.f);
	PostProcess->Settings.bOverride_SceneColorTint = true;
	PostProcess->Settings.SceneColorTint = FLinearColor(0.76f, 0.67f, 1.f, 1.f);
}

void AMelodiaDissonanceBeat::BeginPlay()
{
	Super::BeginPlay();
	Trigger->OnComponentBeginOverlap.AddDynamic(this, &AMelodiaDissonanceBeat::HandleOverlap);
}

void AMelodiaDissonanceBeat::HandleOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (!OtherActor || (bOneShot && bTriggered))
	{
		return;
	}

	APawn* Pawn = Cast<APawn>(OtherActor);
	if (!Pawn || !Pawn->IsPlayerControlled())
	{
		return;
	}

	bTriggered = true;
	PostProcess->BlendWeight = 1.f;

	for (TActorIterator<AMelodiaOpeningStateAnchor> It(GetWorld()); It; ++It)
	{
		if (UMelodiaDissonanceComponent* Dissonance = It->Dissonance)
		{
			Dissonance->SetDissonanceTier(EMelodiaDissonanceTier::Strain, SongcraftScalar);
		}
		break;
	}
}
