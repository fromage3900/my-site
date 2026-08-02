// MelodiaCore ΓÇö Turn-based rhythm battle kernel.
// Ported from MelodiaMelusina_PROD (UE 5.7.2) to UE 5.8 plugin.

using UnrealBuildTool;

public class MelodiaCore : ModuleRules
{
	public MelodiaCore(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"EnhancedInput",
			"AudioMixer",
			"UMG",
			"Slate",
			"SlateCore"
			,"ProceduralDungeon"
		});

		PrivateDependencyModuleNames.AddRange(new string[]
		{
			"ImageWrapper"
		});

		// iOS/mobile platform support
		if (Target.Platform == UnrealTargetPlatform.IOS || Target.Platform == UnrealTargetPlatform.Android)
		{
			PublicDependencyModuleNames.Add("MobileUtils");
			PublicDefinitions.Add("MELODIA_MOBILE=1");
		}

		// iOS specific
		if (Target.Platform == UnrealTargetPlatform.IOS)
		{
			PublicDefinitions.Add("MELODIA_IOS=1");
		}

		// EOS for cloud saves
		if (Target.bBuildEditor == false)
		{
			PublicDependencyModuleNames.Add("OnlineSubsystem");
			PublicDependencyModuleNames.Add("OnlineSubsystemUtils");
		}
	}
}
