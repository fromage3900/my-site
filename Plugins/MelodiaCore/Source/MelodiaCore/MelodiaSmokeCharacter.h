#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "InputActionValue.h"
#include "MelodiaSmokeCharacter.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UInputMappingContext;
class UInputAction;
class UAnimMontage;
class USkeletalMeshComponent;

UCLASS(Blueprintable)
class MELODIACORE_API AMelodiaSmokeCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	AMelodiaSmokeCharacter();

	virtual void Tick(float DeltaSeconds) override;
	virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
	virtual void BeginPlay() override;
	virtual void Landed(const FHitResult& Hit) override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Melodia|Smoke")
	TObjectPtr<USpringArmComponent> CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Melodia|Smoke")
	TObjectPtr<UCameraComponent> FollowCamera;

	/** Hair follows the production body pose and owns the water-hair materials. */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Melodia|Smoke|Presentation")
	TObjectPtr<USkeletalMeshComponent> WaterHairMesh;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Smoke")
	float MoveSpeedScale = 1.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Smoke")
	float SprintSpeedMultiplier = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Smoke|Input", meta=(ClampMin="0.05", ClampMax="2.0"))
	float MouseLookSensitivity = 0.55f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Smoke|Input")
	bool bInvertMouseY = true;

	/** Cloth stays disabled until the skirt collision/weighting pass is stable. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Smoke|Presentation")
	bool bEnableSkirtClothSimulation = false;

	/** Movement input is resolved from controller yaw instead of actor-local axes. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="Melodia|Smoke|Input")
	bool bCameraRelativeMovement = true;

	/** Runtime-created mapping context for exploration movement */
	UPROPERTY(BlueprintReadOnly, Category="Melodia|Smoke|Input")
	TObjectPtr<UInputMappingContext> MoveMappingContext;

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Smoke|Input")
	TObjectPtr<UInputAction> MoveAction;

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Smoke|Input")
	TObjectPtr<UInputAction> MoveRightAction;

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Smoke|Input")
	TObjectPtr<UInputAction> LookAction;

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Smoke|Input")
	TObjectPtr<UInputAction> SprintAction;

	UPROPERTY(BlueprintReadOnly, Category="Melodia|Smoke|Input")
	TObjectPtr<UInputAction> JumpInputAction;

	/** One-shot recovery pose played after a jump reaches the ground. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Melodia|Smoke|Animation")
	TObjectPtr<UAnimMontage> LandingMontage;

private:
	float BaseWalkSpeed = 420.0f;

	void OnMoveTriggered(const FInputActionValue& Value);
	void OnMoveRightTriggered(const FInputActionValue& Value);
	void OnLookTriggered(const FInputActionValue& Value);
	void OnSprintStarted();
	void OnSprintCompleted();
	void CreateInputMappingContext();
};
