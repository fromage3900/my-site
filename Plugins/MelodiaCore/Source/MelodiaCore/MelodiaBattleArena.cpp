// Battle arena actor implementation.

#include "MelodiaBattleArena.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "MelodiaBattleSession.h"

AMelodiaBattleArena::AMelodiaBattleArena()
{
	PrimaryActorTick.bCanEverTick = false;

	ArenaRoot = CreateDefaultSubobject<USceneComponent>(TEXT("ArenaRoot"));
	RootComponent = ArenaRoot;

	EnemyMeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("EnemyMesh"));
	EnemyMeshComponent->SetupAttachment(ArenaRoot);
	EnemyMeshComponent->SetVisibility(false);
	EnemyMeshComponent->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	CombatState = CreateDefaultSubobject<UMelodiaCombatStateComponent>(TEXT("CombatState"));
	RhythmExecution = CreateDefaultSubobject<UMelodiaRhythmExecutionComponent>(TEXT("RhythmExecution"));
}

void AMelodiaBattleArena::BeginPlay()
{
	Super::BeginPlay();
}

void AMelodiaBattleArena::SetupArena(const FMelodiaEnemyDef& EnemyDef)
{
	ActiveEnemy = EnemyDef;

	// Apply enemy mesh if specified
	if (EnemyMeshComponent && !EnemyDef.DisplayMesh.IsNull())
	{
		if (UStaticMesh* Mesh = EnemyDef.DisplayMesh.LoadSynchronous())
		{
			EnemyMeshComponent->SetStaticMesh(Mesh);
		}
	}

	// Apply material if specified
	if (EnemyMeshComponent && !EnemyDef.DisplayMaterial.IsNull())
	{
		if (UMaterialInterface* Mat = EnemyDef.DisplayMaterial.LoadSynchronous())
		{
			EnemyMeshComponent->SetMaterial(0, Mat);
		}
	}

	// Scale
	if (EnemyMeshComponent)
	{
		EnemyMeshComponent->SetRelativeLocation(EnemySpawnOffset);
		EnemyMeshComponent->SetRelativeScale3D(FVector(EnemyDef.MeshScale));
	}

	// Set combat state element
	if (CombatState)
	{
		CombatState->EnemyElement = EnemyDef.Element;
		CombatState->EnemyToughness = EnemyDef.MaxToughness;
		CombatState->EnemyToughnessMax = EnemyDef.MaxToughness;
	}

	// Set rhythm BPM if overridden
	if (RhythmExecution && EnemyDef.BPMOverride > 0.0f)
	{
		RhythmExecution->BPM = EnemyDef.BPMOverride;
	}

	UE_LOG(LogTemp, Log, TEXT("Melodia Arena: Setup for %s (HP=%.0f, Tough=%.0f, Elem=%d, BPM=%.0f)"),
		*EnemyDef.DisplayName.ToString(), EnemyDef.MaxHP, EnemyDef.MaxToughness,
		static_cast<int32>(EnemyDef.Element), EnemyDef.BPMOverride);
}

void AMelodiaBattleArena::ActivateArena()
{
	bArenaActive = true;

	// Show enemy mesh
	if (EnemyMeshComponent)
	{
		EnemyMeshComponent->SetVisibility(true);
	}

	// Save and move camera
	if (APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0))
	{
		if (APawn* Pawn = PC->GetPawn())
		{
			SavedCameraLocation = Pawn->GetActorLocation();
			SavedCameraRotation = PC->GetControlRotation();
			bCameraSaved = true;
		}

		// Set battle camera
		const FVector CameraTarget = GetActorLocation() + BattleCameraOffset;
		PC->SetControlRotation(BattleCameraRotation);
	}

	UE_LOG(LogTemp, Log, TEXT("Melodia Arena: Activated ΓÇö %s"), *ActiveEnemy.DisplayName.ToString());
}

void AMelodiaBattleArena::DeactivateArena()
{
	bArenaActive = false;

	// Hide enemy mesh
	if (EnemyMeshComponent)
	{
		EnemyMeshComponent->SetVisibility(false);
	}

	// Restore camera
	if (bCameraSaved)
	{
		if (APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0))
		{
			PC->SetControlRotation(SavedCameraRotation);
		}
		bCameraSaved = false;
	}

	UE_LOG(LogTemp, Log, TEXT("Melodia Arena: Deactivated"));
}
