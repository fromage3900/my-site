#include "MelodiaLocomotionAnimInstance.h"

#include "GameFramework/Pawn.h"
#include "GameFramework/CharacterMovementComponent.h"

void UMelodiaLocomotionAnimInstance::NativeUpdateAnimation(const float DeltaSeconds)
{
	Super::NativeUpdateAnimation(DeltaSeconds);

	const APawn* Pawn = TryGetPawnOwner();
	PawnVelocity = Pawn ? Pawn->GetVelocity() : FVector::ZeroVector;
	const UCharacterMovementComponent* Movement = Pawn ? Cast<UCharacterMovementComponent>(Pawn->GetMovementComponent()) : nullptr;
	PawnAcceleration = Movement ? Movement->GetCurrentAcceleration() : FVector::ZeroVector;
	RuntimeGroundSpeed = PawnVelocity.Size2D();
	bRuntimeShouldMove = RuntimeGroundSpeed > 3.0f && PawnAcceleration.SizeSquared2D() > 0.0f;
	bRuntimeIsInAir = Movement ? Movement->IsFalling() : false;
	bRuntimeIsGrounded = !bRuntimeIsInAir;
	RuntimeVerticalSpeed = PawnVelocity.Z;
}
