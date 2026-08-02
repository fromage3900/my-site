// Lightweight, data-driven silhouette used while authored NPC meshes are unavailable.

#include "MelodiaNPCPlaceholder.h"

#include "MelodiaNPCInteractionComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/SphereComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
#include "UObject/ConstructorHelpers.h"

AMelodiaNPCPlaceholder::AMelodiaNPCPlaceholder()
{
	PrimaryActorTick.bCanEverTick = false;

	InteractionVolume = CreateDefaultSubobject<USphereComponent>(TEXT("InteractionVolume"));
	InteractionVolume->InitSphereRadius(130.0f);
	InteractionVolume->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	SetRootComponent(InteractionVolume);

	Body = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Body"));
	Body->SetupAttachment(InteractionVolume);
	Body->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Body->SetRelativeLocation(FVector(0.0f, 0.0f, 82.0f));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> BodyMesh(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
	if (BodyMesh.Succeeded())
	{
		Body->SetStaticMesh(BodyMesh.Object);
	}

	Head = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Head"));
	Head->SetupAttachment(InteractionVolume);
	Head->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Head->SetRelativeLocation(FVector(0.0f, 0.0f, 174.0f));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> HeadMesh(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
	if (HeadMesh.Succeeded())
	{
		Head->SetStaticMesh(HeadMesh.Object);
	}

	Nameplate = CreateDefaultSubobject<UTextRenderComponent>(TEXT("Nameplate"));
	Nameplate->SetupAttachment(InteractionVolume);
	Nameplate->SetRelativeLocation(FVector(0.0f, 0.0f, 245.0f));
	Nameplate->SetHorizontalAlignment(EHorizTextAligment::EHTA_Center);
	Nameplate->SetWorldSize(28.0f);
	Nameplate->SetTextRenderColor(FColor::White);

	AccentLight = CreateDefaultSubobject<UPointLightComponent>(TEXT("AccentLight"));
	AccentLight->SetupAttachment(InteractionVolume);
	AccentLight->SetRelativeLocation(FVector(0.0f, 0.0f, 145.0f));
	AccentLight->Intensity = 220.0f;
	AccentLight->AttenuationRadius = 280.0f;
	AccentLight->bUseInverseSquaredFalloff = false;
	AccentLight->LightFalloffExponent = 2.0f;

	Interaction = CreateDefaultSubobject<UMelodiaNPCInteractionComponent>(TEXT("Interaction"));
}

void AMelodiaNPCPlaceholder::OnConstruction(const FTransform& Transform)
{
	Super::OnConstruction(Transform);
	ApplyArchetypePresentation();
}

FLinearColor AMelodiaNPCPlaceholder::GetArchetypeColor() const
{
	if (Archetype == TEXT("SakuraDreamer")) return FLinearColor(1.0f, 0.54f, 0.72f, 1.0f);
	if (Archetype == TEXT("CosmicWeaver")) return FLinearColor(0.46f, 0.36f, 1.0f, 1.0f);
	if (Archetype == TEXT("MirageDancer")) return FLinearColor(0.28f, 0.84f, 1.0f, 1.0f);
	return FLinearColor::White;
}

void AMelodiaNPCPlaceholder::ApplyArchetypePresentation()
{
	const FLinearColor Accent = GetArchetypeColor();
	Nameplate->SetText(DisplayName);
	Nameplate->SetTextRenderColor(Accent.ToFColor(true));
	AccentLight->SetLightColor(Accent);
	Interaction->NPCId = NPCId;
	Interaction->SpeakerName = DisplayName;

	if (Archetype == TEXT("CosmicWeaver"))
	{
		Body->SetRelativeScale3D(FVector(0.78f, 0.78f, 1.45f));
		Head->SetRelativeScale3D(FVector(0.78f));
	}
	else if (Archetype == TEXT("MirageDancer"))
	{
		Body->SetRelativeScale3D(FVector(0.68f, 0.68f, 1.22f));
		Head->SetRelativeScale3D(FVector(0.72f));
	}
	else
	{
		Body->SetRelativeScale3D(FVector(0.92f, 0.92f, 1.08f));
		Head->SetRelativeScale3D(FVector(0.86f));
	}
}
