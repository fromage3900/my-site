// Runtime interaction bridge for a lightweight exploration NPC.

#include "MelodiaNPCInteractionComponent.h"

FText UMelodiaNPCInteractionComponent::GetPromptText() const
{
	return InteractionPrompt;
}

bool UMelodiaNPCInteractionComponent::HasDialogue() const
{
	return !DialogueLines.IsEmpty() || !EncounterGuidance.IsEmpty();
}

bool UMelodiaNPCInteractionComponent::BeginInteraction()
{
	if (!HasDialogue())
	{
		return false;
	}

	bInteractionActive = true;
	bGuidanceDelivered = false;
	CurrentDialogueIndex = 0;
	OnInteractionStarted.Broadcast(NPCId);

	if (DialogueLines.IsValidIndex(CurrentDialogueIndex))
	{
		OnDialogueLine.Broadcast(SpeakerName, DialogueLines[CurrentDialogueIndex]);
	}
	else
	{
		OnEncounterGuidance.Broadcast(SpeakerName, EncounterGuidance);
		bGuidanceDelivered = true;
	}
	return true;
}

bool UMelodiaNPCInteractionComponent::AdvanceInteraction()
{
	if (!bInteractionActive)
	{
		return false;
	}

	++CurrentDialogueIndex;
	if (DialogueLines.IsValidIndex(CurrentDialogueIndex))
	{
		OnDialogueLine.Broadcast(SpeakerName, DialogueLines[CurrentDialogueIndex]);
		return true;
	}

	if (!bGuidanceDelivered && !EncounterGuidance.IsEmpty())
	{
		OnEncounterGuidance.Broadcast(SpeakerName, EncounterGuidance);
		bGuidanceDelivered = true;
		return true;
	}

	bInteractionActive = false;
	OnInteractionFinished.Broadcast(NPCId);
	return false;
}

void UMelodiaNPCInteractionComponent::CancelInteraction()
{
	if (!bInteractionActive)
	{
		return;
	}

	bInteractionActive = false;
	OnInteractionFinished.Broadcast(NPCId);
}
