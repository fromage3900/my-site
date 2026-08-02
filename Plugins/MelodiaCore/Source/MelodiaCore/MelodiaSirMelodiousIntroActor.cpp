#include "MelodiaSirMelodiousIntroActor.h"

#include "Components/SkeletalMeshComponent.h"
#include "Components/SphereComponent.h"
#include "Components/PointLightComponent.h"
#include "EngineUtils.h"
#include "GameFramework/Pawn.h"
#include "MelodiaOpeningStateAnchor.h"
#include "MelodiaOpeningStateComponent.h"
#include "MelodiaOpeningFlowSubsystem.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"
#include "UObject/ConstructorHelpers.h"

AMelodiaSirMelodiousIntroActor::AMelodiaSirMelodiousIntroActor()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.bStartWithTickEnabled = false;
	Root = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	SetRootComponent(Root);
	ReunionTrigger = CreateDefaultSubobject<USphereComponent>(TEXT("ReunionTrigger"));
	ReunionTrigger->SetupAttachment(Root);
	ReunionTrigger->SetSphereRadius(165.0f);
	ReunionTrigger->SetCollisionProfileName(TEXT("Trigger"));
	ReunionTrigger->SetGenerateOverlapEvents(true);
	ReunionLight = CreateDefaultSubobject<UPointLightComponent>(TEXT("ReunionLight"));
	ReunionLight->SetupAttachment(Root);
	ReunionLight->SetRelativeLocation(FVector(0.0f, 0.0f, 65.0f));
	ReunionLight->SetLightColor(FLinearColor(0.35f, 0.86f, 1.0f));
	ReunionLight->SetIntensity(1150.0f);
	ReunionLight->SetAttenuationRadius(380.0f);
	ReunionLight->SetCastShadows(false);
	ReunionLight->SetVisibility(false);

	// The armature-bearing delivery is authoritative. Keep the earlier component
	// assembly below solely as a recovery fallback for an incomplete checkout.
	ConstructorHelpers::FObjectFinder<USkeletalMesh> RiggedMeshFinder(
		TEXT("/Game/Melodia/Characters/SirMelodious/Rigged/SK_SirMelodious_Rigged.SK_SirMelodious_Rigged"));
	if (RiggedMeshFinder.Succeeded())
	{
		USkeletalMeshComponent* RiggedComponent = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("SirMelodiousRigged"));
		RiggedComponent->SetupAttachment(Root);
		RiggedComponent->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		RiggedComponent->SetCastShadow(true);
		RiggedComponent->SetSkeletalMesh(RiggedMeshFinder.Object);
		PresentationMeshes.Add(RiggedComponent);
		return;
	}

	const TArray<FString> MeshPaths = {
		TEXT("/Game/Melodia/Characters/SirMelodious/B├⌐zierCurve_001.B├⌐zierCurve_001"),
		TEXT("/Game/Melodia/Characters/SirMelodious/Retopo_Cube_001.Retopo_Cube_001"),
		TEXT("/Game/Melodia/Characters/SirMelodious/Retopo_PM3D_Cube3D1_011.Retopo_PM3D_Cube3D1_011"),
		TEXT("/Game/Melodia/Characters/SirMelodious/Retopo_PM3D_Cube3D25.Retopo_PM3D_Cube3D25"),
		TEXT("/Game/Melodia/Characters/SirMelodious/Retopo_PM3D_Cube3D27.Retopo_PM3D_Cube3D27"),
		TEXT("/Game/Melodia/Characters/SirMelodious/Retopo_PM3D_Ring3D2_001.Retopo_PM3D_Ring3D2_001"),
		TEXT("/Game/Melodia/Characters/SirMelodious/Retopo_PM3D_Ring3D2_1_001.Retopo_PM3D_Ring3D2_1_001")
	};

	for (int32 Index = 0; Index < MeshPaths.Num(); ++Index)
	{
		USkeletalMeshComponent* MeshComponent = CreateDefaultSubobject<USkeletalMeshComponent>(*FString::Printf(TEXT("SirMelodiousPart_%02d"), Index));
		MeshComponent->SetupAttachment(Root);
		MeshComponent->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		MeshComponent->SetCastShadow(true);

		ConstructorHelpers::FObjectFinder<USkeletalMesh> MeshFinder(*MeshPaths[Index]);
		if (MeshFinder.Succeeded())
		{
			MeshComponent->SetSkeletalMesh(MeshFinder.Object);
		}

		PresentationMeshes.Add(MeshComponent);
	}
}

