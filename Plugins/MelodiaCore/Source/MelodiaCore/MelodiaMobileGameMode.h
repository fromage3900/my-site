// Mobile Game Mode ΓÇö configures mobile-specific defaults (landscape, touch input, no mouse)

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "MelodiaMobileGameMode.generated.h"

class UMelodiaMobileHUD;

UCLASS()
class MELODIACORE_API AMelodiaMobileGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AMelodiaMobileGameMode();

protected:
	virtual void BeginPlay() override;

	UPROPERTY(EditDefaultsOnly, Category = "Melodia|Mobile")
	TSubclassOf<UMelodiaMobileHUD> MobileHUDClass;

	UPROPERTY(EditDefaultsOnly, Category = "Melodia|Mobile")
	bool bForceLandscape = true;

	UPROPERTY(EditDefaultsOnly, Category = "Melodia|Mobile")
	bool bUseTouchInput = true;
};
