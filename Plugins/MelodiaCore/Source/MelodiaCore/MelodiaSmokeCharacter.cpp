#include "MelodiaSmokeCharacter.h"

#include "Camera/CameraComponent.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "InputModifiers.h"
#include "InputMappingContext.h"
#include "InputAction.h"
#include "Components/SkeletalMeshComponent.h"
#include "Animation/AnimMontage.h"
#include "Materials/MaterialInterface.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "GameFramework/PlayerController.h"
#include "UObject/ConstructorHelpers.h"

AMelodiaSmokeCharacter::AMelodiaSmokeCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	GetCharacterMovement()->MaxWalkSpeed = BaseWalkSpeed;
	GetCharacterMovement()->bOrientRotationToMovement = true;
	GetCharacterMovement()->RotationRate = FRotator(0.0f, 540.0f, 0.0f);
	bUseControllerRotationYaw = false;
	JumpMaxCount = 1;

	CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
	CameraBoom->SetupAttachment(RootComponent);
	CameraBoom->TargetArmLength = 420.0f;
	CameraBoom->SetRelativeRotation(FRotator(-18.0f, 0.0f, 0.0f));
	CameraBoom->bUsePawnControlRotation = true;

	FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
	FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
	FollowCamera->bUsePawnControlRotation = false;

	static ConstructorHelpers::FObjectFinder<USkeletalMesh> MelusinaMesh(TEXT("/Game/Melodia/Characters/Melusina/SK_Melusina.SK_Melusina"));
	if (MelusinaMesh.Succeeded())
	{
		GetMesh()->SetSkeletalMesh(MelusinaMesh.Object);
		GetMesh()->SetRelativeLocation(FVector(0.0f, 0.0f, -88.0f));
		// The authored character faces +Y; ACharacter locomotion faces +X.
		GetMesh()->SetRelativeRotation(FRotator(0.0f, -90.0f, 0.0f));
	}

	WaterHairMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("WaterHairMesh"));
	WaterHairMesh->SetupAttachment(GetMesh());
	WaterHairMesh->SetRelativeTransform(FTransform::Identity);
	WaterHairMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	WaterHairMesh->SetGenerateOverlapEvents(false);

	static ConstructorHelpers::FObjectFinder<USkeletalMesh> MelusinaHair(
		TEXT("/Game/Melodia/Characters/Melusina/Hair/SK_MelusinaHair.SK_MelusinaHair"));
	if (MelusinaHair.Succeeded())
	{
		WaterHairMesh->SetSkeletalMesh(MelusinaHair.Object);
	}

	static ConstructorHelpers::FObjectFinder<UMaterialInterface> WaterHairMaterial(
		TEXT("/Game/EnvSandbox/Materials/Instances/Melusina/MI_Melusina_WaterHair.MI_Melusina_WaterHair"));
	if (WaterHairMaterial.Succeeded())
	{
		for (int32 MaterialIndex = 0; MaterialIndex < WaterHairMesh->GetNumMaterials(); ++MaterialIndex)
		{
			WaterHairMesh->SetMaterial(MaterialIndex, WaterHairMaterial.Object);
		}
	}

	static ConstructorHelpers::FClassFinder<UAnimInstance> WaterHairAnim(
		TEXT("/Game/Melodia/Characters/Melusina/Hair/ABP_Melusina_WaterHair"));
	if (WaterHairAnim.Succeeded())
	{
		WaterHairMesh->SetAnimationMode(EAnimationMode::AnimationBlueprint);
		WaterHairMesh->SetAnimInstanceClass(WaterHairAnim.Class);
	}

	static ConstructorHelpers::FClassFinder<UAnimInstance> MelusinaAnim(TEXT("/Game/Melodia/Characters/Melusina/ABP_Melusina_Current"));
	if (MelusinaAnim.Succeeded())
	{
		GetMesh()->SetAnimInstanceClass(MelusinaAnim.Class);
	}

	static ConstructorHelpers::FObjectFinder<UAnimMontage> MelusinaLanding(TEXT("/Game/Melodia/Characters/Melusina/Animations/AM_Mocap_JumpEnd.AM_Mocap_JumpEnd"));
	if (MelusinaLanding.Succeeded())
	{
		LandingMontage = MelusinaLanding.Object;
	}
}

void AMelodiaSmokeCharacter::BeginPlay()
{
	Super::BeginPlay();

	GetMesh()->bDisableClothSimulation = !bEnableSkirtClothSimulation;
}

void AMelodiaSmokeCharacter::Landed(const FHitResult& Hit)
{
	Super::Landed(Hit);

	if (LandingMontage && GetMesh() && GetMesh()->GetAnimInstance())
	{
		GetMesh()->GetAnimInstance()->Montage_Play(LandingMontage, 1.0f);
	}
}

void AMelodiaSmokeCharacter::Tick(const float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
}

