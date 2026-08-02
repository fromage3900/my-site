#include "MelodiaOpeningPortal.h"

#include "Components/BoxComponent.h"
#include "Components/TextRenderComponent.h"
#include "Kismet/GameplayStatics.h"

AMelodiaOpeningPortal::AMelodiaOpeningPortal()
{
	PrimaryActorTick.bCanEverTick = false;
	TriggerVolume = CreateDefaultSubobject<UBoxComponent>(TEXT("TriggerVolume"));
	SetRootComponent(TriggerVolume);
	TriggerVolume->SetBoxExtent(FVector(180.0f, 180.0f, 180.0f));
	TriggerVolume->SetCollisionProfileName(TEXT("Trigger"));

	PromptText = CreateDefaultSubobject<UTextRenderComponent>(TEXT("PromptText"));
	PromptText->SetupAttachment(TriggerVolume);
	PromptText->SetRelativeLocation(FVector(0.0f, 0.0f, 180.0f));
	PromptText->SetText(FText::FromString(TEXT("Wake")));
	PromptText->SetHorizontalAlignment(EHTA_Center);
	PromptText->SetWorldSize(36.0f);
}

void AMelodiaOpeningPortal::BeginPlay()
{
	Super::BeginPlay();
	TriggerVolume->OnComponentBeginOverlap.AddDynamic(this, &AMelodiaOpeningPortal::HandleOverlap);
}

void AMelodiaOpeningPortal::HandleOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (!OtherActor || (bOneShot && bActivated))
	{
		return;
	}

	if (APawn* Pawn = Cast<APawn>(OtherActor); Pawn && Pawn->IsPlayerControlled())
	{
		UMelodiaOpeningFlowSubsystem* Flow = UMelodiaOpeningFlowSubsystem::Get(this);
		if (!Flow || !Flow->ApplyTravelEvent(TravelEvent))
		{
			return;
		}
		bActivated = true;
		UGameplayStatics::OpenLevel(this, DestinationLevelName);
	}
}
