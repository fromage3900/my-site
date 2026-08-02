// Encounter trigger ΓÇö overlap volume that starts a rhythm battle.

#include "MelodiaEncounterTrigger.h"
#include "MelodiaBattleSession.h"
#include "MelodiaRoguelikeRunSubsystem.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "GameFramework/Character.h"
#include "Materials/MaterialInterface.h"

AMelodiaEncounterTrigger::AMelodiaEncounterTrigger()
{
	PrimaryActorTick.bCanEverTick = false;

	TriggerVolume = CreateDefaultSubobject<UBoxComponent>(TEXT("TriggerVolume"));
	TriggerVolume->SetBoxExtent(FVector(200.0f, 200.0f, 150.0f));
	TriggerVolume->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	TriggerVolume->SetGenerateOverlapEvents(true);
	RootComponent = TriggerVolume;

	EncounterLabel = CreateDefaultSubobject<UTextRenderComponent>(TEXT("EncounterLabel"));
	EncounterLabel->SetupAttachment(RootComponent);
	EncounterLabel->SetRelativeLocation(FVector(0.0f, 0.0f, 165.0f));
	EncounterLabel->SetRelativeRotation(FRotator(0.0f, 180.0f, 0.0f));
	EncounterLabel->SetHorizontalAlignment(EHTA_Center);
	EncounterLabel->SetVerticalAlignment(EVRTA_TextCenter);
	EncounterLabel->SetTextRenderColor(FColor(255, 220, 96));
	EncounterLabel->SetWorldSize(34.0f);
	EncounterLabel->SetText(FText::FromString(TEXT("Encounter")));

	EncounterLight = CreateDefaultSubobject<UPointLightComponent>(TEXT("EncounterLight"));
	EncounterLight->SetupAttachment(RootComponent);
	EncounterLight->SetRelativeLocation(FVector(0.0f, 0.0f, 120.0f));
	EncounterLight->SetLightColor(FLinearColor(1.0f, 0.78f, 0.28f));
	EncounterLight->SetIntensity(900.0f);
	EncounterLight->SetAttenuationRadius(420.0f);

	EnemyPresentation = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("EnemyPresentation"));
	EnemyPresentation->SetupAttachment(RootComponent);
	EnemyPresentation->SetRelativeLocation(FVector(0.0f, 0.0f, 70.0f));
	EnemyPresentation->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	EnemyPresentation->SetVisibility(false);

	CombatState = CreateDefaultSubobject<UMelodiaCombatStateComponent>(TEXT("CombatState"));
	RhythmExecution = CreateDefaultSubobject<UMelodiaRhythmExecutionComponent>(TEXT("RhythmExecution"));
}

bool AMelodiaEncounterTrigger::StartEncounterForPlayer()
{
	APlayerController* PC = GetWorld() ? GetWorld()->GetFirstPlayerController() : nullptr;
	ACharacter* PlayerCharacter = PC ? Cast<ACharacter>(PC->GetPawn()) : nullptr;
	if (!PlayerCharacter || !PlayerCharacter->IsPlayerControlled() || (bOneShot && bTriggered))
	{
		return false;
	}
	const double CurrentTime = FPlatformTime::Seconds();
	if (CurrentTime - LastTriggerTime < CooldownSeconds)
	{
		return false;
	}
	UMelodiaBattleSession* Session = UMelodiaBattleSession::Get(this);
	if (!Session || Session->IsEncounterActive())
	{
		return false;
	}
	FMelodiaEncounterDefinition Encounter;
	Encounter.BattleController = this;
	Encounter.EnemyActor = EnemyPresentationActor;
	Encounter.EnemyId = EnemyId;
	Encounter.EncounterLevel = EncounterLevel;
	Encounter.EncounterDisplayName = EncounterDisplayName;
	if (!Session->BeginEncounter(Encounter))
	{
		return false;
	}
	bTriggered = true;
	LastTriggerTime = CurrentTime;
	UE_LOG(LogTemp, Log, TEXT("Melodia: Encounter explicitly started for player - Level %d (%s)"), EncounterLevel, *EncounterDisplayName.ToString());
	return true;
}

void AMelodiaEncounterTrigger::ConfigureEnemyPresentation(const FMelodiaEnemyDef& Enemy)
{
	if (!EnemyPresentation)
	{
		return;
	}

	if (!Enemy.DisplayMesh.IsNull())
	{
		if (UStaticMesh* Mesh = Enemy.DisplayMesh.LoadSynchronous())
		{
			EnemyPresentation->SetStaticMesh(Mesh);
		}
	}
	if (!Enemy.DisplayMaterial.IsNull())
	{
		if (UMaterialInterface* Material = Enemy.DisplayMaterial.LoadSynchronous())
		{
			EnemyPresentation->SetMaterial(0, Material);
		}
	}
	EnemyPresentation->SetRelativeScale3D(FVector(FMath::Max(0.01f, Enemy.MeshScale)));
	SetEnemyPresentationVisible(EnemyPresentation->GetStaticMesh() != nullptr);
}

void AMelodiaEncounterTrigger::SetEnemyPresentationVisible(const bool bVisible)
{
	if (EnemyPresentation)
	{
		EnemyPresentation->SetVisibility(bVisible);
	}
}

void AMelodiaEncounterTrigger::BeginPlay()
{
	Super::BeginPlay();

	TriggerVolume->OnComponentBeginOverlap.AddDynamic(this, &AMelodiaEncounterTrigger::OnTriggerOverlap);
}

void AMelodiaEncounterTrigger::OnConstruction(const FTransform& Transform)
{
	Super::OnConstruction(Transform);

	if (EncounterLabel)
	{
		EncounterLabel->SetText(EncounterDisplayName.IsEmpty()
			? FText::FromString(TEXT("Encounter"))
			: EncounterDisplayName);
	}
}

void AMelodiaEncounterTrigger::OnTriggerOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	// Only trigger on player character
	if (!OtherActor || !OtherActor->IsA<ACharacter>())
	{
		return;
	}

	// One-shot check
	if (bOneShot && bTriggered)
	{
		return;
	}

	// Cooldown check
	const double CurrentTime = FPlatformTime::Seconds();
	if (CurrentTime - LastTriggerTime < CooldownSeconds)
	{
		return;
	}

	UMelodiaBattleSession* Session = UMelodiaBattleSession::Get(this);
	if (!Session)
	{
		UE_LOG(LogTemp, Warning, TEXT("Melodia: Encounter trigger ΓÇö no battle session available."));
		return;
	}

	if (Session->IsEncounterActive())
	{
		return; // Already in a battle
	}

	// Build encounter definition ΓÇö this trigger actor IS the battle controller
	FMelodiaEncounterDefinition Encounter;
	Encounter.BattleController = this;
	Encounter.EnemyActor = EnemyPresentationActor;
	Encounter.EnemyId = EnemyId;
	Encounter.EncounterLevel = EncounterLevel;
	Encounter.EncounterDisplayName = EncounterDisplayName;

	if (Session->BeginEncounter(Encounter))
	{
		bTriggered = true;
		LastTriggerTime = CurrentTime;
		UE_LOG(LogTemp, Log, TEXT("Melodia: Encounter triggered ΓÇö Level %d (%s)"),
			EncounterLevel, *EncounterDisplayName.ToString());
	}
}