void AMelodiaSmokeCharacter::CreateInputMappingContext()
{
	if (MoveMappingContext)
	{
		return;
	}

	MoveMappingContext = NewObject<UInputMappingContext>(this, TEXT("IMC_MelodiaMove"));

	MoveAction = NewObject<UInputAction>(this, TEXT("IA_Melodia_MoveForward"));
	MoveAction->ValueType = EInputActionValueType::Axis1D;

	MoveRightAction = NewObject<UInputAction>(this, TEXT("IA_Melodia_MoveRight"));
	MoveRightAction->ValueType = EInputActionValueType::Axis1D;

	LookAction = NewObject<UInputAction>(this, TEXT("IA_Melodia_Look"));
	LookAction->ValueType = EInputActionValueType::Axis2D;

	MoveMappingContext->MapKey(MoveAction, EKeys::W);
	FEnhancedActionKeyMapping& BackMapping = MoveMappingContext->MapKey(MoveAction, EKeys::S);
	BackMapping.Modifiers.Add(NewObject<UInputModifierNegate>(MoveMappingContext));

	FEnhancedActionKeyMapping& LeftMapping = MoveMappingContext->MapKey(MoveRightAction, EKeys::A);
	LeftMapping.Modifiers.Add(NewObject<UInputModifierNegate>(MoveMappingContext));
	MoveMappingContext->MapKey(MoveRightAction, EKeys::D);

	MoveMappingContext->MapKey(LookAction, EKeys::Mouse2D);

	SprintAction = NewObject<UInputAction>(this, TEXT("IA_Melodia_Sprint"));
	SprintAction->ValueType = EInputActionValueType::Boolean;
	MoveMappingContext->MapKey(SprintAction, EKeys::LeftShift);

	JumpInputAction = NewObject<UInputAction>(this, TEXT("IA_Melodia_Jump"));
	JumpInputAction->ValueType = EInputActionValueType::Boolean;
	MoveMappingContext->MapKey(JumpInputAction, EKeys::SpaceBar);
}

void AMelodiaSmokeCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	if (!PlayerInputComponent)
	{
		return;
	}

	UEnhancedInputComponent* EIC = Cast<UEnhancedInputComponent>(PlayerInputComponent);
	if (!EIC)
	{
		UE_LOG(LogTemp, Warning, TEXT("MelodiaSmokeCharacter: InputComponent is not EnhancedInputComponent."));
		return;
	}

	CreateInputMappingContext();

	EIC->BindAction(MoveAction, ETriggerEvent::Triggered, this, &AMelodiaSmokeCharacter::OnMoveTriggered);
	EIC->BindAction(MoveRightAction, ETriggerEvent::Triggered, this, &AMelodiaSmokeCharacter::OnMoveRightTriggered);
	EIC->BindAction(LookAction, ETriggerEvent::Triggered, this, &AMelodiaSmokeCharacter::OnLookTriggered);
	EIC->BindAction(SprintAction, ETriggerEvent::Started, this, &AMelodiaSmokeCharacter::OnSprintStarted);
	EIC->BindAction(SprintAction, ETriggerEvent::Completed, this, &AMelodiaSmokeCharacter::OnSprintCompleted);
	EIC->BindAction(SprintAction, ETriggerEvent::Canceled, this, &AMelodiaSmokeCharacter::OnSprintCompleted);
	EIC->BindAction(JumpInputAction, ETriggerEvent::Started, this, &ACharacter::Jump);
	EIC->BindAction(JumpInputAction, ETriggerEvent::Completed, this, &ACharacter::StopJumping);

	if (APlayerController* PC = Cast<APlayerController>(GetController()))
	{
		if (ULocalPlayer* LocalPlayer = PC->GetLocalPlayer())
		{
			if (UEnhancedInputLocalPlayerSubsystem* Subsystem = LocalPlayer->GetSubsystem<UEnhancedInputLocalPlayerSubsystem>())
			{
				Subsystem->AddMappingContext(MoveMappingContext, 0);
			}
		}
	}
}

void AMelodiaSmokeCharacter::OnMoveTriggered(const FInputActionValue& Value)
{
	const float MoveValue = Value.Get<float>();
	const FRotator ControlRotation = bCameraRelativeMovement && Controller
		? Controller->GetControlRotation()
		: GetActorRotation();
	const FRotator YawRotation(0.0f, ControlRotation.Yaw, 0.0f);
	const FVector ForwardDirection = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);
	if (!FMath::IsNearlyZero(MoveValue))
	{
		AddMovementInput(ForwardDirection, MoveValue * MoveSpeedScale);
	}
}

void AMelodiaSmokeCharacter::OnMoveRightTriggered(const FInputActionValue& Value)
{
	const float MoveValue = Value.Get<float>();
	const FRotator ControlRotation = bCameraRelativeMovement && Controller
		? Controller->GetControlRotation()
		: GetActorRotation();
	const FVector RightDirection = FRotationMatrix(FRotator(0.0f, ControlRotation.Yaw, 0.0f)).GetUnitAxis(EAxis::Y);
	if (!FMath::IsNearlyZero(MoveValue))
	{
		AddMovementInput(RightDirection, MoveValue * MoveSpeedScale);
	}
}

void AMelodiaSmokeCharacter::OnLookTriggered(const FInputActionValue& Value)
{
	const FVector2D LookVector = Value.Get<FVector2D>();
	AddControllerYawInput(LookVector.X * MouseLookSensitivity);
	AddControllerPitchInput(LookVector.Y * MouseLookSensitivity * (bInvertMouseY ? -1.0f : 1.0f));
}

void AMelodiaSmokeCharacter::OnSprintStarted()
{
	GetCharacterMovement()->MaxWalkSpeed = BaseWalkSpeed * SprintSpeedMultiplier;
}

void AMelodiaSmokeCharacter::OnSprintCompleted()
{
	GetCharacterMovement()->MaxWalkSpeed = BaseWalkSpeed;
}