void AMelodiaSirMelodiousIntroActor::BeginPlay()
{
	Super::BeginPlay();
	ReunionTrigger->OnComponentBeginOverlap.AddDynamic(this, &AMelodiaSirMelodiousIntroActor::HandleReunionOverlap);
	if (UMelodiaOpeningFlowSubsystem* Flow = UMelodiaOpeningFlowSubsystem::Get(this))
	{
		Flow->BeginMorning();
	}
}

void AMelodiaSirMelodiousIntroActor::HandleReunionOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (!bEnableReunionBeat || bReunionTriggered)
	{
		return;
	}

	APawn* Pawn = Cast<APawn>(OtherActor);
	if (!Pawn || !Pawn->IsPlayerControlled())
	{
		return;
	}

	for (TActorIterator<AMelodiaOpeningStateAnchor> It(GetWorld()); It; ++It)
	{
		if (UMelodiaResonanceBondComponent* Bond = It->ResonanceBond)
		{
			Bond->SetBondState(EMelodiaResonanceBondState::Reunited);
			ReunionLight->SetVisibility(true);
			bReunionTriggered = true;
			if (bDepartAfterReunion)
			{
				GetWorldTimerManager().SetTimer(DepartureDelayHandle, this,
					&AMelodiaSirMelodiousIntroActor::HandleDepartureDelayElapsed, DepartureDelaySeconds, false);
			}
		}
		break;
	}
}

void AMelodiaSirMelodiousIntroActor::HandleDepartureDelayElapsed()
{
	BeginWindowDeparture();
}

bool AMelodiaSirMelodiousIntroActor::BeginWindowDeparture()
{
	if (!bReunionTriggered || bDepartureActive || bDepartureCompleted)
	{
		return false;
	}

	UMelodiaOpeningFlowSubsystem* Flow = UMelodiaOpeningFlowSubsystem::Get(this);
	if (!Flow || !Flow->NotifySirDeparted())
	{
		return false;
	}

	DepartureStartLocation = GetActorLocation();
	DepartureElapsed = 0.0f;
	bDepartureActive = true;
	ReunionTrigger->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	ReunionLight->SetVisibility(false);
	SetActorTickEnabled(true);
	return true;
}

void AMelodiaSirMelodiousIntroActor::Tick(const float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (!bDepartureActive)
	{
		return;
	}

	DepartureElapsed += DeltaSeconds;
	const float Alpha = FMath::Clamp(DepartureElapsed / FMath::Max(0.1f, DepartureDurationSeconds), 0.0f, 1.0f);
	const float SmoothedAlpha = FMath::SmoothStep(0.0f, 1.0f, Alpha);
	FVector Location = FMath::Lerp(DepartureStartLocation, DepartureStartLocation + DepartureOffset, SmoothedAlpha);
	Location.Z += FMath::Sin(Alpha * PI) * 80.0f;
	SetActorLocation(Location);
	SetActorRotation(DepartureOffset.Rotation());

	if (Alpha >= 1.0f)
	{
		bDepartureActive = false;
		bDepartureCompleted = true;
		SetActorTickEnabled(false);
		if (UMelodiaOpeningFlowSubsystem* Flow = UMelodiaOpeningFlowSubsystem::Get(this))
		{
			Flow->NotifyDreamstateEntered();
		}
		UGameplayStatics::OpenLevel(this, DepartureDestinationLevel);
	}
}
