#include "MonolithBlueprintNodeActions.h"
#include "MonolithBlueprintInternal.h"
#include "MonolithBlueprintVariableActions.h"
#include "MonolithBlueprintComponentActions.h"
#include "MonolithBlueprintGraphActions.h"
#include "MonolithBlueprintCompileActions.h"
#include "MonolithBlueprintCDOActions.h"
#include "MonolithBlueprintGraphExportActions.h"
#include "MonolithBlueprintLayoutActions.h"
#include "MonolithJsonUtils.h"
#include "MonolithParamSchema.h"
#include "Kismet2/BlueprintEditorUtils.h"
#include "Kismet2/KismetEditorUtilities.h"
#include "K2Node_CallFunction.h"
#include "K2Node_CustomEvent.h"
#include "K2Node_VariableGet.h"
#include "K2Node_VariableSet.h"
#include "K2Node_IfThenElse.h"
#include "K2Node_MacroInstance.h"
#include "K2Node_ExecutionSequence.h"
#include "K2Node_SpawnActorFromClass.h"
#include "K2Node_DynamicCast.h"
#include "K2Node_Timeline.h"
#include "K2Node_Event.h"
#include "K2Node_ComponentBoundEvent.h"
#include "K2Node_AddDelegate.h"
#include "K2Node_RemoveDelegate.h"
#include "K2Node_ClearDelegate.h"
#include "K2Node_CallDelegate.h"
#include "K2Node_Self.h"
#include "K2Node_FunctionResult.h"
#include "K2Node_MakeStruct.h"
#include "K2Node_BreakStruct.h"
#include "K2Node_SwitchEnum.h"
#include "K2Node_SwitchInteger.h"
#include "K2Node_SwitchString.h"
#include "K2Node_FormatText.h"
#include "K2Node_MakeArray.h"
#include "K2Node_Select.h"
#include "EdGraphNode_Comment.h"
#include "EdGraphSchema_K2.h"
#include "K2Node.h"
#include "UObject/UnrealType.h"
#include "UObject/UObjectGlobals.h"
#include "Engine/TimelineTemplate.h"
#include "Curves/CurveFloat.h"
#include "Curves/CurveVector.h"
#include "Curves/CurveLinearColor.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Editor.h"
#include "UObject/Package.h"

// ============================================================
//  Shared Node Alias Map (1G)
// ============================================================

struct FNodeAlias
{
	FString CanonicalType;
	TMap<FString, FString> DefaultParams; // auto-filled params (e.g., macro_name for ForEachLoop)
};

static const TMap<FString, FNodeAlias>& GetNodeAliases()
{
	static TMap<FString, FNodeAlias> Aliases;
	if (Aliases.Num() == 0)
	{
		// CallFunction aliases
		Aliases.Add(TEXT("function"),       {TEXT("CallFunction"), {}});
		Aliases.Add(TEXT("call_function"),  {TEXT("CallFunction"), {}});
		Aliases.Add(TEXT("call"),           {TEXT("CallFunction"), {}});
		Aliases.Add(TEXT("func"),           {TEXT("CallFunction"), {}});

		// VariableGet aliases
		Aliases.Add(TEXT("get"),            {TEXT("VariableGet"), {}});
		Aliases.Add(TEXT("variable_get"),   {TEXT("VariableGet"), {}});

		// VariableSet aliases
		Aliases.Add(TEXT("set"),            {TEXT("VariableSet"), {}});
		Aliases.Add(TEXT("variable_set"),   {TEXT("VariableSet"), {}});

		// CustomEvent aliases
		Aliases.Add(TEXT("event"),          {TEXT("CustomEvent"), {}});
		Aliases.Add(TEXT("custom_event"),   {TEXT("CustomEvent"), {}});

		// Branch aliases
		Aliases.Add(TEXT("branch"),         {TEXT("Branch"), {}});
		Aliases.Add(TEXT("if"),             {TEXT("Branch"), {}});

		// Sequence aliases
		Aliases.Add(TEXT("sequence"),       {TEXT("Sequence"), {}});

		// MacroInstance aliases
		Aliases.Add(TEXT("macro"),          {TEXT("MacroInstance"), {}});
		Aliases.Add(TEXT("macro_instance"), {TEXT("MacroInstance"), {}});

		// SpawnActorFromClass aliases
		Aliases.Add(TEXT("spawn_actor"),    {TEXT("SpawnActorFromClass"), {}});
		Aliases.Add(TEXT("spawn"),          {TEXT("SpawnActorFromClass"), {}});

		// DynamicCast aliases
		Aliases.Add(TEXT("cast"),           {TEXT("DynamicCast"), {}});
		Aliases.Add(TEXT("dynamic_cast"),   {TEXT("DynamicCast"), {}});

		// Self aliases (1B)
		Aliases.Add(TEXT("self"),           {TEXT("Self"), {}});

		// Return aliases (1B)
		Aliases.Add(TEXT("return"),         {TEXT("Return"), {}});
		Aliases.Add(TEXT("function_result"), {TEXT("Return"), {}});

		// --- Phase 2A: Struct/Switch/Utility node aliases ---
		Aliases.Add(TEXT("make_struct"),       {TEXT("MakeStruct"), {}});
		Aliases.Add(TEXT("makestruct"),        {TEXT("MakeStruct"), {}});
		Aliases.Add(TEXT("break_struct"),      {TEXT("BreakStruct"), {}});
		Aliases.Add(TEXT("breakstruct"),       {TEXT("BreakStruct"), {}});
		Aliases.Add(TEXT("switch_enum"),       {TEXT("SwitchOnEnum"), {}});
		Aliases.Add(TEXT("switchonenum"),      {TEXT("SwitchOnEnum"), {}});
		Aliases.Add(TEXT("switch_on_enum"),    {TEXT("SwitchOnEnum"), {}});
		Aliases.Add(TEXT("switch_int"),        {TEXT("SwitchOnInt"), {}});
		Aliases.Add(TEXT("switchonint"),       {TEXT("SwitchOnInt"), {}});
		Aliases.Add(TEXT("switch_on_int"),     {TEXT("SwitchOnInt"), {}});
		Aliases.Add(TEXT("switch_string"),     {TEXT("SwitchOnString"), {}});
		Aliases.Add(TEXT("switchonstring"),    {TEXT("SwitchOnString"), {}});
		Aliases.Add(TEXT("switch_on_string"),  {TEXT("SwitchOnString"), {}});
		Aliases.Add(TEXT("format_text"),       {TEXT("FormatText"), {}});
		Aliases.Add(TEXT("formattext"),        {TEXT("FormatText"), {}});
		Aliases.Add(TEXT("make_array"),        {TEXT("MakeArray"), {}});
		Aliases.Add(TEXT("makearray"),         {TEXT("MakeArray"), {}});
		Aliases.Add(TEXT("select"),            {TEXT("Select"), {}});

		// --- Phase 1A: Macro shorthand aliases ---
		const FString StandardMacros = TEXT("/Engine/EditorBlueprintResources/StandardMacros");

		Aliases.Add(TEXT("foreachloop"),    {TEXT("MacroInstance"), {{TEXT("macro_name"), TEXT("ForEachLoop")}, {TEXT("macro_blueprint"), StandardMacros}}});
		Aliases.Add(TEXT("for_each"),       {TEXT("MacroInstance"), {{TEXT("macro_name"), TEXT("ForEachLoop")}, {TEXT("macro_blueprint"), StandardMacros}}});
		Aliases.Add(TEXT("forloop"),        {TEXT("MacroInstance"), {{TEXT("macro_name"), TEXT("ForLoop")}, {TEXT("macro_blueprint"), StandardMacros}}});
		Aliases.Add(TEXT("forloopwithbreak"), {TEXT("MacroInstance"), {{TEXT("macro_name"), TEXT("ForLoopWithBreak")}, {TEXT("macro_blueprint"), StandardMacros}}});
		Aliases.Add(TEXT("doonce"),         {TEXT("MacroInstance"), {{TEXT("macro_name"), TEXT("DoOnce")}, {TEXT("macro_blueprint"), StandardMacros}}});
		Aliases.Add(TEXT("do_once"),        {TEXT("MacroInstance"), {{TEXT("macro_name"), TEXT("DoOnce")}, {TEXT("macro_blueprint"), StandardMacros}}});
		Aliases.Add(TEXT("flipflop"),       {TEXT("MacroInstance"), {{TEXT("macro_name"), TEXT("FlipFlop")}, {TEXT("macro_blueprint"), StandardMacros}}});
		Aliases.Add(TEXT("flip_flop"),      {TEXT("MacroInstance"), {{TEXT("macro_name"), TEXT("FlipFlop")}, {TEXT("macro_blueprint"), StandardMacros}}});
		Aliases.Add(TEXT("gate"),           {TEXT("MacroInstance"), {{TEXT("macro_name"), TEXT("Gate")}, {TEXT("macro_blueprint"), StandardMacros}}});

		// --- Phase 1A: CallFunction shorthand aliases ---
		Aliases.Add(TEXT("isvalid"),        {TEXT("CallFunction"), {{TEXT("function_name"), TEXT("IsValid")}, {TEXT("target_class"), TEXT("KismetSystemLibrary")}}});
		Aliases.Add(TEXT("is_valid"),       {TEXT("CallFunction"), {{TEXT("function_name"), TEXT("IsValid")}, {TEXT("target_class"), TEXT("KismetSystemLibrary")}}});
		Aliases.Add(TEXT("delay"),          {TEXT("CallFunction"), {{TEXT("function_name"), TEXT("Delay")}, {TEXT("target_class"), TEXT("KismetSystemLibrary")}}});
		Aliases.Add(TEXT("retriggerabledelay"), {TEXT("CallFunction"), {{TEXT("function_name"), TEXT("RetriggerableDelay")}, {TEXT("target_class"), TEXT("KismetSystemLibrary")}}});
	}
	return Aliases;
}

// ============================================================
//  CallFunction default target-class resolution (engine-generic)
// ============================================================
//
// When a CallFunction node is requested without an explicit target_class, the
// resolver scans loaded UClasses for the first one exposing a matching function.
// A bare first-match by TObjectIterator order is non-deterministic and, for a
// Widget Blueprint, frequently lands on an unrelated engine class that happens
// to share a function name (e.g. SetVisibility) instead of the UMG widget the
// author meant. When the owning asset is a UWidget-derived Blueprint, prefer a
// candidate whose owning class is itself UWidget-derived before falling back to
// the unbiased first match.
//
// The bias is purely reflection-based: UWidget is resolved by string so this
// module needs no UMG link-time dependency, and no sibling/marketplace widget
// class names are referenced. If UMG is not loaded the helper degrades to the
// original first-match behaviour.

// Resolve the UMG base widget class by path without a compile-time UMG dependency.
// Returns nullptr when UMG is not loaded (cooked/standalone configs that strip it).
static UClass* ResolveWidgetBaseClass()
{
	static TWeakObjectPtr<UClass> Cached;
	if (UClass* Hit = Cached.Get())
	{
		return Hit;
	}
	// /Script/UMG.Widget is the canonical path; prefer it to avoid colliding with
	// any unrelated class that merely happens to be named "Widget".
	UClass* WidgetClass = FindObject<UClass>(nullptr, TEXT("/Script/UMG.Widget"));
	if (!WidgetClass)
	{
		WidgetClass = FindFirstObject<UClass>(TEXT("Widget"), EFindFirstObjectOptions::NativeFirst);
	}
	Cached = WidgetClass;
	return WidgetClass;
}

// True when the Blueprint generates a UWidget-derived class (Widget Blueprint).
static bool IsWidgetBlueprintContext(const UBlueprint* BP)
{
	if (!BP)
	{
		return false;
	}
	UClass* WidgetBase = ResolveWidgetBaseClass();
	if (!WidgetBase)
	{
		return false;
	}
	if (BP->GeneratedClass && BP->GeneratedClass->IsChildOf(WidgetBase))
	{
		return true;
	}
	return BP->ParentClass && BP->ParentClass->IsChildOf(WidgetBase);
}

// Scan loaded classes for the first one exposing any of the candidate function
// names. When bPreferWidget is set, a UWidget-derived owner wins over a
// non-widget owner found earlier in iteration order (the Widget-BP bias). The
// first non-widget match is retained as the fallback so non-widget functions
// (e.g. KismetMathLibrary helpers used inside a Widget BP) still resolve.
static UFunction* FindFunctionAcrossLoadedClasses(const TArray<FName>& Candidates, bool bPreferWidget)
{
	UClass* WidgetBase = bPreferWidget ? ResolveWidgetBaseClass() : nullptr;
	UFunction* FirstMatch = nullptr;
	for (TObjectIterator<UClass> It; It; ++It)
	{
		UClass* Class = *It;
		if (!Class)
		{
			continue;
		}
		for (const FName& Candidate : Candidates)
		{
			if (UFunction* Found = Class->FindFunctionByName(Candidate))
			{
				if (!FirstMatch)
				{
					FirstMatch = Found;
				}
				// With the Widget-BP bias, a widget-owned match short-circuits.
				if (WidgetBase && Class->IsChildOf(WidgetBase))
				{
					return Found;
				}
				if (!WidgetBase)
				{
					return Found;
				}
				break; // candidate matched on this class; move to next class
			}
		}
	}
	return FirstMatch;
}

// ============================================================
//  MonolithBlueprintInternal helpers
// ============================================================

bool MonolithBlueprintInternal::HasCustomEventNamed(UBlueprint* BP, FName EventName)
{
	TArray<UEdGraph*> AllGraphs;
	BP->GetAllGraphs(AllGraphs);
	for (UEdGraph* G : AllGraphs)
	{
		if (!G) continue;
		for (UEdGraphNode* N : G->Nodes)
		{
			UK2Node_CustomEvent* Existing = Cast<UK2Node_CustomEvent>(N);
			if (Existing && Existing->CustomFunctionName == EventName)
			{
				return true;
			}
		}
	}
	return false;
}

// ============================================================
//  Registration
// ============================================================

void FMonolithBlueprintNodeActions::RegisterActions(FMonolithToolRegistry& Registry)
{
	Registry.RegisterAction(TEXT("blueprint"), TEXT("add_node"),
		TEXT("Add a new node to a Blueprint graph. Supports CallFunction, VariableGet, VariableSet, CustomEvent, Branch, Sequence, MacroInstance, SpawnActorFromClass, DynamicCast, Self, Return, MakeStruct, BreakStruct, SwitchOnEnum, SwitchOnInt, SwitchOnString, FormatText, MakeArray, Select node types. Also supports shorthand aliases: ForEachLoop, ForLoop, ForLoopWithBreak, DoOnce, FlipFlop, Gate (macro shortcuts), IsValid, Delay, RetriggerableDelay (function shortcuts), make_struct, break_struct, switch_enum, switch_int, switch_string, format_text, make_array, select. ComponentBoundEvent (binds an event entry node to a component's BlueprintAssignable multicast delegate; requires component_name + delegate_property_name), AddDelegate (binds an event to a BlueprintAssignable multicast delegate; \"Bind Event to ...\" node), RemoveDelegate (\"Unbind Event from ...\" â€” removes one previously bound event), ClearDelegate (\"Unbind all Events from ...\" â€” clears every bound listener), CallDelegate (\"Call ...\" â€” broadcasts a BP-resident multicast delegate to all listeners)"),
		FMonolithActionHandler::CreateStatic(&HandleAddNode),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),       TEXT("Blueprint asset path"))
			.Required(TEXT("node_type"),         TEXT("string"),  TEXT("Node type: CallFunction (or 'function'/'call'), VariableGet (or 'get'), VariableSet (or 'set'), CustomEvent (or 'event'), Branch (or 'if'), Sequence, MacroInstance (or 'macro'), SpawnActorFromClass (or 'spawn'), DynamicCast (or 'cast'), Self, Return, MakeStruct (or 'make_struct'), BreakStruct (or 'break_struct'), SwitchOnEnum (or 'switch_enum'), SwitchOnInt (or 'switch_int'), SwitchOnString (or 'switch_string'), FormatText (or 'format_text'), MakeArray (or 'make_array'), Select. Shortcuts: ForEachLoop, ForLoop, DoOnce, FlipFlop, Gate, IsValid, Delay, RetriggerableDelay, ComponentBoundEvent, AddDelegate, RemoveDelegate, ClearDelegate, CallDelegate"))
			.Optional(TEXT("graph_name"),        TEXT("string"),  TEXT("Graph name (defaults to EventGraph)"))
			.Optional(TEXT("position"),          TEXT("array"),   TEXT("Node position as [x, y] (default: [0, 0])"), {TEXT("pos")})
			.Optional(TEXT("function_name"),     TEXT("string"),  TEXT("Function name for CallFunction nodes (e.g. PrintString)"))
			.Optional(TEXT("target_class"),      TEXT("string"),  TEXT("Name of the class to search for the function being called (CallFunction) or the multicast delegate being bound (AddDelegate / RemoveDelegate / ClearDelegate / CallDelegate). Accepts a bare class name (e.g. 'KismetSystemLibrary', 'MyPawn'). For delegate nodes, defaults to the BP's generated class (self-context) if omitted. For CallFunction, all loaded classes are searched if omitted."), {TEXT("function_class"), TEXT("member_class")})
			.Optional(TEXT("variable_name"),     TEXT("string"),  TEXT("Variable name for VariableGet/VariableSet nodes"))
			.Optional(TEXT("event_name"),        TEXT("string"),  TEXT("Custom event name for CustomEvent nodes"))
			.Optional(TEXT("macro_name"),        TEXT("string"),  TEXT("Macro graph name for MacroInstance nodes"))
			.OptionalAssetPath(TEXT("macro_blueprint"),   TEXT("Blueprint asset path containing the macro (optional for MacroInstance)"))
			.Optional(TEXT("cast_class"),        TEXT("string"),  TEXT("Class name for DynamicCast nodes (e.g. 'MyPawn'). Accepts A/U prefix or bare name."))
			.Optional(TEXT("actor_class"),       TEXT("string"),  TEXT("Actor class name for SpawnActorFromClass nodes"))
			.Optional(TEXT("struct_type"),       TEXT("string"),  TEXT("Struct type for MakeStruct/BreakStruct nodes (e.g. 'Vector', 'Transform', 'FHitResult'). Accepts F prefix or bare name."))
			.Optional(TEXT("enum_type"),         TEXT("string"),  TEXT("Enum type for SwitchOnEnum nodes (e.g. 'ECollisionChannel'). Accepts E prefix or bare name."))
			.Optional(TEXT("format"),            TEXT("string"),  TEXT("Format string for FormatText nodes (e.g. 'Hello {Name}, you have {Count} items'). Argument pins are auto-created from {ArgName} patterns."))
			.Optional(TEXT("num_entries"),        TEXT("integer"), TEXT("Number of input entries for MakeArray nodes (default: 1)"))
			.Optional(TEXT("replication"),        TEXT("string"),  TEXT("Replication mode for CustomEvent nodes: none, multicast, server, client (default: none)"))
			.Optional(TEXT("reliable"),           TEXT("bool"),    TEXT("Use reliable replication for CustomEvent nodes (default: false)"))
			.Optional(TEXT("component_name"),         TEXT("string"),  TEXT("Component variable name (SCS/native subobject) for ComponentBoundEvent nodes"))
			.Optional(TEXT("delegate_property_name"), TEXT("string"),  TEXT("Multicast delegate property name. Required for ComponentBoundEvent (resolved on component class) and AddDelegate / RemoveDelegate / ClearDelegate / CallDelegate (resolved on target_class or BP's generated class)."))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("remove_node"),
		TEXT("Remove a node from a Blueprint graph by node ID."),
		FMonolithActionHandler::CreateStatic(&HandleRemoveNode),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),  TEXT("Blueprint asset path"))
			.Required(TEXT("node_id"),     TEXT("string"), TEXT("Node ID (from get_nodes or add_node response)"))
			.Optional(TEXT("graph_name"),  TEXT("string"), TEXT("Graph name (searches all graphs if omitted)"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("connect_pins"),
		TEXT("Connect two pins in a Blueprint graph. Source pin must be an output, target pin must be an input (or vice versa â€” the schema will sort it out)."),
		FMonolithActionHandler::CreateStatic(&HandleConnectPins),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),   TEXT("Blueprint asset path"))
			.Required(TEXT("source_node"),  TEXT("string"), TEXT("Source node ID"))
			.Required(TEXT("source_pin"),   TEXT("string"), TEXT("Source pin name"))
			.Required(TEXT("target_node"),  TEXT("string"), TEXT("Target node ID"))
			.Required(TEXT("target_pin"),   TEXT("string"), TEXT("Target pin name"))
			.Optional(TEXT("graph_name"),   TEXT("string"), TEXT("Graph name (searches all graphs if omitted)"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("disconnect_pins"),
		TEXT("Disconnect a pin on a Blueprint node. If target_node and target_pin are omitted, all connections on the pin are broken."),
		FMonolithActionHandler::CreateStatic(&HandleDisconnectPins),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),   TEXT("Blueprint asset path"))
			.Required(TEXT("node_id"),      TEXT("string"), TEXT("Node ID containing the pin to disconnect"))
			.Required(TEXT("pin_name"),     TEXT("string"), TEXT("Pin name to disconnect"))
			.Optional(TEXT("target_node"),  TEXT("string"), TEXT("Target node ID â€” if provided, only breaks the connection to this specific node"))
			.Optional(TEXT("target_pin"),   TEXT("string"), TEXT("Target pin name â€” required if target_node is specified"))
			.Optional(TEXT("graph_name"),   TEXT("string"), TEXT("Graph name (searches all graphs if omitted)"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("set_pin_default"),
		TEXT("Set the default value of a pin on a Blueprint node."),
		FMonolithActionHandler::CreateStatic(&HandleSetPinDefault),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),  TEXT("Blueprint asset path"))
			.Required(TEXT("node_id"),     TEXT("string"), TEXT("Node ID"))
			.Required(TEXT("pin_name"),    TEXT("string"), TEXT("Pin name"))
			.Required(TEXT("value"),       TEXT("string"),
				TEXT("Default value as string. For class-typed (PC_Class) and object-typed (PC_Object) pins, "
				     "accepts native class names ('APawn'), object/class paths ('/Script/Engine.Pawn'), "
				     "or Blueprint class paths ('/Game/Foo/BP_Bar.BP_Bar_C', or '/Game/Foo/BP_Bar' â€” "
				     "auto-retries with '_C' suffix). Type-constraint-checked against the pin's declared base type."))
			.Optional(TEXT("graph_name"),  TEXT("string"), TEXT("Graph name (searches all graphs if omitted)"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("set_node_position"),
		TEXT("Move a Blueprint graph node to a new position."),
		FMonolithActionHandler::CreateStatic(&HandleSetNodePosition),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),  TEXT("Blueprint asset path"))
			.Required(TEXT("node_id"),     TEXT("string"), TEXT("Node ID"))
			.Required(TEXT("position"),    TEXT("array"),  TEXT("New position as [x, y]"))
			.Optional(TEXT("graph_name"),  TEXT("string"), TEXT("Graph name (searches all graphs if omitted)"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("resolve_node"),
		TEXT("Dry-run node creation â€” returns resolved type, class, function, and all pins with types/defaults/direction without modifying any asset. Useful for discovering what pins a node will have before adding it."),
		FMonolithActionHandler::CreateStatic(&HandleResolveNode),
		FParamSchemaBuilder()
			.Required(TEXT("node_type"),              TEXT("string"), TEXT("Node type: CallFunction, VariableGet, VariableSet, Branch, CustomEvent, ComponentBoundEvent, AddDelegate, RemoveDelegate, ClearDelegate, CallDelegate (same aliases as add_node)"))
			.Optional(TEXT("function_name"),          TEXT("string"), TEXT("Function name for CallFunction nodes"))
			.Optional(TEXT("target_class"),           TEXT("string"), TEXT("Class to search for the function (CallFunction) or delegate (AddDelegate / RemoveDelegate / ClearDelegate / CallDelegate)"))
			.Optional(TEXT("variable_name"),          TEXT("string"), TEXT("Variable name hint for VariableGet/VariableSet (uses wildcard if omitted)"))
			.Optional(TEXT("replication"),            TEXT("string"), TEXT("Replication mode for CustomEvent: none, multicast, server, client"))
			.Optional(TEXT("reliable"),               TEXT("bool"),   TEXT("Use reliable replication for CustomEvent"))
			.OptionalAssetPath(TEXT("asset_path"),             TEXT("Blueprint asset path (required for ComponentBoundEvent and AddDelegate / RemoveDelegate / ClearDelegate / CallDelegate self-context dry-runs)"))
			.Optional(TEXT("component_name"),         TEXT("string"), TEXT("Component variable name for ComponentBoundEvent dry-run"))
			.Optional(TEXT("delegate_property_name"), TEXT("string"), TEXT("Multicast delegate name for ComponentBoundEvent / AddDelegate / RemoveDelegate / ClearDelegate / CallDelegate dry-run"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("batch_execute"),
		TEXT("Execute multiple Blueprint write operations on a single asset in one transaction. Each operation is { \"op\": \"action_name\", ...action_params_minus_asset_path }. Supported ops: add_node, remove_node, connect_pins, disconnect_pins, set_pin_default, set_node_position, add_variable, remove_variable, rename_variable, set_variable_type, set_variable_defaults, add_local_variable, remove_local_variable, add_component, remove_component, rename_component, reparent_component, set_component_property, duplicate_component, add_function, remove_function, rename_function, add_macro, remove_macro, rename_macro, add_event_dispatcher, set_function_params, implement_interface, remove_interface, scaffold_interface_implementation, add_timeline, add_event_node, add_comment_node, promote_pin_to_variable, add_replicated_variable, save_asset."),
		FMonolithActionHandler::CreateStatic(&HandleBatchExecute),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),         TEXT("Blueprint asset path"))
			.Required(TEXT("operations"),          TEXT("array"),   TEXT("Array of operation objects: { op, ...params }"))
			.Optional(TEXT("compile_on_complete"), TEXT("boolean"), TEXT("Compile the Blueprint after all operations complete (default: false)"))
			.Optional(TEXT("stop_on_error"),       TEXT("boolean"), TEXT("Stop processing on first failed operation (default: false)"))
			.Build());

	// ---- Wave 4 ----

	Registry.RegisterAction(TEXT("blueprint"), TEXT("add_nodes_bulk"),
		TEXT("Place multiple nodes in one transaction. Returns a temp_id -> node_id mapping so callers can immediately reference created nodes in connect_pins_bulk. Each entry: { temp_id, node_type, function_name?, target_class?, variable_name?, position? }."),
		FMonolithActionHandler::CreateStatic(&HandleAddNodesBulk),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),  TEXT("Blueprint asset path"))
			.Required(TEXT("nodes"),       TEXT("array"),   TEXT("Array of node descriptors: { temp_id, node_type, function_name?, target_class?, variable_name?, position? }"))
			.Optional(TEXT("graph_name"),  TEXT("string"),  TEXT("Graph name (defaults to EventGraph)"))
			.Optional(TEXT("auto_layout"), TEXT("boolean"), TEXT("Auto-position nodes in a 5-column grid (200px horizontal, 100px vertical spacing). Ignored if position is set per node. Default: false."))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("connect_pins_bulk"),
		TEXT("Wire multiple pin connections in one transaction. Each entry: { source_node, source_pin, target_node, target_pin }. Returns per-connection success/error."),
		FMonolithActionHandler::CreateStatic(&HandleConnectPinsBulk),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),   TEXT("Blueprint asset path"))
			.Required(TEXT("connections"),  TEXT("array"),  TEXT("Array of connection descriptors: { source_node, source_pin, target_node, target_pin }"))
			.Optional(TEXT("graph_name"),   TEXT("string"), TEXT("Graph name (searches all graphs if omitted)"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("set_pin_defaults_bulk"),
		TEXT("Set multiple pin default values in one transaction. Each entry: { node_id, pin_name, value }. Returns per-entry success/error."),
		FMonolithActionHandler::CreateStatic(&HandleSetPinDefaultsBulk),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"), TEXT("Blueprint asset path"))
			.Required(TEXT("defaults"),   TEXT("array"),  TEXT("Array of pin default descriptors: { node_id, pin_name, value }"))
			.Optional(TEXT("graph_name"), TEXT("string"), TEXT("Graph name (searches all graphs if omitted)"))
			.Build());

	// ---- Wave 5 ----

	Registry.RegisterAction(TEXT("blueprint"), TEXT("add_timeline"),
		TEXT("Create a Timeline node in a Blueprint event graph. Handles both the UTimelineTemplate (data) and UK2Node_Timeline (graph node) creation with GUID linkage validation. Only works in event graphs (ubergraph pages), not function graphs."),
		FMonolithActionHandler::CreateStatic(&HandleAddTimeline),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),    TEXT("Blueprint asset path"))
			.Optional(TEXT("timeline_name"), TEXT("string"),  TEXT("Timeline variable name (auto-generated if omitted)"))
			.Optional(TEXT("graph_name"),    TEXT("string"),  TEXT("Event graph name (defaults to EventGraph)"))
			.Optional(TEXT("auto_play"),     TEXT("boolean"), TEXT("Start playing automatically (default: false)"))
			.Optional(TEXT("loop"),          TEXT("boolean"), TEXT("Loop the timeline (default: false)"))
			.Optional(TEXT("position"),      TEXT("array"),   TEXT("Node position as [x, y] (default: [0, 0])"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("add_event_node"),
		TEXT("Add a native override event node (BeginPlay, Tick, EndPlay, etc.) or custom event to a Blueprint event graph. Alias table: BeginPlay->ReceiveBeginPlay, Tick->ReceiveTick, EndPlay->ReceiveEndPlay, BeginOverlap->ReceiveActorBeginOverlap, EndOverlap->ReceiveActorEndOverlap, Hit->ReceiveHit, Destroyed->ReceiveDestroyed, AnyDamage->ReceiveAnyDamage, PointDamage->ReceivePointDamage, RadialDamage->ReceiveRadialDamage."),
		FMonolithActionHandler::CreateStatic(&HandleAddEventNode),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),  TEXT("Blueprint asset path"))
			.Required(TEXT("event_name"),  TEXT("string"), TEXT("Event name: BeginPlay, Tick, EndPlay, BeginOverlap, EndOverlap, Hit, Destroyed, AnyDamage, PointDamage, RadialDamage, or a custom event name"))
			.Optional(TEXT("graph_name"),  TEXT("string"), TEXT("Event graph name (defaults to EventGraph)"))
			.Optional(TEXT("position"),    TEXT("array"),  TEXT("Node position as [x, y] (default: [0, 0])"))
			.Optional(TEXT("replication"), TEXT("string"), TEXT("Replication mode for custom events: none, multicast, server, client (default: none). Ignored for native override events."))
			.Optional(TEXT("reliable"),    TEXT("bool"),   TEXT("Use reliable replication for custom events (default: false). Ignored for native override events."))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("add_comment_node"),
		TEXT("Add a comment box to a Blueprint graph, optionally enclosing a set of nodes. If node_ids is provided, the comment box auto-sizes to contain those nodes with 50px padding."),
		FMonolithActionHandler::CreateStatic(&HandleAddCommentNode),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),  TEXT("Blueprint asset path"))
			.Required(TEXT("text"),        TEXT("string"),  TEXT("Comment box text"))
			.Optional(TEXT("graph_name"),  TEXT("string"),  TEXT("Graph name (defaults to EventGraph)"))
			.Optional(TEXT("node_ids"),    TEXT("array"),   TEXT("Array of node IDs to enclose in the comment box (auto-sizes with 50px padding)"))
			.Optional(TEXT("color"),       TEXT("object"),  TEXT("Comment color as {r, g, b, a} floats 0-1 (default: yellow {r:1, g:1, b:0, a:0.6})"))
			.Optional(TEXT("font_size"),   TEXT("integer"), TEXT("Comment text font size (default: 18)"))
			.Optional(TEXT("position"),    TEXT("array"),   TEXT("Node position as [x, y] â€” overridden if node_ids provided"))
			.Optional(TEXT("width"),       TEXT("integer"), TEXT("Comment box width â€” overridden if node_ids provided"))
			.Optional(TEXT("height"),      TEXT("integer"), TEXT("Comment box height â€” overridden if node_ids provided"))
			.Build());

	// ---- Phase 3A: Timeline read/edit ----

	Registry.RegisterAction(TEXT("blueprint"), TEXT("get_timeline_data"),
		TEXT("Read timeline data from a Blueprint. Returns all UTimelineTemplates with their tracks, keys, and settings. "
		     "Float/vector/color tracks include full keyframe data (time, value, interp_mode). Event tracks include key times."),
		FMonolithActionHandler::CreateStatic(&HandleGetTimelineData),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),     TEXT("Blueprint asset path"))
			.Optional(TEXT("timeline_name"),  TEXT("string"), TEXT("Timeline name to query (returns all timelines if omitted)"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("add_timeline_track"),
		TEXT("Add a track to an existing timeline. Supports float, vector, event, and color track types. "
		     "Creates the backing curve object (UCurveFloat/UCurveVector/UCurveLinearColor) automatically."),
		FMonolithActionHandler::CreateStatic(&HandleAddTimelineTrack),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),     TEXT("Blueprint asset path"))
			.Required(TEXT("timeline_name"),  TEXT("string"), TEXT("Name of the existing timeline"))
			.Required(TEXT("track_name"),     TEXT("string"), TEXT("Name for the new track"))
			.Optional(TEXT("track_type"),     TEXT("string"), TEXT("Track type: float (default), vector, event, or color"))
			.Build());

	Registry.RegisterAction(TEXT("blueprint"), TEXT("set_timeline_keys"),
		TEXT("Set keyframes on a timeline float track's curve. Replaces all existing keys. "
		     "Each key: {time, value, interp_mode?}. interp_mode: linear (default), constant, or cubic."),
		FMonolithActionHandler::CreateStatic(&HandleSetTimelineKeys),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),     TEXT("Blueprint asset path"))
			.Required(TEXT("timeline_name"),  TEXT("string"), TEXT("Name of the timeline"))
			.Required(TEXT("track_name"),     TEXT("string"), TEXT("Name of the float track"))
			.Required(TEXT("keys"),           TEXT("array"),  TEXT("Array of keyframes: [{time, value, interp_mode?}]. interp_mode: linear|constant|cubic"))
			.Build());

	// ---- Wave 7 ----

	Registry.RegisterAction(TEXT("blueprint"), TEXT("promote_pin_to_variable"),
		TEXT("Promote a scalar pin on an existing node to a Blueprint member variable, then create and wire a VariableGet (for output pins) or VariableSet (for input pins) node in its place. "
		     "Supports scalar types only (bool, int, float, double, string, name, text, vector, rotator, transform, object refs, soft refs, enums, structs). "
		     "Container types (Array, Map, Set) are not supported in v1 â€” use add_variable + manual wiring instead."),
		FMonolithActionHandler::CreateStatic(&HandlePromotePinToVariable),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),     TEXT("Blueprint asset path"))
			.Required(TEXT("node_id"),        TEXT("string"), TEXT("Node ID containing the pin to promote"))
			.Required(TEXT("pin_name"),       TEXT("string"), TEXT("Name of the pin to promote to a variable"))
			.Optional(TEXT("variable_name"),  TEXT("string"), TEXT("Name for the new variable (defaults to pin_name)"))
			.Optional(TEXT("graph_name"),     TEXT("string"), TEXT("Graph name (searches all graphs if omitted)"))
			.Build());

	// ---- Phase 1 (gap #11): cross-class property access ----

	Registry.RegisterAction(TEXT("blueprint"), TEXT("add_property_access"),
		TEXT("Author a VariableGet (or VariableSet if is_setter) node that reads/writes a UPROPERTY on an ARBITRARY foreign class â€” "
		     "not just the Blueprint's own variables. member_class is resolved by string (FindFirstObject, native-first; accepts U/A prefix or bare name), "
		     "then VariableReference.SetExternalMember() binds the member so the node's value pin resolves to the property's real type. "
		     "Unlike node_type='VariableGet' (which is self-context only and produces a wildcard 0-pin node for foreign properties), this binds the external class correctly. "
		     "Returns node_id plus value_pin_id and target_pin_id (the object/self input the caller must wire via connect_pins to supply the instance to read/write)."),
		FMonolithActionHandler::CreateStatic(&HandleAddPropertyAccess),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),  TEXT("Blueprint asset path"))
			.Required(TEXT("member_class"), TEXT("string"), TEXT("Class that owns the property (e.g. 'Item', 'UItem', 'AActor'). Resolved by string, native-first; accepts U/A prefix or bare name."), {TEXT("target_class")})
			.Required(TEXT("member_name"), TEXT("string"),  TEXT("Name of the UPROPERTY to read/write (e.g. 'Icon')"))
			.Optional(TEXT("graph_name"),  TEXT("string"),  TEXT("Graph name (defaults to EventGraph)"))
			.Optional(TEXT("is_setter"),   TEXT("bool"),    TEXT("If true, creates a VariableSet (write) node; otherwise a VariableGet (read) node. Default: false."))
			.Optional(TEXT("position"),    TEXT("array"),   TEXT("Node position as [x, y] (default: [0, 0])"))
			.Build());

	// ---- Genuine thread-safe Property Access (real UK2Node_PropertyAccess) ----

	Registry.RegisterAction(TEXT("blueprint"), TEXT("add_property_access_node"),
		TEXT("Author a GENUINE thread-safe Property Access node (UK2Node_PropertyAccess) into a Blueprint/AnimBP graph. "
		     "Unlike add_property_access (which emits a foreign-member VariableGet with a 'self' object pin â€” itself NON-thread-safe "
		     "and the cause of 'Accessing an object reference is not thread-safe' errors), this spawns the real Property Access node. "
		     "Its path-based read is resolved by the AnimBP property-access compiler either directly (when thread-safe) or via a "
		     "game-thread-cached copy â€” so the resulting graph compiles thread-safe-clean. "
		     "The node class is MinimalAPI/unlinkable (its header lives in PropertyAccessNode/Private), so it is created REFLECTIVELY "
		     "(LoadClass + NewObject<UK2Node>), exactly like the EvaluateChooser2 surgery. "
		     "'path' is the verbatim resolution chain: element 0 is a member/function on the access root (e.g. the AnimInstance's own "
		     "member struct variable 'CharacterProperties', or a thread-safe function like 'GetDeltaSeconds'); subsequent elements are "
		     "struct field internal names (for a UserDefinedStruct field, the GUID-suffixed name e.g. 'Velocity_19_<GUID>'). "
		     "The path is set reflectively then AllocateDefaultPins resolves the leaf type and creates the single output pin named 'Value'. "
		     "Returns node_id and value_pin_name ('Value'). Requires the PropertyAccessNode editor module (present in any editor build)."),
		FMonolithActionHandler::CreateStatic(&HandleAddPropertyAccessNode),
		FParamSchemaBuilder()
			.RequiredAssetPath(TEXT("asset_path"),  TEXT("Blueprint / Animation Blueprint asset path"))
			.Required(TEXT("path"), TEXT("array"), TEXT("Verbatim resolution chain (array of strings). Element 0 = member/function on the access root (e.g. 'CharacterProperties' or 'GetDeltaSeconds'); subsequent elements = struct field internal names (GUID-suffixed for UserDefinedStruct fields)."))
			.Optional(TEXT("graph_name"),  TEXT("string"), TEXT("Target graph/function name. Defaults to the first ubergraph if omitted; pass a function name (e.g. 'BlueprintThreadSafeUpdateAnimation' or 'UpdateEssentialValues') to author into that function graph."), {TEXT("target_graph"), TEXT("function_name")})
			.Optional(TEXT("context_id"),  TEXT("string"), TEXT("Optional Property Access ContextId (FName). Leave empty for the default unbatched worker-thread context (matches the Game Animation Sample)."))
			.Optional(TEXT("position"),    TEXT("array"),  TEXT("Node position as [x, y] (default: [0, 0])"))
			.Build());
}

// ============================================================
//  add_node
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleAddNode(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString NodeType = Params->GetStringField(TEXT("node_type"));
	if (NodeType.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: node_type"));
	}

	// Normalize aliases to canonical node type names (shared map from 1G)
	{
		FString Lower = NodeType.ToLower();
		const auto& Aliases = GetNodeAliases();
		if (const FNodeAlias* Alias = Aliases.Find(Lower))
		{
			NodeType = Alias->CanonicalType;
			// Merge default params â€” only if the caller didn't already set them (1A)
			for (const auto& KV : Alias->DefaultParams)
			{
				if (!Params->HasField(KV.Key))
				{
					Params->SetStringField(KV.Key, KV.Value);
				}
			}
		}
	}

	FString GraphName = Params->GetStringField(TEXT("graph_name"));
	UEdGraph* Graph = MonolithBlueprintInternal::FindGraphByName(BP, GraphName);
	if (!Graph)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Graph not found: %s"), GraphName.IsEmpty() ? TEXT("EventGraph") : *GraphName));
	}

	// Parse position
	int32 PosX = 0;
	int32 PosY = 0;
	const TArray<TSharedPtr<FJsonValue>>* PosArray = nullptr;
	if (Params->TryGetArrayField(TEXT("position"), PosArray) && PosArray && PosArray->Num() >= 2)
	{
		PosX = (int32)(*PosArray)[0]->AsNumber();
		PosY = (int32)(*PosArray)[1]->AsNumber();
	}

	UEdGraphNode* NewNode = nullptr;
	bool bGenericFallback = false;

	// ---- CallFunction ----
	if (NodeType == TEXT("CallFunction"))
	{
		FString FuncName = Params->GetStringField(TEXT("function_name"));
		if (FuncName.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("CallFunction node requires 'function_name'"));
		}

		FString TargetClassName = Params->GetStringField(TEXT("target_class"));

		UK2Node_CallFunction* CallNode = NewObject<UK2Node_CallFunction>(Graph);

		// Build list of function name variants to try:
		// Blueprint-callable wrappers use K2_ prefix (e.g. GetActorLocation â†’ K2_GetActorLocation)
		TArray<FName> FuncNameCandidates;
		FuncNameCandidates.Add(FName(*FuncName));
		if (!FuncName.StartsWith(TEXT("K2_")))
		{
			FuncNameCandidates.Add(FName(*FString::Printf(TEXT("K2_%s"), *FuncName)));
		}

		UFunction* Func = nullptr;
		if (!TargetClassName.IsEmpty())
		{
			// Resolve class name â€” try as-is, with U prefix, and without U prefix
			UClass* TargetClass = FindFirstObject<UClass>(*TargetClassName, EFindFirstObjectOptions::NativeFirst);
			if (!TargetClass && !TargetClassName.StartsWith(TEXT("U")))
				TargetClass = FindFirstObject<UClass>(*FString::Printf(TEXT("U%s"), *TargetClassName), EFindFirstObjectOptions::NativeFirst);
			if (!TargetClass && TargetClassName.StartsWith(TEXT("U")))
				TargetClass = FindFirstObject<UClass>(*TargetClassName.Mid(1), EFindFirstObjectOptions::NativeFirst);

			if (TargetClass)
			{
				// FindFunctionByName searches the full inheritance chain by default
				for (const FName& Candidate : FuncNameCandidates)
				{
					Func = TargetClass->FindFunctionByName(Candidate);
					if (Func) break;
				}
			}
			if (!Func)
			{
				return FMonolithActionResult::Error(FString::Printf(
					TEXT("Function '%s' not found on class '%s' (also tried K2_ prefix). Ensure the function is BlueprintCallable."),
					*FuncName, *TargetClassName));
			}
		}
		else
		{
			// Widget Blueprints bias toward UWidget-derived owners so name
			// collisions (e.g. SetVisibility) resolve to the UMG widget the
			// author meant rather than an arbitrary first-match engine class.
			Func = FindFunctionAcrossLoadedClasses(FuncNameCandidates, IsWidgetBlueprintContext(BP));
			if (!Func)
			{
				return FMonolithActionResult::Error(FString::Printf(
					TEXT("Function '%s' not found in any loaded class (also tried K2_ prefix)"), *FuncName));
			}
		}

		CallNode->SetFromFunction(Func);
		CallNode->NodePosX = PosX;
		CallNode->NodePosY = PosY;
		Graph->AddNode(CallNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		CallNode->AllocateDefaultPins();
		NewNode = CallNode;
	}
	// ---- VariableGet ----
	else if (NodeType == TEXT("VariableGet"))
	{
		FString VarName = Params->GetStringField(TEXT("variable_name"));
		if (VarName.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("VariableGet node requires 'variable_name'"));
		}

		UK2Node_VariableGet* VarNode = NewObject<UK2Node_VariableGet>(Graph);
		VarNode->VariableReference.SetSelfMember(FName(*VarName));
		VarNode->NodePosX = PosX;
		VarNode->NodePosY = PosY;
		Graph->AddNode(VarNode, true, false);
		VarNode->AllocateDefaultPins();
		NewNode = VarNode;
	}
	// ---- VariableSet ----
	else if (NodeType == TEXT("VariableSet"))
	{
		FString VarName = Params->GetStringField(TEXT("variable_name"));
		if (VarName.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("VariableSet node requires 'variable_name'"));
		}

		UK2Node_VariableSet* VarNode = NewObject<UK2Node_VariableSet>(Graph);
		VarNode->VariableReference.SetSelfMember(FName(*VarName));
		VarNode->NodePosX = PosX;
		VarNode->NodePosY = PosY;
		Graph->AddNode(VarNode, true, false);
		VarNode->AllocateDefaultPins();
		NewNode = VarNode;
	}
	// ---- CustomEvent ----
	else if (NodeType == TEXT("CustomEvent"))
	{
		FString EventName = Params->GetStringField(TEXT("event_name"));
		if (EventName.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("CustomEvent node requires 'event_name'"));
		}

		if (MonolithBlueprintInternal::HasCustomEventNamed(BP, FName(*EventName)))
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("A custom event named '%s' already exists in this Blueprint"), *EventName));
		}

		UK2Node_CustomEvent* EventNode = NewObject<UK2Node_CustomEvent>(Graph);
		EventNode->CustomFunctionName = FName(*EventName);
		EventNode->NodePosX = PosX;
		EventNode->NodePosY = PosY;
		Graph->AddNode(EventNode, true, false);
		EventNode->AllocateDefaultPins();

		// RPC / Multicast replication flags (Phase 5A)
		bool bNetFlagsChanged = false;
		FString Replication;
		if (Params->TryGetStringField(TEXT("replication"), Replication) && !Replication.IsEmpty() && Replication != TEXT("none"))
		{
			const uint32 FlagsToClear = FUNC_Net | FUNC_NetMulticast | FUNC_NetServer | FUNC_NetClient;
			EventNode->FunctionFlags &= ~FlagsToClear;

			uint32 NetFlag = 0;
			FString RepLower = Replication.ToLower();
			if (RepLower == TEXT("multicast"))      NetFlag = FUNC_NetMulticast;
			else if (RepLower == TEXT("server"))    NetFlag = FUNC_NetServer;
			else if (RepLower == TEXT("client"))    NetFlag = FUNC_NetClient;

			if (NetFlag != 0)
			{
				EventNode->FunctionFlags |= (FUNC_Net | NetFlag);
				bNetFlagsChanged = true;
			}
		}

		bool bReliable = false;
		if (Params->TryGetBoolField(TEXT("reliable"), bReliable) && bReliable)
		{
			EventNode->FunctionFlags |= FUNC_NetReliable;
			bNetFlagsChanged = true;
		}

		if (bNetFlagsChanged)
		{
			FBlueprintEditorUtils::MarkBlueprintAsStructurallyModified(BP);
		}

		NewNode = EventNode;
	}
	// ---- Branch ----
	else if (NodeType == TEXT("Branch"))
	{
		UK2Node_IfThenElse* BranchNode = NewObject<UK2Node_IfThenElse>(Graph);
		BranchNode->NodePosX = PosX;
		BranchNode->NodePosY = PosY;
		Graph->AddNode(BranchNode, true, false);
		BranchNode->AllocateDefaultPins();
		NewNode = BranchNode;
	}
	// ---- Sequence ----
	else if (NodeType == TEXT("Sequence"))
	{
		UK2Node_ExecutionSequence* SeqNode = NewObject<UK2Node_ExecutionSequence>(Graph);
		SeqNode->NodePosX = PosX;
		SeqNode->NodePosY = PosY;
		Graph->AddNode(SeqNode, true, false);
		SeqNode->AllocateDefaultPins();
		NewNode = SeqNode;
	}
	// ---- MacroInstance ----
	else if (NodeType == TEXT("MacroInstance"))
	{
		FString MacroName = Params->GetStringField(TEXT("macro_name"));
		if (MacroName.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("MacroInstance node requires 'macro_name'"));
		}

		// Resolve the macro graph â€” search current BP first, then optional macro_blueprint
		UEdGraph* MacroGraph = nullptr;
		FString MacroBPPath = Params->GetStringField(TEXT("macro_blueprint"));
		if (!MacroBPPath.IsEmpty())
		{
			UBlueprint* MacroBP = FMonolithAssetUtils::LoadAssetByPath<UBlueprint>(MacroBPPath);
			if (MacroBP)
			{
				for (const auto& MG : MacroBP->MacroGraphs)
				{
					if (MG && MG->GetName() == MacroName)
					{
						MacroGraph = MG;
						break;
					}
				}
			}
			if (!MacroGraph)
			{
				return FMonolithActionResult::Error(FString::Printf(
					TEXT("Macro '%s' not found in blueprint '%s'"), *MacroName, *MacroBPPath));
			}
		}
		else
		{
			for (const auto& MG : BP->MacroGraphs)
			{
				if (MG && MG->GetName() == MacroName)
				{
					MacroGraph = MG;
					break;
				}
			}
			if (!MacroGraph)
			{
				return FMonolithActionResult::Error(FString::Printf(
					TEXT("Macro '%s' not found in this Blueprint. Provide 'macro_blueprint' if it's in another BP."), *MacroName));
			}
		}

		UK2Node_MacroInstance* MacroNode = NewObject<UK2Node_MacroInstance>(Graph);
		MacroNode->SetMacroGraph(MacroGraph);
		MacroNode->NodePosX = PosX;
		MacroNode->NodePosY = PosY;
		Graph->AddNode(MacroNode, true, false);
		MacroNode->AllocateDefaultPins();
		NewNode = MacroNode;
	}
	// ---- SpawnActorFromClass ----
	else if (NodeType == TEXT("SpawnActorFromClass"))
	{
		FString ActorClassName = Params->GetStringField(TEXT("actor_class"));
		if (ActorClassName.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("SpawnActorFromClass node requires 'actor_class'"));
		}

		UClass* ActorClass = FindFirstObject<UClass>(*ActorClassName, EFindFirstObjectOptions::NativeFirst);
		if (!ActorClass)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("Actor class not found: %s"), *ActorClassName));
		}

		UK2Node_SpawnActorFromClass* SpawnNode = NewObject<UK2Node_SpawnActorFromClass>(Graph);
		SpawnNode->NodePosX = PosX;
		SpawnNode->NodePosY = PosY;
		Graph->AddNode(SpawnNode, true, false);
		SpawnNode->AllocateDefaultPins();

		// Set the class pin default
		UEdGraphPin* ClassPin = SpawnNode->GetClassPin();
		if (ClassPin)
		{
			ClassPin->DefaultObject = ActorClass;
		}

		NewNode = SpawnNode;
	}
	// ---- DynamicCast ----
	else if (NodeType == TEXT("DynamicCast"))
	{
		// Accept cast_class as the primary param; actor_class is the deprecated fallback
		FString CastClassName = Params->GetStringField(TEXT("cast_class"));
		if (CastClassName.IsEmpty())
		{
			CastClassName = Params->GetStringField(TEXT("actor_class"));
		}
		if (CastClassName.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("DynamicCast node requires 'cast_class' (e.g. cast_class=MyPawn)"));
		}

		UClass* CastClass = FindFirstObject<UClass>(*CastClassName, EFindFirstObjectOptions::NativeFirst);
		if (!CastClass && !CastClassName.StartsWith(TEXT("A")))
			CastClass = FindFirstObject<UClass>(*FString::Printf(TEXT("A%s"), *CastClassName), EFindFirstObjectOptions::NativeFirst);
		if (!CastClass && !CastClassName.StartsWith(TEXT("U")))
			CastClass = FindFirstObject<UClass>(*FString::Printf(TEXT("U%s"), *CastClassName), EFindFirstObjectOptions::NativeFirst);
		if (!CastClass)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("Class not found for DynamicCast: '%s'"), *CastClassName));
		}

		UK2Node_DynamicCast* CastNode = NewObject<UK2Node_DynamicCast>(Graph);
		CastNode->TargetType = CastClass;
		CastNode->NodePosX = PosX;
		CastNode->NodePosY = PosY;
		Graph->AddNode(CastNode, true, false);
		CastNode->AllocateDefaultPins();
		NewNode = CastNode;
	}
	// ---- MakeStruct ----
	else if (NodeType == TEXT("MakeStruct"))
	{
		FString StructType = Params->GetStringField(TEXT("struct_type"));
		if (StructType.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("MakeStruct node requires 'struct_type' (e.g. struct_type=Vector)"));
		}

		UScriptStruct* FoundStruct = FindFirstObject<UScriptStruct>(*StructType, EFindFirstObjectOptions::NativeFirst);
		if (!FoundStruct && !StructType.StartsWith(TEXT("F")))
			FoundStruct = FindFirstObject<UScriptStruct>(*FString::Printf(TEXT("F%s"), *StructType), EFindFirstObjectOptions::NativeFirst);
		if (!FoundStruct)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("Struct not found for MakeStruct: '%s' (also tried 'F%s')"), *StructType, *StructType));
		}

		UK2Node_MakeStruct* StructNode = NewObject<UK2Node_MakeStruct>(Graph);
		StructNode->StructType = FoundStruct;
		StructNode->NodePosX = PosX;
		StructNode->NodePosY = PosY;
		Graph->AddNode(StructNode, true, false);
		StructNode->AllocateDefaultPins();
		NewNode = StructNode;
	}
	// ---- BreakStruct ----
	else if (NodeType == TEXT("BreakStruct"))
	{
		FString StructType = Params->GetStringField(TEXT("struct_type"));
		if (StructType.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("BreakStruct node requires 'struct_type' (e.g. struct_type=Vector)"));
		}

		UScriptStruct* FoundStruct = FindFirstObject<UScriptStruct>(*StructType, EFindFirstObjectOptions::NativeFirst);
		if (!FoundStruct && !StructType.StartsWith(TEXT("F")))
			FoundStruct = FindFirstObject<UScriptStruct>(*FString::Printf(TEXT("F%s"), *StructType), EFindFirstObjectOptions::NativeFirst);
		if (!FoundStruct)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("Struct not found for BreakStruct: '%s' (also tried 'F%s')"), *StructType, *StructType));
		}

		UK2Node_BreakStruct* BreakNode = NewObject<UK2Node_BreakStruct>(Graph);
		BreakNode->StructType = FoundStruct;
		BreakNode->NodePosX = PosX;
		BreakNode->NodePosY = PosY;
		Graph->AddNode(BreakNode, true, false);
		BreakNode->AllocateDefaultPins();
		NewNode = BreakNode;
	}
	// ---- SwitchOnEnum ----
	else if (NodeType == TEXT("SwitchOnEnum"))
	{
		FString EnumType = Params->GetStringField(TEXT("enum_type"));
		if (EnumType.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("SwitchOnEnum node requires 'enum_type' (e.g. enum_type=ECollisionChannel)"));
		}

		UEnum* FoundEnum = FindFirstObject<UEnum>(*EnumType, EFindFirstObjectOptions::NativeFirst);
		if (!FoundEnum && !EnumType.StartsWith(TEXT("E")))
			FoundEnum = FindFirstObject<UEnum>(*FString::Printf(TEXT("E%s"), *EnumType), EFindFirstObjectOptions::NativeFirst);
		if (!FoundEnum)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("Enum not found for SwitchOnEnum: '%s' (also tried 'E%s')"), *EnumType, *EnumType));
		}

		UK2Node_SwitchEnum* SwitchNode = NewObject<UK2Node_SwitchEnum>(Graph);
		SwitchNode->SetEnum(FoundEnum);
		SwitchNode->NodePosX = PosX;
		SwitchNode->NodePosY = PosY;
		Graph->AddNode(SwitchNode, true, false);
		SwitchNode->AllocateDefaultPins();
		NewNode = SwitchNode;
	}
	// ---- SwitchOnInt ----
	else if (NodeType == TEXT("SwitchOnInt"))
	{
		UK2Node_SwitchInteger* SwitchNode = NewObject<UK2Node_SwitchInteger>(Graph);
		SwitchNode->NodePosX = PosX;
		SwitchNode->NodePosY = PosY;
		Graph->AddNode(SwitchNode, true, false);
		SwitchNode->AllocateDefaultPins();
		NewNode = SwitchNode;
	}
	// ---- SwitchOnString ----
	else if (NodeType == TEXT("SwitchOnString"))
	{
		UK2Node_SwitchString* SwitchNode = NewObject<UK2Node_SwitchString>(Graph);
		SwitchNode->NodePosX = PosX;
		SwitchNode->NodePosY = PosY;
		Graph->AddNode(SwitchNode, true, false);
		SwitchNode->AllocateDefaultPins();
		NewNode = SwitchNode;
	}
	// ---- FormatText ----
	else if (NodeType == TEXT("FormatText"))
	{
		UK2Node_FormatText* FormatNode = NewObject<UK2Node_FormatText>(Graph);
		FormatNode->NodePosX = PosX;
		FormatNode->NodePosY = PosY;
		Graph->AddNode(FormatNode, true, false);
		FormatNode->AllocateDefaultPins();

		FString FormatStr = Params->GetStringField(TEXT("format"));
		if (!FormatStr.IsEmpty())
		{
			UEdGraphPin* FormatPin = FormatNode->GetFormatPin();
			if (FormatPin)
			{
				FormatPin->DefaultTextValue = FText::FromString(FormatStr);
				FormatNode->PinDefaultValueChanged(FormatPin);
			}
		}
		NewNode = FormatNode;
	}
	// ---- MakeArray ----
	else if (NodeType == TEXT("MakeArray"))
	{
		UK2Node_MakeArray* ArrayNode = NewObject<UK2Node_MakeArray>(Graph);
		ArrayNode->NodePosX = PosX;
		ArrayNode->NodePosY = PosY;
		Graph->AddNode(ArrayNode, true, false);
		ArrayNode->AllocateDefaultPins();

		int32 NumEntries = 1;
		if (Params->HasField(TEXT("num_entries")))
		{
			NumEntries = FMath::Max(1, (int32)Params->GetNumberField(TEXT("num_entries")));
		}
		// AllocateDefaultPins creates 1 input by default, add extras
		for (int32 i = 1; i < NumEntries; ++i)
		{
			ArrayNode->AddInputPin();
		}
		NewNode = ArrayNode;
	}
	// ---- Select ----
	else if (NodeType == TEXT("Select"))
	{
		UK2Node_Select* SelectNode = NewObject<UK2Node_Select>(Graph);
		SelectNode->NodePosX = PosX;
		SelectNode->NodePosY = PosY;
		Graph->AddNode(SelectNode, true, false);
		SelectNode->AllocateDefaultPins();
		NewNode = SelectNode;
	}
	// ---- Self ----
	else if (NodeType == TEXT("Self"))
	{
		UK2Node_Self* SelfNode = NewObject<UK2Node_Self>(Graph);
		SelfNode->NodePosX = PosX;
		SelfNode->NodePosY = PosY;
		Graph->AddNode(SelfNode, true, false);
		SelfNode->AllocateDefaultPins();
		NewNode = SelfNode;
	}
	// ---- Return (FunctionResult) ----
	else if (NodeType == TEXT("Return"))
	{
		// Return nodes only make sense inside function graphs
		bool bIsInFunctionGraph = false;
		for (const auto& FG : BP->FunctionGraphs)
		{
			if (FG == Graph)
			{
				bIsInFunctionGraph = true;
				break;
			}
		}
		if (!bIsInFunctionGraph)
		{
			return FMonolithActionResult::Error(TEXT("Return nodes can only be added to function graphs, not event graphs"));
		}
		UK2Node_FunctionResult* ReturnNode = NewObject<UK2Node_FunctionResult>(Graph);
		ReturnNode->NodePosX = PosX;
		ReturnNode->NodePosY = PosY;
		Graph->AddNode(ReturnNode, true, false);
		ReturnNode->AllocateDefaultPins();
		NewNode = ReturnNode;
	}
	// ---- ComponentBoundEvent ----
	// Emits the green event-entry node spawned by clicking "+" next to a
	// component delegate in Designer. Inherits from K2Node_Event; the abbreviated
	// spawn pattern (no PostPlacedNewNode / CreateNewGuid) is sufficient because
	// K2Node_ComponentBoundEvent does not override either method in UE 5.7.
	else if (NodeType == TEXT("ComponentBoundEvent"))
	{
		FString CompNameStr = Params->GetStringField(TEXT("component_name"));
		FString DelegateNameStr = Params->GetStringField(TEXT("delegate_property_name"));
		if (CompNameStr.IsEmpty() || DelegateNameStr.IsEmpty())
		{
			return FMonolithActionResult::Error(
				TEXT("ComponentBoundEvent requires 'component_name' and 'delegate_property_name'"));
		}

		FObjectProperty* CompProp = MonolithBlueprintInternal::FindComponentProperty(BP, FName(*CompNameStr));
		if (!CompProp)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("Component variable '%s' not found on Blueprint '%s' (must be a named subobject on the BP â€” SCS component for Actor BPs, named widget for UMG BPs)"),
				*CompNameStr, *BP->GetName()));
		}

		FMulticastDelegateProperty* DelegateProp = MonolithBlueprintInternal::FindMulticastDelegateProperty(
			CompProp->PropertyClass, FName(*DelegateNameStr));
		if (!DelegateProp)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("BlueprintAssignable multicast delegate '%s' not found on class '%s'"),
				*DelegateNameStr, *CompProp->PropertyClass->GetName()));
		}

		// Reject duplicates BP-wide. Engine's CanPasteHere uses
		// FindBoundEventForComponent (Blueprint scope, all graphs); match that
		// or callers will hit a hard compile error after authoring.
		if (const UK2Node_ComponentBoundEvent* ExBound =
			FKismetEditorUtilities::FindBoundEventForComponent(BP, FName(*DelegateNameStr), FName(*CompNameStr)))
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("ComponentBoundEvent for '%s.%s' already exists in this Blueprint (node: %s)"),
				*CompNameStr, *DelegateNameStr, *ExBound->GetName()));
		}

		UK2Node_ComponentBoundEvent* BoundNode = NewObject<UK2Node_ComponentBoundEvent>(Graph);
		BoundNode->InitializeComponentBoundEventParams(CompProp, DelegateProp);
		BoundNode->NodePosX = PosX;
		BoundNode->NodePosY = PosY;
		Graph->AddNode(BoundNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		BoundNode->AllocateDefaultPins();

		NewNode = BoundNode;
	}
	// ---- AddDelegate ----
	// "Bind Event to <DelegateProperty>" graph node. Caller wires the resulting
	// node's "Delegate" pin to a CustomEvent's OutputDelegate pin via connect_pins
	// in a follow-up call (or via add_nodes_bulk + connect_pins_bulk).
	else if (NodeType == TEXT("AddDelegate"))
	{
		UClass* OwnerClass = nullptr;
		FMulticastDelegateProperty* DelegateProp = nullptr;
		bool bSelfContext = false;
		FMonolithActionResult Resolved = MonolithBlueprintInternal::ResolveDelegateOwnerAndProperty(
			Params, BP->GeneratedClass, TEXT("AddDelegate"),
			OwnerClass, DelegateProp, bSelfContext);
		if (!Resolved.bSuccess) return Resolved;

		UK2Node_AddDelegate* AddNode = NewObject<UK2Node_AddDelegate>(Graph);
		AddNode->SetFromProperty(DelegateProp, bSelfContext, DelegateProp->GetOwnerClass());
		AddNode->NodePosX = PosX;
		AddNode->NodePosY = PosY;
		Graph->AddNode(AddNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		AddNode->AllocateDefaultPins();

		NewNode = AddNode;
	}
	// ---- RemoveDelegate ----
	// "Unbind Event from <DelegateProperty>" graph node. Removes a previously
	// bound event at runtime. Same shape as AddDelegate â€” caller wires the node's
	// "Delegate" pin to the CustomEvent that was previously bound.
	else if (NodeType == TEXT("RemoveDelegate"))
	{
		UClass* OwnerClass = nullptr;
		FMulticastDelegateProperty* DelegateProp = nullptr;
		bool bSelfContext = false;
		FMonolithActionResult Resolved = MonolithBlueprintInternal::ResolveDelegateOwnerAndProperty(
			Params, BP->GeneratedClass, TEXT("RemoveDelegate"),
			OwnerClass, DelegateProp, bSelfContext);
		if (!Resolved.bSuccess) return Resolved;

		UK2Node_RemoveDelegate* RemoveNode = NewObject<UK2Node_RemoveDelegate>(Graph);
		RemoveNode->SetFromProperty(DelegateProp, bSelfContext, DelegateProp->GetOwnerClass());
		RemoveNode->NodePosX = PosX;
		RemoveNode->NodePosY = PosY;
		Graph->AddNode(RemoveNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		RemoveNode->AllocateDefaultPins();

		NewNode = RemoveNode;
	}
	// ---- ClearDelegate ----
	// "Unbind all Events from <DelegateProperty>" graph node. Removes every
	// listener at runtime in one call. Same shape as AddDelegate but binds
	// no event reference.
	else if (NodeType == TEXT("ClearDelegate"))
	{
		UClass* OwnerClass = nullptr;
		FMulticastDelegateProperty* DelegateProp = nullptr;
		bool bSelfContext = false;
		FMonolithActionResult Resolved = MonolithBlueprintInternal::ResolveDelegateOwnerAndProperty(
			Params, BP->GeneratedClass, TEXT("ClearDelegate"),
			OwnerClass, DelegateProp, bSelfContext);
		if (!Resolved.bSuccess) return Resolved;

		UK2Node_ClearDelegate* ClearNode = NewObject<UK2Node_ClearDelegate>(Graph);
		ClearNode->SetFromProperty(DelegateProp, bSelfContext, DelegateProp->GetOwnerClass());
		ClearNode->NodePosX = PosX;
		ClearNode->NodePosY = PosY;
		Graph->AddNode(ClearNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		ClearNode->AllocateDefaultPins();

		NewNode = ClearNode;
	}
	// ---- CallDelegate ----
	// "Call <DelegateProperty>" graph node â€” broadcasts a multicast delegate
	// to all bound listeners. Used when the dispatcher itself is BP-resident
	// (i.e. the broadcast site is in a Blueprint, not C++). Spawned node has
	// one input pin per delegate signature parameter; caller wires payload
	// values via set_pin_default / connect_pins as needed.
	else if (NodeType == TEXT("CallDelegate"))
	{
		UClass* OwnerClass = nullptr;
		FMulticastDelegateProperty* DelegateProp = nullptr;
		bool bSelfContext = false;
		FMonolithActionResult Resolved = MonolithBlueprintInternal::ResolveDelegateOwnerAndProperty(
			Params, BP->GeneratedClass, TEXT("CallDelegate"),
			OwnerClass, DelegateProp, bSelfContext);
		if (!Resolved.bSuccess) return Resolved;

		UK2Node_CallDelegate* CallNode = NewObject<UK2Node_CallDelegate>(Graph);
		CallNode->SetFromProperty(DelegateProp, bSelfContext, DelegateProp->GetOwnerClass());
		CallNode->NodePosX = PosX;
		CallNode->NodePosY = PosY;
		Graph->AddNode(CallNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		CallNode->AllocateDefaultPins();

		NewNode = CallNode;
	}
	else
	{
		// Generic K2Node fallback â€” try to find any UK2Node subclass by name
		// UObject names strip the U/A prefix, so "UK2Node_InputAction" is stored as "K2Node_InputAction"
		FString WithoutPrefix = FString::Printf(TEXT("K2Node_%s"), *NodeType);
		UClass* NodeClass = FindFirstObject<UClass>(*WithoutPrefix, EFindFirstObjectOptions::NativeFirst);
		if (!NodeClass)
		{
			// Try with U prefix (in case it works on some platforms)
			FString WithPrefix = FString::Printf(TEXT("UK2Node_%s"), *NodeType);
			NodeClass = FindFirstObject<UClass>(*WithPrefix, EFindFirstObjectOptions::NativeFirst);
		}
		if (!NodeClass)
		{
			// Try exact name as given (caller may have passed "K2Node_InputAction" directly)
			NodeClass = FindFirstObject<UClass>(*NodeType, EFindFirstObjectOptions::NativeFirst);
		}
		if (!NodeClass && NodeType.StartsWith(TEXT("U")))
		{
			// Strip U prefix if caller included it (e.g., "UK2Node_DoOnce" â†’ "K2Node_DoOnce")
			NodeClass = FindFirstObject<UClass>(*NodeType.Mid(1), EFindFirstObjectOptions::NativeFirst);
		}

		if (NodeClass && NodeClass->IsChildOf(UK2Node::StaticClass()))
		{
			UK2Node* GenericNode = NewObject<UK2Node>(Graph, NodeClass);
			GenericNode->NodePosX = PosX;
			GenericNode->NodePosY = PosY;
			Graph->AddNode(GenericNode, true, false);
			GenericNode->AllocateDefaultPins();
			NewNode = GenericNode;

			// Flag so we can add a warning to the response
			bGenericFallback = true;
		}
		else
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("Unknown node_type '%s'. Supported types: CallFunction, VariableGet, VariableSet, CustomEvent, Branch, Sequence, MacroInstance, SpawnActorFromClass, DynamicCast, Self, Return, MakeStruct, BreakStruct, SwitchOnEnum, SwitchOnInt, SwitchOnString, FormatText, MakeArray, Select, ComponentBoundEvent, AddDelegate, RemoveDelegate, ClearDelegate, CallDelegate. Also accepts any UK2Node_ class name as generic fallback."),
				*NodeType));
		}
	}

	if (!NewNode)
	{
		return FMonolithActionResult::Error(TEXT("Failed to create node â€” NewObject returned null"));
	}

	// Gap #15: every authored K2Node must carry a valid NodeGuid, else UE's cook path
	// warns "missing NodeGuid ... deterministic cooking issues". All node-type branches
	// converge here, so a single CreateNewGuid covers them all.
	NewNode->CreateNewGuid();

	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedPtr<FJsonObject> Root = MonolithBlueprintInternal::SerializeNode(NewNode);
	Root->SetStringField(TEXT("asset_path"), AssetPath);
	Root->SetStringField(TEXT("graph"), Graph->GetName());
	if (bGenericFallback)
	{
		Root->SetStringField(TEXT("warning"),
			TEXT("Created via generic K2Node fallback â€” node may require additional configuration via set_pin_default or dedicated handler"));
	}
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  add_property_access  (Phase 1, gap #11)
//
//  Authors a VariableGet/VariableSet bound to a UPROPERTY on an
//  ARBITRARY foreign class. The plain add_node VariableGet branch
//  hardcodes SetSelfMember (self-context), which yields a 0-pin
//  wildcard node for foreign-class properties. Here we resolve the
//  member's owning class by string (same FindFirstObject mechanism
//  CallFunction uses) and call SetExternalMember BEFORE
//  AllocateDefaultPins so the pin types resolve from the member ref.
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleAddPropertyAccess(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	const FString MemberClassName = Params->GetStringField(TEXT("member_class"));
	if (MemberClassName.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("add_property_access requires 'member_class'"));
	}

	const FString MemberName = Params->GetStringField(TEXT("member_name"));
	if (MemberName.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("add_property_access requires 'member_name'"));
	}

	bool bIsSetter = false;
	Params->TryGetBoolField(TEXT("is_setter"), bIsSetter);

	const FString GraphName = Params->GetStringField(TEXT("graph_name"));
	UEdGraph* Graph = MonolithBlueprintInternal::FindGraphByName(BP, GraphName);
	if (!Graph)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Graph not found: %s"), GraphName.IsEmpty() ? TEXT("EventGraph") : *GraphName));
	}

	// Parse position
	int32 PosX = 0;
	int32 PosY = 0;
	const TArray<TSharedPtr<FJsonValue>>* PosArray = nullptr;
	if (Params->TryGetArrayField(TEXT("position"), PosArray) && PosArray && PosArray->Num() >= 2)
	{
		PosX = (int32)(*PosArray)[0]->AsNumber();
		PosY = (int32)(*PosArray)[1]->AsNumber();
	}

	// Resolve member_class by string â€” mirror the CallFunction class-resolution
	// idiom (native-first, then U-prefix and de-U-prefix variants). ENGINE-GENERIC:
	// any class, resolved at runtime; never hardcode a sibling-plugin class name.
	UClass* MemberClass = FindFirstObject<UClass>(*MemberClassName, EFindFirstObjectOptions::NativeFirst);
	if (!MemberClass && !MemberClassName.StartsWith(TEXT("U")))
		MemberClass = FindFirstObject<UClass>(*FString::Printf(TEXT("U%s"), *MemberClassName), EFindFirstObjectOptions::NativeFirst);
	if (!MemberClass && MemberClassName.StartsWith(TEXT("U")))
		MemberClass = FindFirstObject<UClass>(*MemberClassName.Mid(1), EFindFirstObjectOptions::NativeFirst);

	if (!MemberClass)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Class '%s' not found (also tried U-prefix variants). Pass the property's owning class name."),
			*MemberClassName));
	}

	// Warn (but don't fail) if the named property isn't found on the class â€” the
	// node still authors usefully, and the caller may target a class whose
	// property surface isn't loaded the same way; SetExternalMember is the
	// authoritative bind regardless.
	const bool bPropertyFound = (MemberClass->FindPropertyByName(FName(*MemberName)) != nullptr);

	// Create the node and bind the EXTERNAL member BEFORE AllocateDefaultPins so
	// pin types resolve from the member reference (wrong order = wildcard node â€”
	// the exact failure this action fixes). Native UPROPERTYs carry no member
	// GUID, so the 2-arg SetExternalMember overload is correct (MemberReference.h:177).
	UEdGraphNode* NewNode = nullptr;
	UEdGraphPin* ValuePin = nullptr;
	UEdGraphPin* TargetPin = nullptr;

	if (bIsSetter)
	{
		UK2Node_VariableSet* VarNode = NewObject<UK2Node_VariableSet>(Graph);
		VarNode->VariableReference.SetExternalMember(FName(*MemberName), MemberClass);
		VarNode->NodePosX = PosX;
		VarNode->NodePosY = PosY;
		Graph->AddNode(VarNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		VarNode->AllocateDefaultPins();
		NewNode = VarNode;
	}
	else
	{
		UK2Node_VariableGet* VarNode = NewObject<UK2Node_VariableGet>(Graph);
		VarNode->VariableReference.SetExternalMember(FName(*MemberName), MemberClass);
		VarNode->NodePosX = PosX;
		VarNode->NodePosY = PosY;
		Graph->AddNode(VarNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		VarNode->AllocateDefaultPins();
		NewNode = VarNode;
	}

	if (!NewNode)
	{
		return FMonolithActionResult::Error(TEXT("Failed to create property-access node â€” NewObject returned null"));
	}

	// Ensure a non-zero NodeGuid (gap #15's universal fix lands separately, but
	// this new node must not ship a zero GUID). EdGraphNode.cpp:791.
	NewNode->CreateNewGuid();

	// Identify the value pin (the data pin carrying the property's value) and the
	// target pin (the "self"/object input the caller wires to supply the instance).
	// For an external-member node the self pin is a PC_Object input named PN_Self;
	// the value pin is the other non-exec data pin (output for getter, input for setter).
	const FName SelfPinName = UEdGraphSchema_K2::PN_Self;
	const EEdGraphPinDirection ValueDir = bIsSetter ? EGPD_Input : EGPD_Output;
	for (UEdGraphPin* P : NewNode->Pins)
	{
		if (!P) continue;
		if (P->PinName == SelfPinName)
		{
			TargetPin = P;
			continue;
		}
		if (!ValuePin && P->Direction == ValueDir && P->PinType.PinCategory != UEdGraphSchema_K2::PC_Exec)
		{
			ValuePin = P;
		}
	}

	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedPtr<FJsonObject> Root = MonolithBlueprintInternal::SerializeNode(NewNode);
	Root->SetStringField(TEXT("asset_path"), AssetPath);
	Root->SetStringField(TEXT("graph"), Graph->GetName());
	Root->SetStringField(TEXT("node_id"), NewNode->GetName());
	Root->SetStringField(TEXT("member_class"), MemberClass->GetName());
	Root->SetStringField(TEXT("member_name"), MemberName);
	Root->SetBoolField(TEXT("is_setter"), bIsSetter);
	Root->SetStringField(TEXT("value_pin_id"), ValuePin ? ValuePin->PinId.ToString() : FString());
	Root->SetStringField(TEXT("target_pin_id"), TargetPin ? TargetPin->PinId.ToString() : FString());
	if (ValuePin)
	{
		Root->SetStringField(TEXT("value_pin_name"), ValuePin->PinName.ToString());
	}
	if (TargetPin)
	{
		Root->SetStringField(TEXT("target_pin_name"), TargetPin->PinName.ToString());
	}
	if (!bPropertyFound)
	{
		Root->SetStringField(TEXT("warning"), FString::Printf(
			TEXT("Property '%s' was not found on class '%s' via reflection â€” node was authored with the external member reference, but verify the property name."),
			*MemberName, *MemberClass->GetName()));
	}
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  add_property_access_node  (genuine thread-safe Property Access)
//
//  Spawns a REAL UK2Node_PropertyAccess reflectively (the class is
//  MinimalAPI, header in PropertyAccessNode/Private -- not includable),
//  mirroring the EvaluateChooser2 surgery pattern. The private
//  TArray<FString> Path UPROPERTY is set via FArrayProperty reflection
//  BEFORE AllocateDefaultPins(), so AllocatePins()->ResolvePropertyAccess()
//  resolves the leaf property + creates the 'Value' output pin with the
//  correct type. Optionally sets the private FName ContextId UPROPERTY.
//
//  Why this is thread-safe (unlike add_property_access): the AnimBP
//  property-access compiler either resolves the path on the worker thread
//  directly (if thread-safe) or generates a game-thread-cached variable
//  the worker reads â€” never a raw cross-thread object deref. This is the
//  pattern the Game Animation Sample's SandboxCharacter_CMC_ABP uses for
//  Velocity / Acceleration / Stance reads.
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleAddPropertyAccessNode(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	// Parse the verbatim path (array of strings). At least one element required.
	TArray<FString> Path;
	const TArray<TSharedPtr<FJsonValue>>* PathArr = nullptr;
	if (!Params->TryGetArrayField(TEXT("path"), PathArr) || !PathArr || PathArr->Num() == 0)
	{
		return FMonolithActionResult::Error(TEXT("add_property_access_node requires a non-empty 'path' array of strings"));
	}
	for (const TSharedPtr<FJsonValue>& Elem : *PathArr)
	{
		FString S;
		if (!Elem.IsValid() || !Elem->TryGetString(S) || S.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("Each 'path' element must be a non-empty string"));
		}
		Path.Add(S);
	}

	// Resolve the target graph (defaults to first ubergraph; FindGraphByName already
	// searches FunctionGraphs so a named thread-safe function graph resolves directly).
	const FString GraphName = Params->GetStringField(TEXT("graph_name"));
	UEdGraph* Graph = MonolithBlueprintInternal::FindGraphByName(BP, GraphName);
	if (!Graph)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Graph not found: %s"), GraphName.IsEmpty() ? TEXT("(first ubergraph)") : *GraphName));
	}

	// Optional ContextId.
	FString ContextId;
	Params->TryGetStringField(TEXT("context_id"), ContextId);

	// Parse position.
	int32 PosX = 0;
	int32 PosY = 0;
	const TArray<TSharedPtr<FJsonValue>>* PosArray = nullptr;
	if (Params->TryGetArrayField(TEXT("position"), PosArray) && PosArray && PosArray->Num() >= 2)
	{
		PosX = (int32)(*PosArray)[0]->AsNumber();
		PosY = (int32)(*PosArray)[1]->AsNumber();
	}

	// Resolve the UK2Node_PropertyAccess class reflectively. LoadClass forces the owning
	// editor module (PropertyAccessNode) to provide the class if present. The header is in
	// PropertyAccessNode/Private and cannot be included â€” same constraint the EvaluateChooser2
	// surgery handles. No Build.cs dependency is required (we never link a symbol from it).
	static const TCHAR* PropertyAccessClassPath = TEXT("/Script/PropertyAccessNode.K2Node_PropertyAccess");
	UClass* PAClass = LoadClass<UObject>(nullptr, PropertyAccessClassPath);
	if (!PAClass)
	{
		PAClass = FindObject<UClass>(nullptr, PropertyAccessClassPath);
	}
	if (!PAClass)
	{
		return FMonolithActionResult::Error(
			TEXT("UK2Node_PropertyAccess class not resolvable (/Script/PropertyAccessNode.K2Node_PropertyAccess). "
			     "The PropertyAccessNode editor module is required â€” it ships with the editor; ensure this is an editor build."));
	}

	// Reflect the private members we must set BEFORE pin allocation.
	FArrayProperty* PathProp = FindFProperty<FArrayProperty>(PAClass, TEXT("Path"));
	if (!PathProp || !CastField<FStrProperty>(PathProp->Inner))
	{
		return FMonolithActionResult::Error(
			TEXT("UK2Node_PropertyAccess::Path (TArray<FString>) not found via reflection â€” engine layout changed."));
	}
	FNameProperty* ContextProp = FindFProperty<FNameProperty>(PAClass, TEXT("ContextId"));

	// Spawn the node reflectively (NewObject<UK2Node> with the resolved class), add it to
	// the graph, then set Path (and ContextId) reflectively, THEN AllocateDefaultPins so
	// AllocatePins()->ResolvePropertyAccess() resolves the leaf type and creates 'Value'.
	UK2Node* Node = NewObject<UK2Node>(Graph, PAClass, NAME_None, RF_Transactional);
	if (!Node)
	{
		return FMonolithActionResult::Error(TEXT("Failed to create UK2Node_PropertyAccess â€” NewObject returned null"));
	}

	Graph->Modify();
	Graph->AddNode(Node, /*bUserAction=*/false, /*bSelectNewNode=*/false);
	Node->CreateNewGuid();
	Node->NodePosX = PosX;
	Node->NodePosY = PosY;

	// Set Path reflectively (FStrProperty inner â€” mirrors the established FScriptArrayHelper idiom).
	{
		void* ArrayValuePtr = PathProp->ContainerPtrToValuePtr<void>(Node);
		FScriptArrayHelper Helper(PathProp, ArrayValuePtr);
		Helper.Resize(Path.Num());
		FStrProperty* InnerStr = CastField<FStrProperty>(PathProp->Inner);
		for (int32 i = 0; i < Path.Num(); ++i)
		{
			InnerStr->SetPropertyValue(Helper.GetRawPtr(i), Path[i]);
		}
	}

	// Set ContextId reflectively if requested.
	if (ContextProp && !ContextId.IsEmpty())
	{
		ContextProp->SetPropertyValue_InContainer(Node, FName(*ContextId));
	}

	// Allocate pins â€” runs AllocatePins() -> ResolvePropertyAccess(), resolving the leaf
	// and creating the 'Value' output pin with the resolved type.
	Node->AllocateDefaultPins();
	Node->PostPlacedNewNode();

	// Locate the 'Value' output pin (the resolved data pin callers wire downstream).
	UEdGraphPin* ValuePin = nullptr;
	for (UEdGraphPin* P : Node->Pins)
	{
		if (P && P->Direction == EGPD_Output && P->PinName == TEXT("Value"))
		{
			ValuePin = P;
			break;
		}
	}

	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedPtr<FJsonObject> Root = MonolithBlueprintInternal::SerializeNode(Node);
	Root->SetStringField(TEXT("asset_path"), AssetPath);
	Root->SetStringField(TEXT("graph"), Graph->GetName());
	Root->SetStringField(TEXT("node_id"), Node->GetName());
	Root->SetStringField(TEXT("value_pin_name"), TEXT("Value"));
	Root->SetStringField(TEXT("value_pin_id"), ValuePin ? ValuePin->PinId.ToString() : FString());
	{
		TArray<TSharedPtr<FJsonValue>> PathOut;
		for (const FString& S : Path) { PathOut.Add(MakeShared<FJsonValueString>(S)); }
		Root->SetArrayField(TEXT("path"), PathOut);
	}
	if (!ContextId.IsEmpty()) Root->SetStringField(TEXT("context_id"), ContextId);
	if (!ValuePin)
	{
		// The path did not resolve to a leaf (e.g. wrong field name / GUID, or the access
		// root member is not present on this Blueprint). Node is still authored; warn.
		Root->SetStringField(TEXT("warning"),
			TEXT("Property Access authored but its 'Value' pin did not resolve â€” verify the path: element 0 must be a member/function "
			     "on the access root (the AnimInstance's own variable or a thread-safe function), and struct field elements must use "
			     "the exact internal field name (GUID-suffixed for UserDefinedStruct fields)."));
	}
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  remove_node
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleRemoveNode(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString NodeId = Params->GetStringField(TEXT("node_id"));
	if (NodeId.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: node_id"));
	}

	FString GraphName = Params->GetStringField(TEXT("graph_name"));
	UEdGraphNode* Node = MonolithBlueprintInternal::FindNodeById(BP, GraphName, NodeId);
	if (!Node)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Node not found: %s"), *NodeId));
	}

	FBlueprintEditorUtils::RemoveNode(BP, Node, /*bDontRecompile=*/false);

	TSharedPtr<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetStringField(TEXT("asset_path"), AssetPath);
	Root->SetStringField(TEXT("removed_node"), NodeId);
	Root->SetBoolField(TEXT("success"), true);
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  connect_pins
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleConnectPins(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString SourceNodeId = Params->GetStringField(TEXT("source_node"));
	FString SourcePinName = Params->GetStringField(TEXT("source_pin"));
	FString TargetNodeId = Params->GetStringField(TEXT("target_node"));
	FString TargetPinName = Params->GetStringField(TEXT("target_pin"));

	if (SourceNodeId.IsEmpty()) return FMonolithActionResult::Error(TEXT("Missing required parameter: source_node"));
	if (SourcePinName.IsEmpty()) return FMonolithActionResult::Error(TEXT("Missing required parameter: source_pin"));
	if (TargetNodeId.IsEmpty()) return FMonolithActionResult::Error(TEXT("Missing required parameter: target_node"));
	if (TargetPinName.IsEmpty()) return FMonolithActionResult::Error(TEXT("Missing required parameter: target_pin"));

	FString GraphName = Params->GetStringField(TEXT("graph_name"));

	UEdGraphNode* SrcNode = MonolithBlueprintInternal::FindNodeById(BP, GraphName, SourceNodeId);
	if (!SrcNode)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Source node not found: %s"), *SourceNodeId));
	}

	UEdGraphNode* TgtNode = MonolithBlueprintInternal::FindNodeById(BP, GraphName, TargetNodeId);
	if (!TgtNode)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Target node not found: %s"), *TargetNodeId));
	}

	FString SrcAvailPins;
	UEdGraphPin* SrcPin = MonolithBlueprintInternal::FindPinOnNode(SrcNode, SourcePinName, EGPD_MAX, &SrcAvailPins);
	if (!SrcPin)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Source pin '%s' not found on node '%s'. Available pins: %s"), *SourcePinName, *SourceNodeId, *SrcAvailPins));
	}

	FString TgtAvailPins;
	UEdGraphPin* TgtPin = MonolithBlueprintInternal::FindPinOnNode(TgtNode, TargetPinName, EGPD_MAX, &TgtAvailPins);
	if (!TgtPin)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Target pin '%s' not found on node '%s'. Available pins: %s"), *TargetPinName, *TargetNodeId, *TgtAvailPins));
	}

	const UEdGraphSchema_K2* Schema = GetDefault<UEdGraphSchema_K2>();

	// Check compatibility before attempting connection
	FPinConnectionResponse Response = Schema->CanCreateConnection(SrcPin, TgtPin);
	if (Response.Response == CONNECT_RESPONSE_DISALLOW)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Cannot connect pins: %s"), *Response.Message.ToString()));
	}

	// Track whether UE will insert an auto-conversion node
	bool bAutoConversion = (Response.Response == CONNECT_RESPONSE_MAKE_WITH_CONVERSION_NODE);

	bool bConnected = Schema->TryCreateConnection(SrcPin, TgtPin);
	if (!bConnected)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("TryCreateConnection failed for '%s.%s' -> '%s.%s'"),
			*SourceNodeId, *SourcePinName, *TargetNodeId, *TargetPinName));
	}

	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedPtr<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetStringField(TEXT("asset_path"), AssetPath);
	Root->SetStringField(TEXT("source_node"), SourceNodeId);
	Root->SetStringField(TEXT("source_pin"), SourcePinName);
	Root->SetStringField(TEXT("target_node"), TargetNodeId);
	Root->SetStringField(TEXT("target_pin"), TargetPinName);
	Root->SetBoolField(TEXT("success"), true);
	if (bAutoConversion)
	{
		Root->SetStringField(TEXT("warning"), TEXT("Connection required an auto-conversion node (types were not directly compatible)"));
	}
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  disconnect_pins
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleDisconnectPins(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString NodeId = Params->GetStringField(TEXT("node_id"));
	if (NodeId.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: node_id"));
	}

	FString PinName = Params->GetStringField(TEXT("pin_name"));
	if (PinName.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: pin_name"));
	}

	FString GraphName = Params->GetStringField(TEXT("graph_name"));

	UEdGraphNode* Node = MonolithBlueprintInternal::FindNodeById(BP, GraphName, NodeId);
	if (!Node)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Node not found: %s"), *NodeId));
	}

	FString AvailPins;
	UEdGraphPin* Pin = MonolithBlueprintInternal::FindPinOnNode(Node, PinName, EGPD_MAX, &AvailPins);
	if (!Pin)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Pin '%s' not found on node '%s'. Available pins: %s"), *PinName, *NodeId, *AvailPins));
	}

	FString TargetNodeId = Params->GetStringField(TEXT("target_node"));
	FString TargetPinName = Params->GetStringField(TEXT("target_pin"));

	if (TargetNodeId.IsEmpty())
	{
		// Break all connections on this pin
		Pin->BreakAllPinLinks(true);
	}
	else
	{
		if (TargetPinName.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("'target_pin' is required when 'target_node' is specified"));
		}

		UEdGraphNode* TargetNode = MonolithBlueprintInternal::FindNodeById(BP, GraphName, TargetNodeId);
		if (!TargetNode)
		{
			return FMonolithActionResult::Error(FString::Printf(TEXT("Target node not found: %s"), *TargetNodeId));
		}

		FString TgtAvailPins2;
		UEdGraphPin* TargetPin = MonolithBlueprintInternal::FindPinOnNode(TargetNode, TargetPinName, EGPD_MAX, &TgtAvailPins2);
		if (!TargetPin)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("Target pin '%s' not found on node '%s'. Available pins: %s"), *TargetPinName, *TargetNodeId, *TgtAvailPins2));
		}

		Pin->BreakLinkTo(TargetPin);
	}

	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedPtr<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetStringField(TEXT("asset_path"), AssetPath);
	Root->SetStringField(TEXT("node_id"), NodeId);
	Root->SetStringField(TEXT("pin_name"), PinName);
	if (!TargetNodeId.IsEmpty())
	{
		Root->SetStringField(TEXT("target_node"), TargetNodeId);
		Root->SetStringField(TEXT("target_pin"), TargetPinName);
	}
	Root->SetBoolField(TEXT("success"), true);
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  set_pin_default
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleSetPinDefault(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString NodeId = Params->GetStringField(TEXT("node_id"));
	if (NodeId.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: node_id"));
	}

	FString PinName = Params->GetStringField(TEXT("pin_name"));
	if (PinName.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: pin_name"));
	}

	FString Value = Params->GetStringField(TEXT("value"));
	if (Value.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: value"));
	}

	FString GraphName = Params->GetStringField(TEXT("graph_name"));

	UEdGraphNode* Node = MonolithBlueprintInternal::FindNodeById(BP, GraphName, NodeId);
	if (!Node)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Node not found: %s"), *NodeId));
	}

	FString SetPinAvailPins;
	UEdGraphPin* Pin = MonolithBlueprintInternal::FindPinOnNode(Node, PinName, EGPD_MAX, &SetPinAvailPins);
	if (!Pin)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Pin '%s' not found on node '%s'. Available pins: %s"), *PinName, *NodeId, *SetPinAvailPins));
	}

	if (Pin->Direction != EGPD_Input)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Pin '%s' is an output pin â€” only input pins can have default values"), *PinName));
	}

	if (Pin->LinkedTo.Num() > 0)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Pin '%s' has active connections â€” disconnect it first before setting a default value"), *PinName));
	}

	const bool bIsRefPin =
		(Pin->PinType.PinCategory == UEdGraphSchema_K2::PC_Class) ||
		(Pin->PinType.PinCategory == UEdGraphSchema_K2::PC_Object);

	if (bIsRefPin)
	{
		FString ResolveError;
		UObject* Resolved = MonolithBlueprintInternal::ResolveDefaultObjectForPin(Pin, Value, ResolveError);
		if (!Resolved)
		{
			return FMonolithActionResult::Error(ResolveError);
		}
		Pin->DefaultObject = Resolved;
		Pin->DefaultValue.Reset();
	}
	else
	{
		Pin->DefaultValue = Value;
	}
	Node->PinDefaultValueChanged(Pin);
	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedPtr<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetStringField(TEXT("asset_path"), AssetPath);
	Root->SetStringField(TEXT("node_id"), NodeId);
	Root->SetStringField(TEXT("pin_name"), PinName);
	Root->SetStringField(TEXT("value"), Value);
	Root->SetBoolField(TEXT("success"), true);
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  set_node_position
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleSetNodePosition(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString NodeId = Params->GetStringField(TEXT("node_id"));
	if (NodeId.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: node_id"));
	}

	const TArray<TSharedPtr<FJsonValue>>* PosArray = nullptr;
	if (!Params->TryGetArrayField(TEXT("position"), PosArray) || !PosArray || PosArray->Num() < 2)
	{
		return FMonolithActionResult::Error(TEXT("'position' must be an array of [x, y]"));
	}

	int32 PosX = (int32)(*PosArray)[0]->AsNumber();
	int32 PosY = (int32)(*PosArray)[1]->AsNumber();

	FString GraphName = Params->GetStringField(TEXT("graph_name"));

	UEdGraphNode* Node = MonolithBlueprintInternal::FindNodeById(BP, GraphName, NodeId);
	if (!Node)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Node not found: %s"), *NodeId));
	}

	Node->NodePosX = PosX;
	Node->NodePosY = PosY;
	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedPtr<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetStringField(TEXT("asset_path"), AssetPath);
	Root->SetStringField(TEXT("node_id"), NodeId);

	TArray<TSharedPtr<FJsonValue>> OutPosArr;
	OutPosArr.Add(MakeShared<FJsonValueNumber>(PosX));
	OutPosArr.Add(MakeShared<FJsonValueNumber>(PosY));
	Root->SetArrayField(TEXT("position"), OutPosArr);

	Root->SetBoolField(TEXT("success"), true);
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  batch_execute
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleBatchExecute(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	// Parse operations â€” handle both EJson::Array (normal) and EJson::String (Claude Code quirk)
	TArray<TSharedPtr<FJsonValue>> Ops;
	TSharedPtr<FJsonValue> OpsField = Params->TryGetField(TEXT("operations"));
	if (!OpsField.IsValid())
	{
		return FMonolithActionResult::Error(TEXT("Missing required field: operations"));
	}
	if (OpsField->Type == EJson::Array)
	{
		Ops = OpsField->AsArray();
	}
	else if (OpsField->Type == EJson::String)
	{
		TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(OpsField->AsString());
		if (!FJsonSerializer::Deserialize(Reader, Ops))
		{
			return FMonolithActionResult::Error(TEXT("Failed to parse operations string as JSON array"));
		}
	}
	else
	{
		return FMonolithActionResult::Error(TEXT("'operations' must be an array"));
	}

	bool bStopOnError = false;
	Params->TryGetBoolField(TEXT("stop_on_error"), bStopOnError);

	bool bCompileOnComplete = false;
	Params->TryGetBoolField(TEXT("compile_on_complete"), bCompileOnComplete);

	GEditor->BeginTransaction(NSLOCTEXT("Monolith", "BPBatchExec", "BP Batch Execute"));

	TArray<TSharedPtr<FJsonValue>> Results;
	int32 Ok = 0, Fail = 0;

	for (int32 i = 0; i < Ops.Num(); ++i)
	{
		TSharedPtr<FJsonObject> Op = Ops[i]->AsObject();
		TSharedRef<FJsonObject> RO = MakeShared<FJsonObject>();
		RO->SetNumberField(TEXT("index"), i);

		if (!Op.IsValid())
		{
			RO->SetStringField(TEXT("op"), TEXT("(invalid)"));
			RO->SetBoolField(TEXT("success"), false);
			RO->SetStringField(TEXT("error"), TEXT("Operation entry is not a valid JSON object"));
			Results.Add(MakeShared<FJsonValueObject>(RO));
			Fail++;
			if (bStopOnError) break;
			continue;
		}

		FString OpName;
		if (!Op->TryGetStringField(TEXT("op"), OpName) || OpName.IsEmpty())
		{
			FString HintName;
			Op->TryGetStringField(TEXT("action"), HintName);
			FString Hint = HintName.IsEmpty()
				? TEXT("Each operation must have an \"op\" key with the action name, plus flat inline params (not nested under \"params\").")
				: FString::Printf(TEXT("Use \"op\" key, not \"action\". Found \"action\":\"%s\". Params must be flat inline, not nested."), *HintName);
			RO->SetStringField(TEXT("op"), TEXT("(missing)"));
			RO->SetBoolField(TEXT("success"), false);
			RO->SetStringField(TEXT("error"), Hint);
			Results.Add(MakeShared<FJsonValueObject>(RO));
			Fail++;
			if (bStopOnError) break;
			continue;
		}
		RO->SetStringField(TEXT("op"), OpName);

		// Build sub-params: inject asset_path then copy all op fields
		TSharedRef<FJsonObject> SubParams = MakeShared<FJsonObject>();
		SubParams->SetStringField(TEXT("asset_path"), AssetPath);
		for (auto& Pair : Op->Values)
		{
			SubParams->SetField(Pair.Key, Pair.Value);
		}

		FMonolithActionResult SubResult = FMonolithActionResult::Error(FString::Printf(TEXT("Unknown op: %s"), *OpName));

		// Node ops
		if      (OpName == TEXT("add_node"))               SubResult = HandleAddNode(SubParams);
		else if (OpName == TEXT("remove_node"))            SubResult = HandleRemoveNode(SubParams);
		else if (OpName == TEXT("connect_pins"))           SubResult = HandleConnectPins(SubParams);
		else if (OpName == TEXT("disconnect_pins"))        SubResult = HandleDisconnectPins(SubParams);
		else if (OpName == TEXT("set_pin_default"))        SubResult = HandleSetPinDefault(SubParams);
		else if (OpName == TEXT("set_node_position"))      SubResult = HandleSetNodePosition(SubParams);
		// Variable ops
		else if (OpName == TEXT("add_variable"))           SubResult = FMonolithBlueprintVariableActions::HandleAddVariable(SubParams);
		else if (OpName == TEXT("remove_variable"))        SubResult = FMonolithBlueprintVariableActions::HandleRemoveVariable(SubParams);
		else if (OpName == TEXT("rename_variable"))        SubResult = FMonolithBlueprintVariableActions::HandleRenameVariable(SubParams);
		else if (OpName == TEXT("set_variable_type"))      SubResult = FMonolithBlueprintVariableActions::HandleSetVariableType(SubParams);
		else if (OpName == TEXT("set_variable_defaults"))  SubResult = FMonolithBlueprintVariableActions::HandleSetVariableDefaults(SubParams);
		else if (OpName == TEXT("add_local_variable"))     SubResult = FMonolithBlueprintVariableActions::HandleAddLocalVariable(SubParams);
		else if (OpName == TEXT("remove_local_variable"))  SubResult = FMonolithBlueprintVariableActions::HandleRemoveLocalVariable(SubParams);
		// Component ops
		else if (OpName == TEXT("add_component"))          SubResult = FMonolithBlueprintComponentActions::HandleAddComponent(SubParams);
		else if (OpName == TEXT("remove_component"))       SubResult = FMonolithBlueprintComponentActions::HandleRemoveComponent(SubParams);
		else if (OpName == TEXT("rename_component"))       SubResult = FMonolithBlueprintComponentActions::HandleRenameComponent(SubParams);
		else if (OpName == TEXT("reparent_component"))     SubResult = FMonolithBlueprintComponentActions::HandleReparentComponent(SubParams);
		else if (OpName == TEXT("set_component_property")) SubResult = FMonolithBlueprintComponentActions::HandleSetComponentProperty(SubParams);
		else if (OpName == TEXT("duplicate_component"))    SubResult = FMonolithBlueprintComponentActions::HandleDuplicateComponent(SubParams);
		// Graph/interface ops
		else if (OpName == TEXT("add_function"))           SubResult = FMonolithBlueprintGraphActions::HandleAddFunction(SubParams);
		else if (OpName == TEXT("remove_function"))        SubResult = FMonolithBlueprintGraphActions::HandleRemoveFunction(SubParams);
		else if (OpName == TEXT("rename_function"))        SubResult = FMonolithBlueprintGraphActions::HandleRenameFunction(SubParams);
		else if (OpName == TEXT("add_macro"))              SubResult = FMonolithBlueprintGraphActions::HandleAddMacro(SubParams);
		else if (OpName == TEXT("add_event_dispatcher"))   SubResult = FMonolithBlueprintGraphActions::HandleAddEventDispatcher(SubParams);
		else if (OpName == TEXT("set_function_params"))    SubResult = FMonolithBlueprintGraphActions::HandleSetFunctionParams(SubParams);
		else if (OpName == TEXT("implement_interface"))        SubResult = FMonolithBlueprintGraphActions::HandleImplementInterface(SubParams);
		else if (OpName == TEXT("remove_interface"))           SubResult = FMonolithBlueprintGraphActions::HandleRemoveInterface(SubParams);
		// Wave 5 scaffolding ops
		else if (OpName == TEXT("scaffold_interface_implementation")) SubResult = FMonolithBlueprintGraphActions::HandleScaffoldInterfaceImplementation(SubParams);
		else if (OpName == TEXT("add_timeline"))               SubResult = HandleAddTimeline(SubParams);
		else if (OpName == TEXT("add_event_node"))             SubResult = HandleAddEventNode(SubParams);
		else if (OpName == TEXT("add_comment_node"))           SubResult = HandleAddCommentNode(SubParams);
		// Wave 7 advanced ops
		else if (OpName == TEXT("promote_pin_to_variable"))    SubResult = HandlePromotePinToVariable(SubParams);
		else if (OpName == TEXT("add_replicated_variable"))    SubResult = FMonolithBlueprintVariableActions::HandleAddReplicatedVariable(SubParams);
		// Phase 1 expansion (1E/1F â€” handlers added by parallel agent)
		else if (OpName == TEXT("save_asset"))                 SubResult = FMonolithBlueprintCompileActions::HandleSaveAsset(SubParams);
		else if (OpName == TEXT("remove_macro"))               SubResult = FMonolithBlueprintGraphActions::HandleRemoveMacro(SubParams);
		else if (OpName == TEXT("rename_macro"))               SubResult = FMonolithBlueprintGraphActions::HandleRenameMacro(SubParams);
		// CDO ops
		else if (OpName == TEXT("set_cdo_property"))           SubResult = FMonolithBlueprintCDOActions::HandleSetCDOProperty(SubParams);
		// Phase 3A timeline read/edit
		else if (OpName == TEXT("get_timeline_data"))           SubResult = HandleGetTimelineData(SubParams);
		else if (OpName == TEXT("add_timeline_track"))          SubResult = HandleAddTimelineTrack(SubParams);
		else if (OpName == TEXT("set_timeline_keys"))           SubResult = HandleSetTimelineKeys(SubParams);
		// Phase 5C graph export/copy
		else if (OpName == TEXT("export_graph"))                SubResult = FMonolithBlueprintGraphExportActions::HandleExportGraph(SubParams);
		else if (OpName == TEXT("copy_nodes"))                  SubResult = FMonolithBlueprintGraphExportActions::HandleCopyNodes(SubParams);
		else if (OpName == TEXT("duplicate_graph"))             SubResult = FMonolithBlueprintGraphExportActions::HandleDuplicateGraph(SubParams);
		// Phase 6 layout
		else if (OpName == TEXT("auto_layout"))                 SubResult = FMonolithBlueprintLayoutActions::HandleAutoLayout(SubParams);

		RO->SetBoolField(TEXT("success"), SubResult.bSuccess);
		if (!SubResult.bSuccess)
		{
			RO->SetStringField(TEXT("error"), SubResult.ErrorMessage);
		}
		if (SubResult.bSuccess && SubResult.Result.IsValid())
		{
			RO->SetObjectField(TEXT("data"), SubResult.Result);
		}

		Results.Add(MakeShared<FJsonValueObject>(RO));
		if (SubResult.bSuccess) Ok++; else Fail++;

		if (!SubResult.bSuccess && bStopOnError) break;
	}

	GEditor->EndTransaction();

	TSharedRef<FJsonObject> Final = MakeShared<FJsonObject>();
	Final->SetBoolField(TEXT("success"), Fail == 0);
	Final->SetNumberField(TEXT("total"), Ops.Num());
	Final->SetNumberField(TEXT("succeeded"), Ok);
	Final->SetNumberField(TEXT("failed"), Fail);
	Final->SetArrayField(TEXT("results"), Results);

	if (bCompileOnComplete)
	{
		TSharedRef<FJsonObject> CompileParams = MakeShared<FJsonObject>();
		CompileParams->SetStringField(TEXT("asset_path"), AssetPath);
		FMonolithActionResult CompileResult = FMonolithBlueprintCompileActions::HandleCompileBlueprint(CompileParams);
		Final->SetBoolField(TEXT("compile_success"), CompileResult.bSuccess);
		if (CompileResult.bSuccess && CompileResult.Result.IsValid())
		{
			Final->SetObjectField(TEXT("compile_result"), CompileResult.Result);
		}
		else if (!CompileResult.bSuccess)
		{
			Final->SetStringField(TEXT("compile_error"), CompileResult.ErrorMessage);
		}
	}

	return FMonolithActionResult::Success(Final);
}

// ============================================================
//  resolve_node
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleResolveNode(const TSharedPtr<FJsonObject>& Params)
{
	FString NodeType = Params->GetStringField(TEXT("node_type"));
	if (NodeType.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: node_type"));
	}

	// Apply same alias normalization as add_node (shared map from 1G)
	{
		FString Lower = NodeType.ToLower();
		const auto& Aliases = GetNodeAliases();
		if (const FNodeAlias* Alias = Aliases.Find(Lower))
		{
			NodeType = Alias->CanonicalType;
			// Merge default params for resolve_node too (e.g., function_name for IsValid alias)
			for (const auto& KV : Alias->DefaultParams)
			{
				if (!Params->HasField(KV.Key))
				{
					Params->SetStringField(KV.Key, KV.Value);
				}
			}
		}
	}

	TArray<FString> Warnings;

	// Create a transient Blueprint + graph so AllocateDefaultPins() can find an
	// owning Blueprint via the outer chain.  Without this, nodes like
	// UK2Node_CallFunction assert in FindBlueprintForNodeChecked().
	UBlueprint* TempBP = NewObject<UBlueprint>(GetTransientPackage(), NAME_None, RF_Transient);
	TempBP->ParentClass = AActor::StaticClass();
	TempBP->GeneratedClass = AActor::StaticClass();
	TempBP->SkeletonGeneratedClass = AActor::StaticClass();
	UEdGraph* TempGraph = NewObject<UEdGraph>(TempBP, NAME_None, RF_Transient);
	TempGraph->Schema = UEdGraphSchema_K2::StaticClass();

	UEdGraphNode* Node = nullptr;

	if (NodeType == TEXT("CallFunction"))
	{
		FString FuncName = Params->GetStringField(TEXT("function_name"));
		if (FuncName.IsEmpty())
		{
			return FMonolithActionResult::Error(TEXT("CallFunction requires 'function_name'"));
		}

		FString TargetClassName = Params->GetStringField(TEXT("target_class"));

		TArray<FName> Candidates;
		Candidates.Add(FName(*FuncName));
		if (!FuncName.StartsWith(TEXT("K2_")))
		{
			Candidates.Add(FName(*FString::Printf(TEXT("K2_%s"), *FuncName)));
		}

		UFunction* Func = nullptr;
		if (!TargetClassName.IsEmpty())
		{
			UClass* TargetClass = FindFirstObject<UClass>(*TargetClassName, EFindFirstObjectOptions::NativeFirst);
			if (!TargetClass && !TargetClassName.StartsWith(TEXT("U")))
				TargetClass = FindFirstObject<UClass>(*FString::Printf(TEXT("U%s"), *TargetClassName), EFindFirstObjectOptions::NativeFirst);
			if (!TargetClass && TargetClassName.StartsWith(TEXT("U")))
				TargetClass = FindFirstObject<UClass>(*TargetClassName.Mid(1), EFindFirstObjectOptions::NativeFirst);

			if (TargetClass)
			{
				for (const FName& C : Candidates)
				{
					Func = TargetClass->FindFunctionByName(C);
					if (Func) break;
				}
			}
			if (!Func)
			{
				return FMonolithActionResult::Error(FString::Printf(
					TEXT("Function '%s' not found on class '%s'"), *FuncName, *TargetClassName));
			}
		}
		else
		{
			// resolve_node is a dry-run with only an optional asset_path. When a
			// Widget Blueprint path is supplied, apply the same UWidget-derived
			// bias used by add_node so the resolved pin layout matches what the
			// real write would produce. Without an asset_path the bias is off and
			// behaviour is the unbiased first-match.
			bool bPreferWidget = false;
			if (!Params->GetStringField(TEXT("asset_path")).IsEmpty())
			{
				FString ResolveAssetPath;
				UBlueprint* ContextBP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, ResolveAssetPath);
				bPreferWidget = IsWidgetBlueprintContext(ContextBP);
			}
			Func = FindFunctionAcrossLoadedClasses(Candidates, bPreferWidget);
			if (!Func)
			{
				return FMonolithActionResult::Error(FString::Printf(
					TEXT("Function '%s' not found in any loaded class"), *FuncName));
			}
		}

		UK2Node_CallFunction* CallNode = NewObject<UK2Node_CallFunction>(TempGraph);
		CallNode->SetFromFunction(Func);
		CallNode->AllocateDefaultPins();
		Node = CallNode;
	}
	else if (NodeType == TEXT("VariableGet"))
	{
		// For a dry-run VariableGet, we use a wildcard self-member reference.
		// If variable_name is provided it's recorded in the response but the pin
		// layout is identical regardless â€” VariableGet always has one output data pin.
		UK2Node_VariableGet* VarNode = NewObject<UK2Node_VariableGet>(TempGraph);
		FString VarName = Params->GetStringField(TEXT("variable_name"));
		if (VarName.IsEmpty()) VarName = TEXT("Variable");
		VarNode->VariableReference.SetSelfMember(FName(*VarName));
		VarNode->AllocateDefaultPins();
		Node = VarNode;
		Warnings.Add(TEXT("VariableGet pin types reflect a wildcard â€” actual type depends on the specific variable in the target Blueprint"));
	}
	else if (NodeType == TEXT("VariableSet"))
	{
		UK2Node_VariableSet* VarNode = NewObject<UK2Node_VariableSet>(TempGraph);
		FString VarName = Params->GetStringField(TEXT("variable_name"));
		if (VarName.IsEmpty()) VarName = TEXT("Variable");
		VarNode->VariableReference.SetSelfMember(FName(*VarName));
		VarNode->AllocateDefaultPins();
		Node = VarNode;
		Warnings.Add(TEXT("VariableSet pin types reflect a wildcard â€” actual type depends on the specific variable in the target Blueprint"));
	}
	else if (NodeType == TEXT("Branch"))
	{
		UK2Node_IfThenElse* BranchNode = NewObject<UK2Node_IfThenElse>(TempGraph);
		BranchNode->AllocateDefaultPins();
		Node = BranchNode;
	}
	else if (NodeType == TEXT("CustomEvent"))
	{
		UK2Node_CustomEvent* EventNode = NewObject<UK2Node_CustomEvent>(TempGraph);
		FString EventName = Params->GetStringField(TEXT("event_name"));
		if (EventName.IsEmpty()) EventName = TEXT("MyEvent");
		EventNode->CustomFunctionName = FName(*EventName);
		EventNode->AllocateDefaultPins();

		// Apply replication flags for resolve preview (Phase 5A)
		FString Replication;
		if (Params->TryGetStringField(TEXT("replication"), Replication) && !Replication.IsEmpty() && Replication != TEXT("none"))
		{
			const uint32 FlagsToClear = FUNC_Net | FUNC_NetMulticast | FUNC_NetServer | FUNC_NetClient;
			EventNode->FunctionFlags &= ~FlagsToClear;

			uint32 NetFlag = 0;
			FString RepLower = Replication.ToLower();
			if (RepLower == TEXT("multicast"))      NetFlag = FUNC_NetMulticast;
			else if (RepLower == TEXT("server"))    NetFlag = FUNC_NetServer;
			else if (RepLower == TEXT("client"))    NetFlag = FUNC_NetClient;

			if (NetFlag != 0)
				EventNode->FunctionFlags |= (FUNC_Net | NetFlag);
		}

		bool bReliable = false;
		if (Params->TryGetBoolField(TEXT("reliable"), bReliable) && bReliable)
			EventNode->FunctionFlags |= FUNC_NetReliable;

		Node = EventNode;
	}
	else if (NodeType == TEXT("Sequence"))
	{
		UK2Node_ExecutionSequence* SeqNode = NewObject<UK2Node_ExecutionSequence>(TempGraph);
		SeqNode->AllocateDefaultPins();
		Node = SeqNode;
	}
	else if (NodeType == TEXT("Self"))
	{
		UK2Node_Self* SelfNode = NewObject<UK2Node_Self>(TempGraph);
		SelfNode->AllocateDefaultPins();
		Node = SelfNode;
	}
	else if (NodeType == TEXT("MacroInstance"))
	{
		FString MacroName = Params->GetStringField(TEXT("macro_name"));
		FString MacroBP = Params->GetStringField(TEXT("macro_blueprint"));
		if (MacroBP.IsEmpty()) MacroBP = TEXT("/Engine/EditorBlueprintResources/StandardMacros");

		UBlueprint* MacroBlueprint = LoadObject<UBlueprint>(nullptr, *MacroBP);
		if (!MacroBlueprint)
		{
			return FMonolithActionResult::Error(FString::Printf(TEXT("Macro blueprint not found: %s"), *MacroBP));
		}

		UEdGraph* MacroGraph = nullptr;
		for (UEdGraph* G : MacroBlueprint->MacroGraphs)
		{
			if (G && G->GetName() == MacroName)
			{
				MacroGraph = G;
				break;
			}
		}
		if (!MacroGraph)
		{
			return FMonolithActionResult::Error(FString::Printf(TEXT("Macro '%s' not found in '%s'"), *MacroName, *MacroBP));
		}

		UK2Node_MacroInstance* MacroNode = NewObject<UK2Node_MacroInstance>(TempGraph);
		MacroNode->SetMacroGraph(MacroGraph);
		MacroNode->AllocateDefaultPins();
		Node = MacroNode;
	}
	else if (NodeType == TEXT("Return"))
	{
		UK2Node_FunctionResult* ReturnNode = NewObject<UK2Node_FunctionResult>(TempGraph);
		ReturnNode->AllocateDefaultPins();
		Node = ReturnNode;
		Warnings.Add(TEXT("Return node pins depend on the function signature in the actual Blueprint"));
	}
	else if (NodeType == TEXT("ComponentBoundEvent"))
	{
		FString AssetPath;
		UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
		if (!BP)
		{
			return FMonolithActionResult::Error(
				TEXT("resolve_node for ComponentBoundEvent requires asset_path to resolve the component variable"));
		}

		FString CompNameStr = Params->GetStringField(TEXT("component_name"));
		FString DelegateNameStr = Params->GetStringField(TEXT("delegate_property_name"));
		if (CompNameStr.IsEmpty() || DelegateNameStr.IsEmpty())
		{
			return FMonolithActionResult::Error(
				TEXT("ComponentBoundEvent dry-run requires 'component_name' and 'delegate_property_name'"));
		}

		FObjectProperty* CompProp = MonolithBlueprintInternal::FindComponentProperty(BP, FName(*CompNameStr));
		if (!CompProp)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("Component variable '%s' not found on Blueprint '%s' (must be a named subobject on the BP â€” SCS component for Actor BPs, named widget for UMG BPs)"),
				*CompNameStr, *BP->GetName()));
		}

		FMulticastDelegateProperty* DelegateProp = MonolithBlueprintInternal::FindMulticastDelegateProperty(
			CompProp->PropertyClass, FName(*DelegateNameStr));
		if (!DelegateProp)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("BlueprintAssignable multicast delegate '%s' not found"), *DelegateNameStr));
		}

		UK2Node_ComponentBoundEvent* BoundNode = NewObject<UK2Node_ComponentBoundEvent>(TempGraph);
		BoundNode->InitializeComponentBoundEventParams(CompProp, ÕkÅ÷óY3³÷ÙÇ |ñ}Ÿßïo'gfÖZ³f­5½ît&Q×XµK?ÔCµKÊÁL%&Q†uÍA,inİhúi®‚x¹Õ!–AJª‹é5K,W¾Tœ?$OÚz*TÜ" ˆGîQ
×Vñ<ûãÈ„ŸCÔKàÇy8İXoVT‹ñV
˜<éœ¿”Êxí^»”º˜yk¶¶Ÿ‚i>=ÁìÁÈ„[>ÑŒnî»èv÷ÅöQ}òÛEhSlµ %  J-@< ¤,@<œ“`ÕV•H;ö,dÓO:d‹-nĞ2a±Õ-1>–İ2X¿ĞuAÓŒ%n”ˆéÄò@>zÑÈÁ¦.b|Ô2.á ™2I§ß0J’ä_ã4ã£$‰éÄì3?É¢$‰‘$1”yIv ¤Ò	®G²~"¡>Öa2>A2år¹§Oü³à%GŒ‚‚w.H1Äğ@z<xÑÃ{2XŒ;Ù‰Å¸QhQš±‡¢ 	Õ©š²`0<ƒ«S%¥şk¢¥'®Ï„ø²`bñDl½Kµ¥ËÒ­˜¹KIKe©¥|ĞB˜5áŒŞC/ì&—¥Ï
v±À„CYÿ
Òù}»’Xs -›œ®×uÕ/qñıÑï•PµTÚ<%~.^/	Ö©°Õpª¿?#‹Ö5K³w„5J³…Á¥Ù—Ã@N<—øï@”ºTf4ŒâAZo—T¦ş¥Ú?€ş×µ?ı7"ë}nøë»ò>Ûš}¡1ŞJ:Á™@ò[Eê*”ãdvƒSöìŞï°‚®íºïmhô±Ğ€çB v¹ÕHn$8òŞPçéñ’´1‹H3LİÔELçßâè	š7X 7‰_+>8/ŸAÜT;ßÂ¼qÙxé2¸Ùƒ!Á}p;ÏˆsÜ„[%Ab:ÏŒ£7ĞÄÄÄ0	¶!nyûüâaÃÓ éÂ¡OIğA&xVœãfä#BCb:Ï£'Fhbb	b=	â-2Ô‘öatøòo?¾†3£H1[}/¶2Wòò2­û7WéÊoü.mf?×)¾£ß>Ápp*2{	W&õÎA]2]iúZy­Csk#B
Îš•hë ¢¿{>ìß™*ÜVC+,ŸıU´Ó'Œ ¨.·.~›´vuÖù°€ş7³îÿ^ºÉyÒå¡Cé†`+“XŒë|ä=ÚŠŠ•àÑtJÄÉO^ßt‚`§…‚pÍnt“#7†ä{(—#'¼vşêÃÙü_œWâY¡JüÂ‘oE%şœx†oÎ×%˜N,.å7­[Dhbğ ÊLBÖƒBF"Vãe=0ŞQğú˜Ø˜*Q&UÏ„@AŠãUba<É-™€®ÄtGo¡‰é<?Dôú´w1+#{S*¤q2ê	V¤ÒxEÂÚI¾e&3!]‘ˆé¼0¡‰é¼(Jô"&1+C[ùŠtåÃÀ·¥‰GÈò*ŸáóûÈv“­ƒ)ßbå»Ò\¡kÙµ²(¬~ù¼HOÜñ…,SÀİnŠxQe²ÒÆ@­€ïŠüØvËÃê'ó¬ÿ›íúÅqsO£¹u)'¦‹|ùy¹u„&&ÖêaTk
ñ¶ë‹â·!G]ˆ‰éÄªV~‚ÛFhbb	bˆj
ä¶ë—Æ9N'G]‰éÄúX~‚ÛEhbb	bLh‹Ö*´ëE
ç—UeØcw6j›šò;ãsQşòûb(ªFv±AĞ1&u¸w:ãä:€*j0uYˆ¾&Yš;nÏ¢š¢„Î‡ß¿€?X'HYÈŒòR|ágY/F­A—ÌVÉÇú"4ı3Va$0š¬ ú\JêRiŒš!ûgŒîÊq–R¤ÄÃwx-ÏŸ”à)É¡‹ÀH¯É–ú(C:ñc!3Ê«KJjÊ–õbôš2#	6L=d¤€¯ºìR`æÊÎš©³³Æ5+¤T3NîÅÔ+j*«Ëı±¨JğTäÆÁÓ³GM|ÛwCøıñüÙ?‚Ô+Jjª–õbôš*“ú»LI‡Mp<çRğèSï¾ß¶‹¼ÛcK¸“	<8†÷ùàX§˜b*;Æâ€xˆ ¡ä²Ri)ÄŠ  ª,@< T[€x ¨± ñ ĞÓÄ@­ˆ€^ ”CîÓÍ„Ë?‡G:eõ+Áa˜3½Ìiçğ¸àïÀk:<‚'ê‡§â¼VÌt~€[»ÌÅ‡×û:æD*ÓKòl«êz’½h_«>mO¬i…)×fŠüMÀ‹½¬ªaP®wt³—€ZÖ`Rù­l+s!®X×Ëe‡bœ†5"JÚ×°¢¦¨·¹®\d6Š²ëaönÍUı,ÜÏÍ£³ß’•¼´gôt§›­	ÕJÄ (uö¾´Í4ñ ë,@<Öº/É*µÃs-^ç•¶ÙÃÂ:æ³;²ÙÛvmê"ÆÇ´Á<yš—N½e+¤ÓÛÄcÓA&äLLò÷ş\Yñ—ÿ½ñßÿ¼‚s/KÏñ-çı8“%FÇÛ	Ù!û©ıS/7bÍ®İ°–à¥K¼¨Ç·0ñVÕL§0Ãuùİ°ãcÍ“Ìş`y(ñpÎ–ğLóVpÙTú“àAxr~x&‹Wzh»³€\±ø¨G/Ìõô‹åK!uƒß“s¿-ÿ˜œˆy3Ù’¯îşqn2"˜B‘”?Îè‰z*‹7˜Ğí›‰¯VÖÍÍ1&úLRuï[²L¯ø`c#äFCÔ.(º.£1Åƒ˜ØsïK!×?L0\ÁyqjĞ@¡ê	ÿp ñì‘ÛUÚ¤#^MàÃ öqş‚¹çï@kEZêLmî=Ô•f§	cÊ#n‰çc[Ç£Õß¶¥4]ÒQNƒÇœÕe^ªZ¤tr{o06‰Ó-Òo/Í²àep÷ƒ[wo¸Å<á=üOÇÿø?	ÿ—ãäUø)à”uzFU|
Qd"Èç”ÜÇ~“×3Y§Q8#ªØXm{%=K‰‹‹§†m“òPXô2„¨áy(ì+x™!ªŞ à`íÛäŒErÇCÕôü®]h*ÈÌ¶+!
…¯Úí5¼±N(‹Fu3ı9P Yz²­JÍé”[©ózà\—Áú}¤fè ‰:ì-wfİL|²®ŠÄ`Öy¿m!î“â8ÀrÛB®¦.b|õ·òŠÔ!)ÍòâøYP¥à2oÊà2oÊ{¨b‘ ¢$`—àÛkXÀ¦HŞjI§}ìœx-Ã1^ÖT{Œ!.˜, ) rÙ«Kû‡X¨¬u…rSŠR#çÂ›„RTv¨“nÆÙºà…O¾°)ª(•¦ˆ%[ jşG¢½‚)ñœbÈé1Œ Øˆôñg".?è‡›'l¯³703ªœ‘ÿElÜƒ‡TâÂûHlI*ó¦*'(™.Ï9†)Ÿ
.]ã«S’rÉI[_ü’ÑàŸ8e™Ù¥7°tÂÄÃ18ªÛZY¯ltëfÇ!Õxx‹‹übÜÖÕx­<ŠãNâ’^ÃÏK7s}Ành^c‡  &Kf›.sğê´}É‹i=O[‹År:ŠÕë2Á22…Ì™e™á=°âÃ7˜•lIX{¯¬q™? Ÿ	@"øºLYqzÈãÍY§› rØ[ÇŠêH‘:i÷ÎO;*û3¥¨<¢E¢Ù†%škÜmJËÆ6ëa®ÚôjéÕ$q’‚EODcÙßk©a9Œ§VágÀÒí”‹ó~M‘Y´,¬¬”¼ÌMJcRÜík'´Çj¾×RENq•ÀÇQğéC>	Ÿ:´ö‡‡•­µCáaËxÜ–bØÕ¦öñVC<‡'ç¥ÁOú;ˆtº­ğ_Äñ¹NpÃKqíıÑD»şˆäcµ%ã46°`”L‡$º!˜!ÑimYV‡,¹ß˜TmYn'ğ,÷4·.ÃÏhÁÎ@¤‡öÂ²bÔ8˜\:é+ZQmû‚öİØ
vA<ÄÛr•×¸°©ŒØm%ƒ]ËÍÆj°‹.œİ5g0aÂäe.ôíY‚o»Ê>Ä€;a¯nrHºqLk½…u¤éŞŞR•Ìr (²C‡oU”fvÄ—‚9ƒçQÙ´líÉ…l¯uˆx×¤wo+ Åp¯UnK €us¢±„îùXKÇ7p^ƒML2˜ŞÃVãÃšÿ†™eéÌƒ}ÕÔ®1²gl„íÜ)XÅæ°¾W7¹=¿©"ø0w
v³\H£·'­•€<@…ÈdŠ>Àõôù¹¼˜˜£2¼ÖZ«†ÄÜP·g\ÓÛÙreÇÒx-ál´‘${­×l¯òœ›„M€sÜğî<|íU$§Èvö3­mhÆØ¤æöº	9ŒÁn bø“Á|µ$íïxéÔ¦^ğèKuw”ylSŒfp¨A@H%tz(@‹KĞQú{ÀT<\ì˜Xº‰b~55±±¹Í­Çn'CZ]Â(Åå F{Á†E+ÈìëÕV`uéŒL¢7-/ÒDg;5d M(_ ~45OlI²‡„=¹ Ì1Õ]ĞgÂªİìkÔéÖF]ŒÛØÌákfôY$Y8Û(,_–œ’Ä-xòŠ $7ÅÁày=Å¡N$ã ;¿`äñè¶`¦`$Y0 õ@'ªYlõXuô¼e ;İ¼L×pÍ’ÍLSyğ#Å`açÅ9äM·¼d>ñÂmáE°ğ:È‘±t°‘4^¶`ycnİßiŠ[ächËs'Iùğˆ®‹EüÖ 9S×†ŒK%íq:^#HúXóp€û"óPpèò&»;C„Fºg°mŞ«iİÙÄÁÑÓíÍq_7{õÅb&=áñ¸#˜™¥ºyOe¹yûà‡B†0!+ÒÖ7.ç¤oºy˜ã'!”OÍ´¾Ë;KÄ²Z¬Î†-°Ú„<nM›-fT/läÖgïAJö™ıà.¬›S¯Iæˆ“ıÔnM£#ãõ¹©›xÅú´¬17;$½OÆô/ç±nªÙÔš;ÿÒ7@Æe±ÛsËÃ´¢+<ßÒ%Õ^à÷ø­øîhkş/\¾Ezöà¬O>¶z¼”qnõ–gzz=%~iM	røåˆ°MĞğ{ÏæÁuÒ{ÁÅ¯èÒSİÚ¼´Yï«V¨Q›èÏR8
w§h?÷ÚOƒ,Ø8ı›P„‰(9Sğ±e}X‘¢ğRÃj^)çF@ÌwR"¥½dŒ–úªû`Š}C·b÷,ê^îê"–U+û¾ó#Ù;Ò~íF‚¦‰í*¾şqávİ@î{¸PUÇ5‚LÒ_¦•ÃryfF„a/{ÍÛÓˆóQ•—™ÚhnèˆŞ¢¤ÓD‡k*ã‘ÿøl–3ñÓZ,g—3XC#ØÅxyH·!“èÓE.ÙäÍ¦‘ën8ƒ	[ÆÇŒ)ãú§gšG8&„¡T^c×|²„€e…Ã)à0|‹îIıQŒ¸¼)@ÈÅvË¥j0ó³ı´–9uxÄ˜^­ø '-şf¯¹-‡ù×…s\!Õ+Ãôãrå§¹Ù•G›8Õhã×•É§í«ßÿ:^>X>SH‹ÑtD>GR§¶–¼.|Ú+ÂQ/Õu³Fõ6-¨Ê¦hLiAUş+„*;ƒC@‹Ø+ÆúÈ–ÊVF1ôJ’=”+ÊpqjæÀdÑë‘Ÿ¼ØóÿqúÓr¨æ8_Ì¢ãrÌ•¶öQ„+mâ`´ˆ€õ,@< ¬oâ` c,@< Œµ ñ 0ÎÄÀ† )cBkÌwn«İy;cM1åâÒÃ
Öø+G1F)PÌ1 åï8ës ø+d-à¶¬€ø«A;a’& şjĞA&"òWƒFâV®€ø«A8¨¼»€ø«A˜`Dˆü—9êhê!ekY¯-ĞÜÔ%|œEÉ0@©ı>& [ŒÈj"¥ˆ|6 ’Ù€Èd"ømhÀußœTúÒÓö\é~òÅáâ*¶ÎSşQ¨5æ5ŸkKùà+|[[Õ V›M å4 ~[[Ô ÆIÊk û€2À• Ü ß¯`Ö³,˜r]xÔ%Ú‰¢Òbc;ÅÙß<¢ÜrˆMŠ= ”[öÒ”[ş¢á×»Ì)Èƒrk
L	 Ü€I”[0³Â1…¨¹Ë6Í¥Ğ[yÍƒWï‡èN¶Í†È.bšæúèÕ<¼¬‹f„dºy¡–h`K->êdˆ	‰¸Ù¢[Û¶Ü`»6e³°†Ü†¸‹×<w	nûëÑ4®]ëcİ!SëÍfr˜{ QÁ$¡É`C‹¢HÙé1—`æ‘7ícòyŒñWÈãÃãÚîx4ä6#ıÜ%§._P¢‚ñ&’ÁF:‘0Rö8“È›èÊºTxlã1¡ÇBÃ#´Y²Âc“My\nxØ¹õI?w	ÎÛ-/Wˆ
F˜DÀk…:‘0Ò
sExŒŒñUÈƒ'P™³İæ
J‡ğã±^!Û²İ–†Ü:¤Ÿ»+ËS–¨`¨I„d0L'FÊ>lù¸;‹BPá1<ÆcíB¬rT6,/ù9ÛÛ€=øÜ%=—/(Qr|œu…ùÌëJ)û±IäÚîÊ9ã™TÈc#†òyü´2<6ñ˜PÈ£ó¦?ÊY‘c“MyX›ÅxL,äÁgiV(Çæ1[òØrexp€Ùt«BsW†Ç¤É…<æ¯)1Syœ²2<¦Åxl]ÈcÑÊğÀiÏ<{l[Èã_+ÃczŒÇv…<87_aŞÎˆñ˜YÈ#¹óJğØ>Æc‡BV†Ç1³
yŒ_;Åxì\Èƒß~Z¡=v‰ñØµÇ[å+ÁcvŒÇn…<ö[9vñ˜SÈƒÉ]¡.{ÄxìYÈã|#ÇcÔîãñ—B7ØşıØ£!‡l´k—ßh%o¤³q` Wt"a¤ìâLxÜaÕ<î,äñÚÊğ¸;ÆãB_·,§—9x^+ÒEÎQ-Šu0fÆ]÷G<Œñx¨P†ÇeİñàÚE
ãtìÿ`­Ï\1°VĞmOú†Ş½ŒT\š}GKÀU*,«¼«%Yd73tÛrm¢;ïÅx¾_ÈsÚŠyR/œ<½p¶Â¡^te0	«æ­¤w/#õúÜÈ€e4èõ…–!d±²zÅy~ãùU!Ï•Ôk’Ñ‹§ÿ¨İ?Ò‹ôîe¤¢^?°C½~Ò2„,VV¯8O\eIæzxşRÈs%ôb¹Šóü5ÆsY!Ïş¨4äpÏˆ¦©_i0~#*Àí#©‚$\=âø-Œ$“TVÁnGÄ–î'åñÀQÂ8Î?ÔòÀyÃ<8lçqáqAwÕ¸!·éç.Á²A·å ‰lea LÒ‰„‘ş8ç-É1S
y\»eE©1Ó
y¬h°*<¶ñØ¦ÇŠ«ÂcÛé…<şpJÕ{Œ^½|£ÜM2tX$ƒ{ZEZa	÷ÆxÜWÈãÎ]xÜãñ@!eœğx0Æã¡B+2ºğx8Æã‘B¯Œ.Æx`P·éŠjœÈñ¯\óXläxµ»‡Ê <ˆñx²G%V˜Øz@ån1„ÇS1Oòfx`Z¼|‹c<)ä±‚Öƒ+Í(È\³í®²DÉ.2IYÅCA#­pº,<¸Rñàr_ŒÇ~ÆèËkn…×3#²0/ÇŠ
²ğàzfÄƒ+„19Æ£w;f±öàhÄƒ‹Š1\odæÿ!®šF<¸ãÁ%Êòà’sÄƒ¤1\;]!® G<¸¦ãÁåÖòàwÄƒË°1\¡].†Üq\´ËØÈZÇÅ–†”yË²N;><ôq
%\—À·Xæó¢$ğ½à(?- &ğ‹àz~W \ŸÀ_
€8j%_
Œ¥Ï”âÕ“9ÇˆóÛ1ÊqâøK¸!Ø¥„9õRt¸Ö<
 ÛµæhezDvh|Döğü“€ áÀo¯Owœ@ŞNQÇ:záÛ:ÄÉö’x  • Ä é ¹x%ëD\4Ÿ
'ÓÅ7…N¥‹}Ñ"u"Ætz®±Á<ª ²¢-7×îÅËG™El!Ì¥&Ñù =û€œƒ=‡ÁrÇ£5uãã•>)oØèı½¹áéLQüDèØ:AÖ>Øä¹Àá/;í$Hy¿¶á¬ÖÌúuRj)^8>)¿áÔvìÂØµ³µƒ“.I§qY£€‘>÷İS9½°©nøbW/6Y¾8wÏƒ®Ä†ÿûñ¬°¨Ò©7±\…¸ÂÍ&•îÀÙ¹¤ã´ï'˜vã¯B&G[¥<Á¶ÄŠHíúw'B”§–Ş¯4ŒˆêØ? QîºÔ›Ñ(ÇpÌìç´“²u®#\‚£¦ÓNÍ[& -z4ƒzËà¬< ˆ’èm(–lùãjÆ’cjaE…QPatÎXi‹gJ´»t¤µ¹–­oLŒ›H1^:Å,;ƒY&g\6Ä¨/	ù·?lÌÉ „÷³¶”[®AĞ®´ÓPÍ¹½œoƒræd#ÄÅé7S^—¯wÚY|–¬áeØX—‚–Ê§sƒ$øpû,Z	ÿÎô3ƒ¤XŠæ¥n’g„İ7ÉóÍ®¬yè¯ÃéjÜÒÓ•ÔéÏÔ™ªnŞ\Sjœß…íÉ°ElË]Î]8±í)ésS!òë¸)L™×ZTÜRœ)-nIep¥+³V¯òLK]yÆ÷ğJİ8Ò€w;Òq!Å!·”ÈËK°s~	“œ›Ÿ$vÕ±‘Ï]õË‰Ãù¸|qd_}kÈówÎWƒ9 lQ£êÍ« Jn…Ûø»í'{°ú†‘Şß×Õæ@Ë¹ûïQ¯õ-¦OÑøá\'?œdã·ÊdÇ¾âuì'®×Ğ­ÏÈÆaøY“.£Òe\ºŒK—qé2.Ú ¾	^DµHÙ “à$°K¬ ³ğ“¨IÖá;¨§ÁÕI|`´¼Ú«@ƒz=Â•hP¯ƒëß€Ÿ¦öz·¸½7’>r³¯)]Si.éUfwdÉ%ŠÜğæ²Bu¥\ÏkªË#Â¥–g.ó©êó¨²É*ûE¯Ãs­T¼ş(ş±ˆ½ó"Îd(Ê'êYZªß{9*·´T—6äE:+Š”½‰ş<±ğ¨ÙòhñfR©–âì§ˆ”Á5Äüˆx,†Ò¿éµÜºL¢ŞÜGÄ9¥²Ò İ3®!f6¨é!ŸïYÅƒ¼M8§[VSmnV×TÉ—Åe=«†¡ÍÉçJTuµÜ=Däñ µŞ‰×/z,KÿÈbÆÖâ“îĞ–n¸f/h€\#«Aäqëöà³CZyVç„<LÕ¿V\Î<‚®[’©ÁyxKü OÚ?şå²ÀÚ„Wı¹fŠ%ãà\ûlÂWq¹nØ„óÏ\ƒìY¡‹^}ãjõúçšššì/Ì©b5¸uyèt¿Z“÷ Ò%W‹8şÌ0JÁAEÇ¿še¾BŞÄ@e8%côG¿È£Ï8¬|Sx¡ªYÙo©à½¹»ö6ÜJ´üãµµrü÷c=Ã¿…sì±à­¬{¼õœÁpÈß“kUn²(ø'r<4ñ¹×Rk<p®G8·:r¶¹¨>Û÷Ÿ|Pv4~uÙGŠú}Íì±ıÕşµšNÆC^Óó¯‚j8q†Yş_¡—hå-”¥©â¼(wpoØwŒKUŸAÑù5lÖ¨!Âëğr¦ı}(=ziG.DÀñ5*Ë•y9Å€;’Ä…v•Ëe2dçµ`3ê?P{ÍËYÉà}”Q¯®9Ÿ™êfâ¦Ì}!×eş(ßÊªIé¦ªßÏĞe®ÜÓeïVáp¢:<ĞœWêğœ%^šÁYTË^¦TáûÊcÌ‰­²ìÕ´¬”ª²ü·´Ê²ODp,Æ:uM™¾×§©”ÈYÏ€¬8]ª‹ÒëóqÇ+Æ#6ÿ€œ@St>ÿD ë İ^ë¡os?n¼y TŞHûGG¾×Íñ  Ğ‹5p‘>ÿL$…_3x×iŸ†ıX&sƒ¾NûAûYtCNûÁğÀ<Á@îJ¦Â4v†µùçÈ£ù‡’Z{çÓëßˆR×Ñy¼Gí§`Úq¤xñYûTÇQâ=v-´s@Ğ<ÆñïD’	?Ã¤ÑY‘©ŒæÅ Y@< 0ˆ &# ñ ÀÄ  ˜¤ Ä½x¦u;¸k¡L»-›»úøïx×	báñ&x?œÛá>AkuÖ¿=OŞ,Å®Pèâò¥5ªnjñĞş]ÔSë1wº‘®GLs
ÒÊzÔŞ‘Z6uÚ;á¶uü™â9°OzèPõÏE(å™ƒŸ¨_‘P8¢ŸYšŠRmÖiáëÖâdQ–»Òú47¬vf¢ş8’«_¤@5|©ºÉà<¤„|wÛŒa/Y”{(”æ·¼Fén…m¢¨2ªœÏ¨(—xoqùçr¢ƒFænˆ—ÆÍ´¬% ÀïÃë‹ıı1xk¹ƒ6c‡§nÆÈ_Løó,ğ©p‡‹ƒ|M­îàLU}vd‰b–u(Du +¢à+Ï÷Ñ)ò #*@jÇ§
Á…ğæX\S•Éà"äß²LbyÅ·ïğìàbıJï'ÒX›Üöü‡È¶ÃæùöªÏ<›çÅ
'ÕÚ,gÁÅLê&å‡ƒÓ>¸<¸ˆ^Ş/¾	5-nŞIŠ@]TëèÏñ>Õ-a¤KKî=\
ü¨›a£×r(ÎôÃ%¿gé-ÑÙ;—2zlø€o}YÓ Ãm{_XårŠT
>¥şôš‚€ÛGW’OX€¿
 áƒ·nøÔu°d;í:œÁÍõÙE±ìiÎ]˜åÆe#/„5eÚå5åşÍ”¿±Je1>ŠËV»µ_G?=gš3ûjµ«1Ş‘c·ìhDèSŸ})ÚW¯g3Ä_¤Ë†Ô|;“`]°ui §ªàÈÕR£‹>¾º)[&ù1z:ÚpØ­,–%º$`rÇŠì@­(Õ/BWgšª«õ‹Ğ8áÉ‡oâ>í›4k‚k‘â`q’Ùú]®Æ³ËÕ¦Œ•Ø²5Ù¬j•¿¾V8joÕz¶õß¤ZÍn7İn|Æ¾MöcbXÆáDúp×aYL%Ë¯ƒSÜÁ<Â­R×uÉ]‰š¯Ï³&ªWÉ­±ê•Ö9ìvtHÑÿ„ZüGH½$ı o³iæĞì±š´”jı0”t”†Pú¬A«uÁ£qYî$¬ `Ñ'11åeõc³¥céè~Í;Ò¼‹ ¢ ÿ%H‘C=I5eÇáÇ ¸R¹[ğ#m_Ò)²‡èM­ƒããhSK0>Õ+İêqê@lÖ÷ÁQuRÙ>¹ÑÄåñAP©µÜõ¯‡	ı&Ñ‡Älc™Î(Içø‚tºXÑ¬¥t:
3Rét\õâFÜÜOb·£µÈvşbp7‰ÆJµÊıiW”Ö7À-í|Ò®K=!ëRgq]êF`šºˆ	n"¡ú™pH–
n–hxŠfwşŞ¡ığ ¢üS¼ÁªùÍøë#~S1Á-$r–yo3ò­·R®å-ñ×€¸eÅhÚzí€V×µ7D\Ü¡­Šõ™]ì™ª0Ö©?yG,b¥r8j½êŒGñìt€SC©Òt0ƒÎ’Èz3®¶§Óùt\Ès($Nù@Hb‚…hqœè\áˆˆá|3UJA1.¢ ;3œvÑÎ®‚-2j³–İ‡`7zkƒİét>Odad.b“I•–yi<4İ„>l‘—^˜ğæ† ğà­URI<Ñó"õ‰1ê?':?RŸ˜URŸÕ,®şsñD.ˆÔ'F«kñxÈP«_gÕ§‡ê{Í&[‹İ`.…5(J¹g¡v$Öï`/œ- ©ßpÈœY/RÇ£r¼#åé`”§¦tîNğÅóJĞ´x¸"åE»#Áİ§<ûKç^:µ8`¤ø-kËà”å2¨û#ÏØ6a=iN(h‹·	÷ê6TºMH*l=*ÔºêÜ÷°(ß¶ËH›À_´	8¡ŸÍ¾5w;*_S'E¥ëì…Ì…;ˆé"&¸“ŞÚà.:hşK´4	wkÄ=t:_ˆ3¹(ÊJb‚{I„Šÿ+ş}÷ãõ2•øXtf½wu…)-¨ö°î¹áÊĞi5Sï@|ŞÏ­„îCâ¦ƒ‡Å]™éÔŠÛ‰Kóõ½˜¢>TS1Á¿4ÕKqª¿“êq¡"&xB¨jJLP<)€tğ”qŸÖ¥¦( {)‹Å3â¯–ˆÛùr<­E‘ñˆ	*İ`·Ûv`ÕÍñJ<ñK"scÍñjœêÒÈÄ¬º9wc×âi]™ƒcİ.hsü®]È­º9^'~ydb¬9ŞˆS]™ƒ˜U7Ç²nÌñf<­+#scÌQáÕãZmzÛLÒ#½Äs(Aüvb]ğ<ËÜÄM/Š›WY^@mğ²¸Kã‰_ÅÄ_ª©‹˜àUMõVœêjR½&TÄ¯U^eyC éàMã.ÕQeyK ÙæÛPYŞmğ¸oÇÓº&21Á»BÕ3éõæ5ÏŒT—ŞÖ ôˆAŞ_L¨Ş'=ÜÄMŠ›gP|,n'İÍo=®eòŸ ÕÔELğ©¦z7Nu©ş-TÄŸ	UA>@:øÂ¸_j‚È _	 ;ùZüµÁ7âvâ¥¡|‰®BLğ¡ÂçÈøQ,õ£ıh°¡Gò-¨zâ›ªuÁw¤‡û½¸éà¿âæäÔ?ŠÛ‰W™ò“ÿ“ÿ	¨¦.b‚Ÿ5ÕqªHõ‹Pü*TyY&€tğ›q•G©ğ„³–	dw¤Añ×®¸ÆÓº121AR¨0«îƒ‡X|¬¿Â }¬AèÑ#Óÿ.ÿ~?Î8G†ášFP¾nç¹W4t¡@Ãõ=Ğà
F°°È,ñônçùùpNı/~A>œKşg„çgô\b]ŒgœöA?gÁL/.q®˜K*Ü0†ã†`2ZdÜÀ_Œ°rlÆïAä¦Îâf¾‰fÆn2˜àzkƒé`Üğ#Ñ2nøH#>¦ÓùqœÉÍQ^|B"Œ>¹OşŒ(S‰¿6FÅ+7ü\‹¹ìÑØ+oÂĞ3]ÖSºœ3T§õ¤¡:İ®	8k¨NëiCuºó“¸¬ÿ¤¬zŞ@ŒœA…§ÁòëÃ-¤Òbdä\®©3‡:™90uNèrî ‚zSÒëeòPf”ˆÓ¤…GZòÓº5²12€®Æ*8ÙÒª)w[ò“º-R«üçqªÛ#å‰YuåyGIæyÊãm™|‰îˆ”'Æ(Ÿ7}øÊã…šü¤îŒ”'Æ*ÿUœê®HybV]y^®*TOªäKtw¤<1Fy=(¹ÓŸP¶ä'uO¤<1Vy¼Ú’Ouo¤<1«®<Ú*zòÓº/R£¼üYõñºO~b÷GêcÕÇ›.ùTDê³êêó¸j¡úxG&?­#õ‰±ê›ÿÏª‡oò{(RŸ«şqª‡#õ‰Yuõy¯PıŸâi=©OŒUßtïVıŸã‰=©OŒUÿ—8Õc‘úÄ¬ºú²aÃ£¼fï×xZÿŠÔ'Æª_ì­æ`÷şÏª¿,Øã‘úÄXõñVR~y"RŸ˜UWŸ7 s_¡ãÏ[­x2RŸ«~‰·:Ï[üYõñÄŠÔ'ÆªïÄ©Ô'fÕÕçåÍBõİxZ‹#õ‰±ê—z}êÒ?­~2Ø3‘úÄXõ‹âTK"õ‰Yuõyï´P}/Ö³‘úÄXõq"²Ô©ÆR;MÿDÏWOí¹Hb¬ş%qªç#ı‰Yuıyg¶PÿÒxZ/Dúcõ/óSNuÙŸÖ?OíÅHb¬şeqª—"ı‰Yuıå-®‚Æ¯<ÖË‘şÄXıË½Æ2oºÿÙü¯ˆ§öJ¤?1VÿÊ8Õ«‘şÄ¬ºş¼«\˜ÿ=âi½éOŒÕ¿Âk,Ç»óZÿªxj¯Gúcõ¯S½éOÌªëÏ{Ö…ú×ÄÓz3ÒŸ«¥×XáTWşiı{ÆS[éOŒÕ¿6NõV¤?1«®?ïˆêß+ÖÛ‘şÄXı{x•Nu?­:Ú;‘şÄXıëâTïFú³êúó~{¡şõñ´Ş‹ô'Æê_å5â‘·ª?­ïxjïGúcõoˆS}éOÌªëÏ»ù…ú÷‰§õa¤?1Vÿj¯±Ê©®şÓú¯Oí£Hb¬ş«Ç©>ô'fÕõç»…ú÷§õI¤?1Vÿ¯±Ú©®ùÓú7ÆSû4ÒŸ«¿8Õ¿#ı‰Yuıù&B¡şıãi}éOŒÕ¿§×XãT÷4ú†ùCÏŞÕ½ë‚Ï9“€û…¸éàKqó¼p°µÁ×âvˆ§ö9Sû¨¦.b‚ÿhªqª/Hõ­P|'Ty^ß ËÆıAD^?
@ŸıIüµÁÏâvŠ§õe¤?1Á/BÕ³ÖkìéT×úëÈøw´S=ªê‚eDÃıMÜt€Ã3çéŸ@màˆÛÙOí+¦†oÖBb|Ñ;Ç©¾&>	*b|Tyúã x„×¸¸ĞM‚HÜÕ +GdqSşÚ w¯áv®Oë›HbÜÉUÏ^^c­SİË!‡ô“8¯Ûı:¶Ş/ÇcOz¿üB,	'yæÂ.ÀÆàblş. è6<	`óp‰ ¶Œ —
`R¸L S"Àå˜® Ÿš1©\) ı°€«€Ópµ pîÃ® ÎxXÀµÀy¸N Xµ€ë€3ğ`Ön x>¹ƒ]€°7øä÷Á)+ûú'&}şæø™¢Åz_ŸTv}~d ò©šgŠpö:ÓºMÎÃ¦CS§/ÿa±(&¦‹˜ „^¬¢s· WŠ@ÂO™[ìã€[á+*²­R"ï^x6É¾óŠS8Õ…ûÉàrlÍ¤2!Ëğ•¹Ø"(#ïo¡°ÃĞ• û<ê’«ào}gäptşVh¦O²»è³ªuj­MõÙ5{şEû'Ø	£úü³WÏi;‘*ßN;ál-íTNt®·Ó·´S1]Ä•ôÂNÜmÉõ .Uø¡pèk%ì„ÒxSÛ‰0ÅNÏÁÙé2Ú‰;°“œÁ4vÊ¬¬&ˆN)°NŞåÛé%m'RåÛ	•XÊ™ÑNÕ4AgsÜNßÑN5Ätô¤vânU® ~h'œ†ûC;9òİŒMì„K]uà‘Êô€ê5·@ÁLöF°õc]v^Ë³Ém¬S¶ì¬6<^vv—=°Sl2İ¾ë£ÏÓán÷ÀH¥mâ(Ûc\Ö1œ‹”s{ÿE‰öqĞª…uÃ–Ñ¹’Î_Òy,Î‡:Rå§Ã¸Lg„Iç'¦ƒK!İ¥ƒººpZA:¸’È;ø‘N‡Tùé0.ÓY×¤ó3Ó™K§¡óDâqû3éNr:O‡ÛÁ€Së'q˜«aú¬Ò Ølo¤±ä3[äÊÎ£—áˆşH
Ïk»|›gypIıô¸_¹†8`î.~ËŠ[zâ´_^¼N‰Ïø¿‹ıZé‚"ü{²V÷iÛƒÏ>àƒï£âè=£µÖeÏÀn7ğÀç£ğ›»Ç9ç»óv…© PÇ¿ƒÀ«nK‰·¤³©İp‰Fbù¥Q$Æb>óüé¾HGş„%ƒhÓÄÀãö„é[İè\¨_Š–5ƒ*¸ÑYÄ³TcÂƒJæ=	wl#ÌGöæß¶æ	ÛƒóµÆ„µ"Â|«1a90ßkLXò"ÌÄ kÄfØ÷•¿º˜¾€v8ÕÅ2%+WI#ÿ‚],w²¹Yë÷ °‹Ã9’kÂ<½'§¦L˜ÛîY2an¸gynÆ„¹Õ.GL˜›ìrnÂ„¹¹.ÇL˜›êYî/š0G?Yn¹™0?YîB™0Ç>YnË˜0‡>YîS˜0G>rÓÂ„9ğÉr%Û„9îÉri×„9ìÉr­Ó„9êÉríÏ„9è‘wéM˜c,×†L˜C,×JL˜#,×L˜,çÒ&ÌñN–sKæp'Ë¹–	s´“åÜÃ„9Ø‘±¸	ßÀ0Ç¦&Ì¡Nó­8ˆSù<ˆSú¼¶úO:•àxƒ³¿àië[`«#w•IÌÖ†ÔtIN—T8xîã9Íì18Ü¡¿YŒä¬¾# É';/qïÃÖ›sùg[®N×mš©IÔÀxŒ¯fJw>D¾ù.:EwÓÁÅ{í	×i'úğÉhÓpk4â/rÚI(~Ü€m'µš_rôä÷ä¸Ù­|÷kÀëø(Üñ ¡1H/‡ÓÅ+^ â€ôÛ¤¡¨]o£O¸¸¦Ö5;üö*®³ô„êè6sÈ¨”‰ª`æ5•u°¶éMÛ<HöfØ°<a¥ş:Šmú~hóÜl(5ZÏ
O¾¨_§ö²›uªı›õ1üGÀ¦|”N¨ÌUB‘p?&ü˜†i¼ÚŞ@ıÌiÊmí
ÿÆ!ÁÁÌ£¹šrêIá{FJO“Ügdû;œír;ÑòBÒ«®_AX|ù
îUÈ»$A=^¨Æw?í»Åj:Úª‰bKáZıspÊ‹[*‹ëÖ+Ï`(ÀçDŒöÅ@w>Ùˆ¢BË¼H.÷JwS1şHôµøîi/F†_%úÈ!µÓN±‚>@ò*ºÓ¾„qö…Î>ÎÈÈ×£Z[J|^Ä«Ï…j`¿[£æ«#Îë8ú+™ª‹JüWÑ˜çy-ëUÉ“Ïş!ÈùÖVËhÍÛó‰ÑÁ793œÖàWÒ˜DuQn5èÔñ$ÃóÔ¼.µt-¾ ­ ğ~Êè6y7öÖ41ØIæ¿i€›gŠÿÅ°ÿø¦AÄo_¤`êyoHPú\TK…é¥É{ı¦KFô¦pMez¦sƒ o¦2[;øÿ3ô3#áÇ¸<ÙÁà}C?jÖ68]/ Ö´rJr‡¸NûËÄó©{ñ ¤¿bâ±õˆW-B< ¼fâàuO^Ô7,B< |ÓÄ“G¹Ô"ÄÊ·,@< ¼mâ±Q÷vÜÎw€©ş»w¼/êò{¤EéJ˜mÏN°ı´½¿9ŒtÊ^¸wª=mÄ;¨ªo¡âûı4¶x¡A/f ‘*/iqJšõä£a/¦›7AC²øOÅsd?µy“º“q£‡ô‡\ĞEy‘MS˜Mh	u›ÂñGRíùçv¶&¬bÉÎA(•–1–yÓ9W‚ƒûM]Äø£Q÷:?ŠÓlÑããP~Æ¿#Ú\_Ôv'òT\yªö™„t±ÒQí¶×‚÷){á
wÒxÅhHñ&"¬hÔ%5ºDÛ£¢´Å)•Oé•XÃ^J7O²mcç÷8œË"È‹Àƒ~ôDMæçÖ‘êĞñ%¼¨‡|;&j3‰/h3w€®l3ÿÃ¨x+†$Ëi3¡ë1ê‰Pm¿cÚL8´™8¨İ"GûW@w~ŠŸ<óoKÓê6“˜x›©eøU¢¼uÚ	
ÛÌì(<TĞd´-İEhéÂk~¦ÉxT·”?üßn)'B“/ ZJêk[J­»È--åHi)ifceİRÎ¤İ½æüvëŠÿùídÄí¤pµí$Ó¶í$^¦bğ¤¿Âfr÷¥šx“Wº­d‘ˆÚJá,måˆÂ¶’ÙÙÁø¿¦Ÿ(íãÎ @Å›§ë¿ †í#Şvá*bR?°°j6ÊçG­Hÿt%ò^‰ñ‰Oy­µù/´°,ãà›¿¬X¼™ï’{3F	m¹½™ø²üÄ1„‘³Rèø¥‘ËXÔû‘:£(¡¨…ÌÁÔ¶…³uºÎ|+é@6CĞ¶Ü<òñ
øH—Ğ–;„84%Q$ÑR—åSo¯å÷?ƒY‚ş¨ÉÁ Vg€7<å¼ l…Õs­Ma_şuËÂi¯D:}‚Ã IË€nÙáá!	¾Ñ–;‚âUç‹×MŞŒÕ`R_şúh"™O ÉP®ùPÍ‰dÜ;ŸñY:ÿ³w`l<Ê·¢˜°{Í®a!øÈ÷¤‰Á=ÙÎ_ó¬Û>H4ãMÚÂS¸Å%ß sì¾¥²CÉ{c© [VX‡àF1 )Š®3¯±ğÍaüzşÅ.ŞĞ „ewF;ã-/|×ë D“'gŠ£‡gÂR$²Ì\aË5\%Ííip³Í>P	¤”uÃÓ½÷Qu”¾@ùó{V S>.@e²ëí?ÀbN}qQRş~—Æ [n†ºìM¹ª©59˜ß;§½ü‹t¨ÓN¦f´¢ÀÌ#ıIš¶ÜÙÌÖÁ€†´óİôÂñNY·ná¸ÙÇ­×á&UzmªXmhd_‚A|ø¬cï“·’>~	cËÚÌ½„,L >}Y„,LÒäy?’¦i|Ş/dıï¹úy¿sş'ğd¢ğÀ|.Ç½…<Šj¡@İñÀ<.&qq9ìËíİÊÑ;5mùÍÌb[ÑÑ¦¯Í²ğ0yµå®¤Á×É7x^]³Ó\©s€ïI â\Ï8£â0YO›LÕÅñ¼Èe¦Êx…„qÆÄşádwC`1Ù}í;·¯•—ZÀF„sBÒËY<V’^ â€ôÊûbô…“eÌydÂC2wÁ)/ÎÉÚ0•£µ¦8û00häbD,É>B¶-É>¶y‰ _!“J²o…­J²…-K²_†-J²ÿ›g¶¨‹ğWcS™½óü;åù§åù7¸ğ\ş}úÑ®Æ¥2myşyşt?eıX.EvŞÇ¬Ù˜¦²e¤¯›»@¼oÜ×ÍÖ™Úks)¼¼&nÈd_™y„L&Æ™„İn¾S	šÇI³århtmr7ì:'ƒ:Şu>C&Sò™#Ÿs£.%#o°m¹çkêÿ,
Ğ4Ær“TÛÃÅbµ“[Öè 
Ï€¼ÆnîMübéù=8øîñR8CìÎG<Ë¼eÜùğ±©‹;wùj±H¦ckç¯"©H'§JÁÔšÉÇÆYrt®çú¹¶Wb|ìse:†ÂWŒ‹2	Ä¤á_ÆÇR$äñ/÷~šJü—áŸògØdÖôÚ½¥>•†è#R©!j¿"»BÂ¦ìo,â÷£ı	¾´ih{ºêHè‰-Y|šò«…{âÕ‘¡ğs!cÆœ‰ò’ÖFx1•L´¶Âƒ]>Dœœw&<x”¯:3´$†ş«àŞšÊ(õ_¯¥¡8½Öÿ)q³‡ovÛ`8ƒ2;ô‚µávª£ahôw]¹N…õtX¸¸]q—]4l]ÓËö‰B}¼l&
a%kÓ0„Û˜4tLİVoK9¥mENcåpŒå3NšO5 ½¤¼‡³5h¸ŸÒ‰
Ò²º1åçbJ‘,2w3–?‚ëUIu4øc÷œu GYqvgH ¯ŠâlÎZvÓÅ§ŞÇÆ^ÆÇ]›mo€MnâùØ>ÃQ°.üå™%ÁHxğr”‘¢´@ŠıŒÈ‹KS%-x¼†s¼ê…Ì¨B?©¶PCÌ7*çãéCğjì5o°l»bTyeãÂINnĞÛDumO;ƒÜÑ{g1Û@*Ö*/x¡-:±^²-y$§tL§‹5×íèI½$/Oİ
ùğ¶lÅr&_?ö 5 
 KqÃ7ühX‘ é=|&¨‹°­´G±h’=-Ìò–mğ’,uuùÄ,ÇS²€d/Qø1×vJŠjù4'İ³-jâ‡»ÿs?À¬‡äÑ´| óAÛÔZ>8ûÕİjÿÜú@Ìï˜Au/8O‚2¨‹––çZ´k\¬Qâ›…§!u¬à3íşÇLGÏéà·‹lµÒKe¶ô‚1ğ”ÏÃÔ‹u²¾xŞ)ğ¡ÖÏ;>VØÖÚÌjNIğ>˜e°\Ié38<•>¤¯Ø)Ù<]‚®=1eÊO¹š±»~Û…a&Ô’¾[<aÏäøÿ¦¸·}{K(‹¢±cd(0dÈ¶={@OYWI©ÉşÓº’µ¹±´0Ş4m+^Óó¿Abş·øé H#09¥]¼ô°"|×<“ôæÔÍÄŸlj6²ÜÅç¹gT—æ¾£´°½«pÅPá<Iun<°µ™ Õ«‡eîCEjL/E[5Cz+¸ğaoyxÌÌí˜Eğz*VéJ˜ø5~gx	ïä_	NxæÒ8şOTjc$Oü®¤ãÂ£x ˜mâ‰ß¾›Eˆ”»[€x,e[®½R×"-l6v`÷Á ÑÍVŞcs¹	 6¡m2p1fFu7)¿úéU½Âå	óWÃ9´$-]BÑÇWÀéÚ;?YàdX!“òö}­¸âüûY€x¬¬@! ö· ñXÊ¶\&y ‘6Éª LÊo$jó,/ñ€ùA Ëˆƒ-B< bâ±”m¹fŠ1ŸHÃî|=òi%®#“)Wwƒu;É¶	?‡Âq ğaBÁı­cè ­=VÜ¢ãÄõ:§Ï‡%Œ‘è2]Æ¢ËXtßİŞå€v®Ÿ--ËÛ®ìîÜ­•Q6 æ'êDŒPÑº»¦`çK¦)v=>çZèœ×ĞƒƒƒÚó¹õàÔ£†¼c=ïYÏŠbAG¶ÇpñIøİ¼p÷xÔ`,÷ÜîØÛx›x½`.Æ{×Ä{?Œ·"!¨U\t[|˜Fd›dÒ¨3ià¥Èö‹¸Nûå°n0vöq"Ò¶åv Ñ¯(0:]ù £Ûq(FWk|;ƒÒöˆEAlŒÄ³=H¯a·ãZ:éëa<.¹û³‘J¢ &9í$6E‹â´4SÊS‘|«z&Ú\g02lÇ’dF°`¾v"«îQ»Pµ^˜~c`òë‘ĞĞ#,×ïPÂkVJÈ›'Nn7$"ûŞ×C,¨ü:E7ĞA%»QÜ¢›èöê¸Nó&ëúó/Nû{2>ŒÇèbMñ @F d) ñ @Ş LD â@’cˆ§ŸÏEjµËÜæë±™B?Ãßî6x?º|Ìyñ ’¥GÃÖ€íúÀv(«ZvMŸœ‘.ø©áAîÏÃô™XƒÃ]8r‰ı!&‘ÂÓôŠÀ†ÿïáÿTLåÿƒ|M\œ€-R°ŒÃé¦š„Öë„Œ¥“)6
ß2>¥L$ !¼—2é½L¾%‹,Úã“ı1F¬¬}V"Òÿ—²¾«ÿOd]5“´,øŸ¤A#¶l¾R1,QúÌ\“XÖ{I¼ç„ß»w‚_™Şªwtsêá“Ì¨Ò®)3NoÀEq§>Ïéc¾·íÉ¾™®±â‰êÄÊÒ]U8Fš"¨k—¦®›‘“ÚÏ1Ô©Èš¾Ò^7nÖÇ/B£U£²[¢4Èk&>'à«ŞÙíó¬\>öÀ‰Ø/ÁìcÒ@Ä_ó¬àqk>BtĞ1ôãôW;îB£²¬öSú`¯ênœÜlÔ®{Ä;ÍpÇ½lwĞÜ$íx Ûñ\0pı¥èS:ÈÙñƒ0ÁælüıÃéİ^9•óèÓt~»¡5ş#m¹cÁ¯ë>-œC ßNªi°õh—ÒÀoØÏêÍay˜zş–HŞß
?8íW"f¤Š{à“ì ¨›9¤HğúzÊŸŠÆ![ËHß ‡İ‚ô&ù@~’s!ê8ˆšı–†søõº}´GûXBµ<Â¸ãaêÇÃæ+qzr"äÆ‰uìß†ÎòQ8e|ì·®m³t3ºáSÜŞÁ:‰Ÿîøh2cv	¶3´°\×àTJIn2Ôèx@lX22ª‡áâmİa šÉ){»Ñˆ—f¦3vŞ–#ƒ'a!¶evÔºyİPf½çH£=G‘YöO‚í¸çHµÌËÒœ({&ûÓ²Ãœí¹·Àó‡Ü[ +/7?±Ä7|êí6	Âm„(ít¡Ñçùa ’ÁË<É¸(â'ç—ûa ì¾0ñxµß?\.†Ü¤Ÿ½³Òüï?"øŞa ŸjÓ‰„GHå $¹İî—lO{c<ø2”xğpå
yÜãñ@!È\!>yéòP!¾şEkÙ îtáóHG
yğÁ,òhú#|J)âñX!¾1EÑ¡[tø¨ı1hQ°)ÇŒë‰‘rÒ‚Œ#JqCÆ1ğ¿_òÆT‘fíş…04¢læÓèa-È|±):¿<8’çÁS¹+ä¥<8Òçñ¿_òÛã¿ä·OZ¯°ŒñvYTÖ±uça÷ƒÿ°¬ïã±k!ÿı’wÜ¦+ø’÷YºíÆQ6áŸr¥Ã/°Õá®Üûìò€|rÎÿ¸ ØJà[¶å~åH…û†a,¬drWªy“ÎqÑì¦LÁĞ+¤unİ-K¤—%°\¡Æo½9¶1·Ä_9şZ»m­¶ákŠócœBïƒß+±Ğ7°S©Ú'ñ¾z5ü[˜İk¿=r¤ØøG}†S’·İZ­µĞUØâQ7İv"ÖÔ8„ÂŞÀñû³IŒ?G%Ûí¼¨¬´ŸÃ¹	ÆÔ¿Àÿëø‡p
[’
Ç½Ô„!½Úî¥€‘ãRW¸2«şê*ùNÈ'€‡6Z…ŞŸAS¿o®Ö®ŸMù›RG>E_ÇÖw
¶5ìPìZÜñ$yL~š1I×1ş~>}uan*îöOÂVû^Vû~
a»…¾®Ğ÷`HwRÓ1îÂ‹öìm‘oğßÆğÔåˆ«}>°ªPÕæà¢eJ?á¥¸1¾?ı&Õ°GƒİŞ$vÁcÖw2øiºyHMc÷L%LŒ¹nÂÀnè§ÔÇ³÷†şÖ·~èÛ}€…µ…°5CØ³H—¤TÙUÈaØµRııZ¤v%–Ô9ClÜÃ¯FíkâÖ¨Fã»Bùøw›êû„öı#ôy*tµ–}ïæ<ììĞV["ÒUª÷a!JP©¾–>Oİs‹•´ØHê©ó±õ¶Z’Ÿ`âzjæ58…Š-ş´â&åS7(uE^jÙP£‰Zëza5ÂÇæ©],¥Îíâ©çûi	TÌYƒ<šoRkPç<¤a}UÓD¥nE>5¨O‘£šîdCç©¶z|;kÎ«j9_„<_ÖlP@sí[ˆôyªØ½!OƒºZkìØG”:vÂÖÅê¬öí;Óç©_iÎ8ö’.Åj(âRªõeHwv¨Û)¨Mšó6wX~rZs~rhì&nƒºôa{¾BKå©¿~Â¶©={…ù{|:W÷-·¥xQcIXîÿ…)£.9MĞ¹ê©!‹†DÍÓ¹uda –KîgÒMLÓí˜®G§šÜ¬D	[ú2éNkéšÂ„én~’Æ6(öÓ6İ=”ïøt/‚ÓhV3‘ÆÈ;ñU-uöwJùğ5«{!†mø½†S¿‚ß@”Šaêp”ú<5+”t’ñP¯â*á¯±¥]uKûÆ\¬}£Õø»•ºêIÆí26ğw@)ÕGjM”şyªâz >ë§-4FMEº=ñ?Fü¥RŸ½Bßˆs”êÉÆ¨y([^; >ó‘æï’n"¤Ò¾}Ğ"iì!ì ´z;ã ÌÕç&ÍÅS[¡nQ¾ª'¬£5Ú5Š¾+Ô~Ğƒz4¤¯†¾ƒ{CìÇj˜§Nƒ…ˆõÔpÔ¶Ô5ª2´ÆäÇMïûÊ‹.*ôıu¹º
¶Ò\ŞBİĞ¾=Cßã«Q'‡œÏ¼HÓUª]Ğ¥±<7«GÓ9í©ëÂ¸‹,¿›QŠûIMşt:u¯°,<ÁúšQJ4ö7,;iù†£6Ò7Xİqµ.»ƒÕŒï´/­^Œm§vi²q‡Â¦šË°3}W¨›‘:ÿÔ)h7tÛô”rî«[.O‚ŞZÇı:”ôäo´ıÔd”tİ\k°=ğÔøõt›¨ßPş^Ù‘°éÏY}7}Ï˜š¼¹ê…v|wpòTòCûŞL·R}p’m#‚	uJh›úbjS7 ¾ißn;XßÈAûæFíóT%Z3ömª÷1vøëÔ.ö½İO§Û „ş´K:Óäôu/Ú5–lOõ5¹:B­uÙ=õTí«Q;¾fûËÅa¹ªG9Õ¥Îõ]
èÅ“°•öİš¬}3ÓôMRQËÇÚ3t ..¦ï¹'l};İø<uxXÖ¶4>æqä©ş“Ñ#ö´÷ÓáYÈİ†]UjTÁ¨O !%şÍQ®PU©ãa¥ïĞV^ ’ª?`Uj´ÚR‚—”	™ù¦yG•á/!ó?²±z@B^34`7C h¢ŸZ|Œ4‹?°~*'uĞzè´ªv¬² !-ê¯ÉA:
)K ×ÏÈwBf¡•ÙÙ–&d¾•|³Äz7¡µ˜£6P·dJ
i&&6Ãé½bİ†şSÇºßš „s±;Õm‰RĞTc¼­ÓzB½#13§Õç©ANjš%êGás€cSA;Lëˆ[-ç—U%°Uê¥ï,ämµ†@¾¼ÙBŞS#²ëmò¹ÚJ üf!ß¨]2u]kñn×‘óàÏ4äõƒÊ
¤åCùEu
¤.´|¯Äm™ÆªOÜç(ğ9
¥Vs^=ñ´Ğì…_B.PıÏä²ã-ç5Ÿ
¤'z
MÓšøA ¯™¼¸ _l+œÃX$	¤?ÚkëÄº¹¹¦!Û%ÆdK×ÒlŸØ\ !ç}³²ß`K“Mì))Wó90±Ÿ@ÎzÆBM$ºĞ>]9ãKsxâT–*uõ×2G”¸’  .“óuVÇÜAóXXÆÎM< |vE«¦S¿,ñª@ê?¶«¤ıE¹>ñµ@^¹ÒBnLü(¹¦l\ nNü&ÂÒrg¢
éV©coÒ±æ¨%†ä’ç-ŸÅ‰1Ùğdy>±…@ZŸµ—Û
$íüFb¶@æ…2¿›â„õıƒÄÁù)Ì‹'H)ú,­ûW‰Ó²c˜ïÿIœ+†0Ö÷‰K4Ÿ0ßNÜ +ÂvcYâMB’ÎãÙ8,½ÅÎ³IÖÜWĞƒ3õYªÌyOh†¢—ĞùUé|*‡Â:˜v6ãªÔaıÂ‰¯"§Æ©cà48•Eäü­©q³T_@kï°¦4:U¹:l‘ú;E‡#Ö})uı+,-LQ wÂ†2D W€…¬%·ÃB†dĞ¢²nŒ¥šM_0GvÖ+rÁÙÎÔSäö¯Rßìh[~ßÙ¸ ’q6+€´:[@Ör&@†9Ó
 #œíğV•Ú%“sÔ(g<‚r¨!ã>–U¥özÚB6v*àƒbŠ•YšuÜ½=êu€g!#Ü}òKÒBÖu÷Èß+-d¤»¿@¾«²QnV ;•ZÈh÷@Ü™²õÜƒ²f……¬ï"Ù¡<¸óryK3Æ] …Õ2ÖíÈ;52ÎíH*ä³¡{„wôÚ)´Æx÷(Ô<ecM0;Bnæ'4³1äßµ¥{¼@vC]ÖÉ’~×B¦¹'xEHkİ³,d: ´ê[[ÈL÷oùîAÙİ=ß‹—Ÿİİ‹
 sİE=İË¼2pŞøÍg–ÚÛ½²€æ ÷fI«w¹Mk{»W„²Ñ£RşÍQ‡ºw
ä¿ZÈ1î‹yõ—Ç¹¯Ÿ¶,ÍM®[|$RŸÖ‹[İTq\‹Û ¡„ş':Ö,u§[‰g~«Ô‡è©ù7GİëVÄzĞ­/¦ÅœG-Í#îj4¹BS4ÉÒ<é* yÁmÅ³pU¸&¥µ˜£^v‡
ä0õWİYëbËçw<„vŒsÔRw¼h‘6òÌRï¸tß\ú„@‹eC-ŸÏİ±¾uw-ˆõßßA–¹{Ğ$’û
ç(O‹’Ù/y`¤$yp¤,Ù.|>ëieò°	«’‡Äªş¤wòá“k÷êÉS²´·Õ}@ò4”…5wPòŒ‚´š’g¤5˜Øğ…°•X;yYÍ:É+
 £“×@Æ&o>‡]kåÙ0ykÍÆÉ{ “@¶LşKøàâüÍQ““OĞLI..€LM>+±ŞAÿÎ¿§œiÉ2cZÙ&ù¦@nøÜB¶M¾]Ì•æ½Í5#ùnñ‘€ìû¦™£f&?‘XÛÈgûäg™ù\ óò _¤Æ	ü›£vH~-%|‡5d–š•ü®8ËOÁÜ‹³ÔÎxí|@Û¶èU°¡(bÃQQ,&t°ÒÁHT$@€$˜‚€PÁŞ{{ïÇ#ê°÷†]ì½÷ş×šÉ€è9ç¾{î{ÿıÍ0³gïµW_k¯Ù“˜dyåàîì@=#¦úAÀ÷ûw‚Ø	ñÓ•9şú	·k5ÛU‹Øjr¼ùN²Çñæa	%•¢Ç+„R*V(“ÉUTŒ˜R¨e”DFù(©\$æÕ¬ij­âK=H}b\BÌÎ~ÊˆTu’&/¸®Æ¶=‹†¿|3áKfÌ¹‹76 şÌg¡İh7tu]ñ¿ö¯æ›à³ š ‚ñ$“ ñDóéA!6pG5àOf4A4¿ùC•£Î©×:ƒy*qš
®ßt…_¤ğÖıPÍS(±ĞÈà–	'Fğõ¯Î§+ˆ‹§'Ë¡#âŠ83°ºá…öÓ•EÛ g§¢ÙKÄM0$B(h>˜°ÍÕš ÊÜá"šc½æÆOşx	ºy‘ÉÜE\Rx4Ï‘vä#€ŸG¸İr8Al„¿oğ\ RHdñJì±LŸ•eËŞb%œ£èZú÷D’wÂµ%ğ¨¥è/v†\’Æõ _œòéHX@œV‡/ş5Õ|ñœû„=‰çÈÌeD*iDÔ!ñØˆ%k·à–ñè-×˜c.sôaBæXÌíàˆPXXHµ	1  ×#B@šmáhFğ™£;sôdÌ±sìÇy€ó>‚G˜‡áØ˜x Ç–ÄK8¶'j<Â‘è
ÇÄr8z»àØ0Ôã8d²”ò ÄÆŠ8B*aví§>Ã	ö{Ìb‘&ˆ=å"u²¸3!HWªÄR^¨Z¦’HÅ„8F/ŒI{ª@<1j•˜ğT*ÅÒ˜äô0‰ªªf?I²8\¬PJä²ÇÊâä
©P7…É?íå#VÆ*$)ØKÂ[.M‘$3CCÅÉÂ4æL©½Ï¡¢ RbU?Şğ–§¤+$ñ	UŞ’¦eéÚ1úqN˜'F’,QéÜÉU2±Ê%lN)W+bÅJ(9¹œâ¸dq,R@ğbUr×î#ÆËäJ•$VÉ5iæâ±Š±"Uàˆ’X…\)SÁ-‘Ø8–®”(yary²’Z>k¬R‹ñÔ4‚ûAhÍgµşqÒç{wyëGL±ûDP$YMŸ"HC8©S/kUÛØ%jDó¦™y„5Øe&AÌ€ñF`tx*ğä£ãEÍßöeÊ}½ñ¹Vƒ=&_ëv¨é9½]âß¨¦Ñı:Ï*&¶³à.õê?ŞÖemşúêgKE7·›mùˆ¿r}aÍ<cûV‡í’®ıµß¤s—ïôpŸàëmüàv‡Q­ëuZøí¬‘òÙ‡Şû‡Üİ_tËr±ïõ7IíÚ×õ_W$nÿ¶¨šá€UÕHM¤°BlÂô,ú(„)Ar™oZ¬˜Q§°…|°’„~ˆ=A4"‰úål¦¼åŠ¹‚Q,‚p$	ŞşUT•wy”gr2Å(“’ùƒÄÄ"AˆI"Ä(ÊDT²D&¦T +
ô¿ ö* åİ’Âûá¥Z˜Ly	•’X*¤BÅå(©¡R,¢ä2Š'I@sbå²8I<¥3£•0‹9IÔâƒ?å98¸ği¼j7’ğ…6ô²vˆ$æâ9¸8:¸óø´{{GçgwÇqL\lŒĞÙ-ÎMìêæàî+ã;Å:¸ºğãœEn.±.Q—$jVP#‚(…Ny¾İÅTø&sn¢\	9uEb…-%UÆÊÉ’[Jcå0À?[Ê[¬R+ÄdbµJ!L¶¥BÔ1É’Øîâô0y’XÖ)ÆÕUèëìÂwwtÓnî-œŒõNÜœ±
¥Ù¾ø	ñôÁÿ/oç¤÷î9ñí–•“–ï5ùÁµoùG’+gl_»›ú¶7î~¢Vuz/L:d±DxØÏ¾ÕéÏ¯¬ÏÖq	?»Vµïì²È[ÈÖ‡K§¨‚.ºÎ°¿Q–éí[Š°»y§ª=˜ruúã-ÑŸZZÏ÷ìó²ı¬ƒ/ß½JÛvÿMŞÓÈwÄ>4HÕû´~„Ç§BñQòÜË-¦#kD×ü–ÑÓ¬KÙ³5Ñuœ8i^m»¸~jøƒ“œ¾muÌzİª…móxØxgÉŸnîízßr¬këŞî“„oZõuYÚB?ÔÌ -4ÉØ?ìàùWáï^©û4ù2¾42B`30úPxTõš—£ê´i-}ĞS| ›@rdŸÔ{w‘ÔêBYæÕÃò­_Ëó‡´Rvš£Ì=;=u¤Í`™"í·µ§Óşˆ£‡÷su>ø’ıˆõÆQ|0$=ÏàïÈ;²jÄ\KˆÉo'AÛr0¿›Dß†1r†»p=¤AxÀ½2h{±øô?W‹ Æ€œ ~O€|´‚Ü¨1AÜ‚ 
ßvu¡/ÀÜ	ß0şÌóî‘6¯	¦
>¦+ŒáQaÓˆ du ?ŒÙçúĞ×æûRŸ ba¼ş~¶88Á½ ÀiŒÛ¸,<„Ğ7”¹c3‚Ø
} >‹`Ì¨¦Q çŸ€üÜƒ9‹`n%Œï ¼øÌ\·Â¼õ¶sÀ—E$†şÃ í,À0x	0f;Ìo°\ÁG"=‰(Èz$„’PÁ™œˆƒ£‚C›Z$D*œGA«ZğLwñZ×"hÁ«¦oÀˆ‚1r8Š‰4"z¨™>Ø_íRÍHœ!t„/#âŠöÿC˜àº˜à5‹e,¢OÀ8™¹ËR‹ônT!º¢ {ä–¨IZÒ‰0 d£r”ãÇ!´)©ªå,8®âı†G‰ /úàŒÜ]–çØ§"ßc¢ú
>²¼DŒ«š‹…ñó9ZX<P6	 µ"
f3ø(CÄ©–Àr û‰ZØ³(¸¯:Pƒ³(è%a®&Ä!½® #”'Àµ]Œôq!@@=Ã{x¥€¯Šé÷£"l!èbˆú+±ˆµˆÁ›ÕD‰æ>bE.ÇiHƒ/êb-‡Qì¼(I]]wV¼ËrF	”Ša¦©`¯ÇHOhı'ğg¹„Reµ‘Óä	ÚŞ?AQğ†€¢XF¨ÛçF>i51@Î³ƒÁjY*#	VOÃ9k[ì=ğ•3§Õœ5²Ş'…ÑÔŸD˜»²µ°6Ìi\<ÀF/…vı£¶ÍZÖÿiÑâ‹§¥ãïàüpvğ‚„À´t` kˆ¨¤èjP9Qü¨†H4­JXˆ	 €Yk‡e@ÔPøÇœ#ë©ĞñéàX;Gô„•šHåÄj;zìª¼‘ `_ù3ôSjM?É(˜AëAĞŠt5‡µVNÛQ_XÜ8)ˆ
"	fÕúôñ0hBo3èy×dğïG§…Srà*:R9 E÷Á*ÚÏL
]ëêCø•ı;'R0Ü’1E„$°Âg¥¨$B`JÕ¿sÊÁÀ<d2Š‡2Šˆa®­È«dàG<1&şwLÌIEÃZ92¥*&nÃ$õ¼á‚uÂ‚rN·‚†ÂU+~£ú|èt‚Ä^jörâG/Ïjë_Ñq6FşJ¯ÿsºì4-û	Mˆ'›A¡ñG~¹–ŠÚªTœóFèÍQÕÙ{Ş`—	 m
¸ÏjZw8pG¡FgÀøÃÆ×Š9„’¸˜¶ö!jı"…ßúÑ)	HÓyØ•m2Òá°ªh®$„0ÄãgCĞŠ9V`ÃàÀ…HÎ#`x‚tÃ6#ÁÜóÌÄĞ‰¢­¡+e5iDM­¬¡hèGY}e31íÔ,›a2? È&nÈFÖ­	æ³ìF/Îj9›‚°"dGA).Šp  ¯ª ?Ê3r]Ò9²LGƒFz›ÁÊÀÖ°I¨è"#6ÅÇ”_Æjƒ%Zp=6bã¢ÍÎ#«ÜuV˜*ŠÁ©s°'@·64–¿ˆ3›Mà²â»:;pÙÀ€âÑu÷¥Í;
Ã¬Ùal›TÎ
•Ä{èÈócÄ§5”_»sX$´|ÖU¬(†ÇH°n†ÃXdP
ïNt0áº`Ğü´ZÀj‹›DaÊ„*ˆc?“p£Æ¤X»lR" }™¬›ÎÃRt¨Ô¬q¬ª¨.œ¶âìJĞˆ(XĞ y¬™²i¸.L4vy€Ä*nñÇš–Jv©„¦†î¨"†8bœ«Qö"bĞ
¬• ÛÌš«Èh0Zp®°æmWÕ -&\gİ+Á×²F×LY; ‰Q0  "üŸ@^á]”’P1y¡‰ –t×§h¹•µêGäµ +2CN3Ù´ü4Lg†Ó¡¡"(( ´èè	Ë­»*tí [6‰ıØTA7—×æˆHdUy!&Ÿe‡.Æ\ÊÅ¹ÉªS­„ƒ ­dOPæd @T²’ù«Ù+òçÿÏç¦[óíóŸgÿ}¸·‡ÊRPWwA€1]—`ÒÎ)®¿ÂB zNÈÚ"ŸX pe" l	e‚š+%üãÒPİÈq†¹à0<W*øY¶¡õ~WÃĞ$âg‹¨’è{*.Ñèñ.—HjU˜U_Î¡ÂÿGVL“p†"d\™ ¡U%8
ù…pY£Ğ5.[7„2a°ªúÄë‡( ˆ­ˆšn:‚îó!%1€ı] ¿Y¤‹§Ö‹iR,NW:†çg 
ªÃró¯g
öPúÌ$ÿş8­äØàIK°uA¨c\	ŒÓ-{9«Ğ2¹?`aÍ"¡]í¡k%Æ.÷BGú×¹¥!›Ì£ß©
zEB×¯$ªC­y=)Ğ(!—¯ * ÏÅjpvõhÇU€'ÑÃ5êQ*`5^Ô¤ !Jc^¬zs>¦7YÄfÍx…¬d«—èÅYÍd5Í¯r×pö@E·ŸGvİú×¬&æÁğ ÌsN)°©èØ<¡E·¦àÃP­8-7®ˆÅåï¢°XÑJÿ.•qa]
.š›Ã«ÊnÒ2êƒëcÖòéÈ8äF
CX1Âc«Î+J$ 1PÓĞ2ŒÑŞŸ%Í¨YZ¢uœc!ÑÕZ«ëœttMõj
À	=×C«øœ>›Âƒ
-bºîÒ›èAÂt¬¦¢–²%6ÑD<íXõP]3ø9€  sÕ XÄ9şÄ" ‘]ÎXİt“uş,Ã*:1ˆSëòq¥‰öÄYŠ*–?ÏŠ /”Êƒÿ-\$#SU„<ÎšVNjË|ÎA°ixU‹zÁÅ0vú×jJµ
Ù‚Q“‹3è 0Q6€—GŞÏ¹ÀZİŠ|×8 ¥ô†Y´õƒŠX£{ö è®ØT×Ó¸ğ`³¶¬€~HºÍá‹e]ª‘¬„°*[ “fü«“êV3*Vv~œ™‰•×Š®ê9LŸú¯M¯K§Öi£×Áœ&üû ‹½÷ãB¤<ìûgS¾È0ÌåÀ6ŒÜÚO›G°®F7£ŸÀW“UAÇ¸«òcµÛGN²L¥qŠA„/,‘{¸gÕ•yŠ¦1‹\ÜBU¶Ğ‚²Øc¼«<NAÜ|ÓªB5<&@?‰~c
ÛÙ
ëÏXõæÌ Õ[\AGqVˆEÖq…Ô4BÇ=zCÄ×uø!†³Ï Ø:[æ8Ç…œvG†rã˜l½+Êµ1® ÈÕ¦›Úz-ëñØ5+ç¨YúÏ” ´˜`üEÇÖûp-^™Äë
Ğş„ì}ÑÜYş±a¹£¹ššj.¶"÷Ø„•]µr‹
ÿœæTU.ø+¹ZÅ`Í:1fUe«ÍîØşˆêçz9ÚÒ`÷BPŒºÍÂÔÆ+CZ¨Vû«¢¹¥›[±G¬°
Îru@»¿€1\ÈRa7CÇ> cÇ<Nmm+²³.Ñ„
 ¡q†6ÃÖTØY•*+Z›@Áö6•DÁÆ¹¹¢dƒ”’‰cä”2Y^²'©(_jK%©ÄŠ¢U°ë	îH…‰Eë˜TEù*yªPEÎ$ÿ‹@ É£BäIj£†XJãEQ~†HVTh‹Ír5bƒû¸4XP©%ùâØYº†Œt¹„ôÂ„å”©©’¹bèDÛjz©qgt¢8I¥Ö¡9VLÉc”Â5´²|Ñf»r9\‘‰B¸Ğ©¡H(+Ê·¥Räê’=’D$‚Â,EùÉx_(‚mjEù%syäpï}(·1)’‹DÅó“X!ÈG*ÎÃîm‰F…è¦$°yQ" RJæJ(yŠB˜Z<ŸRªÒ“ÕTRÑ‘†*@5&¹h•´d¥¨¡+a»—ŒGæ’ÿòŠÖ©¨Da’wÌ©ÿ2*dD,GÊ™@'%Ç@7°›š®J•—ÌEéˆ©T
Ù½Jªå«šA©Bª› 8ˆ÷+ØåLM‘³ÀQ@ºàšSÕD<²9î-*Ì"*"y’\V<¶Æ0j=öŞñÈzÁ¢$a%Â^CØ7š:« sH¼¯Q51òS5N·¨/µ$YdK©´7Ë•˜GõVO«Äå$h456!ZYåé Jå¨ÉBE¼Z*–k;–+’”)ÂXqgéœ¯¤>¬"KÁ g…VÁ‹pÛe);Øm›;y¤3T‰Š¯*Ï(·–DP¸¿'ŒI˜TŒ¬GÀäh *`*hô_Õ5ˆ±Á?A‚—"„`Tb•B,‚dr;°I‹˜Gš
À‚X"ëù°ËP=4%gáºÊ†r”kI–ƒŒA…U?$ôBÏÊ8Z­Cù·	2E$·¯j]#òÓ^Px3Q((T¢lEòp‰@ ”ó†éĞ#Q˜‘:î·ÈVØ Ë#-ƒEŒÿ Â)!¤$¥ÛÛ•là‘M"%%ù%jÖéi}šÇã‘|ÔXô«h+,Ò5ÚË„QåàÂ#]@3`n9=Eù ¢”)j%¸2J"M«ê<F&OEñóHÇ q
œ‹@&0W¹§bœ$çwĞ/j˜5Äai‡ƒDB0v˜c DEeHA·Ó+!Á#­‚Ñå‚©Š'&X¹¢ø¥|Q’˜ÁİGg,OeP×w›swå"v×ü’ğÈF\—pvàùjå
rºw¯"k€ M Ñ¡`°/§j™Ø”k‡?/¦£ó<²µ€ÑÛr6¨©x±LŒÕH)Ä ,ğéNºi âtH¸-%ŒÁˆâ(Z'‚]Ö2!úTÆJuwUóÈY¤ÎPzÀËJ°s;AÎ‚Yj„¡NJ6ƒ;E¿*’(“t¢„¬x>¸SÄJƒ²LXÎ%aK©7­ÑCô, éÔ¢B©æĞº/eĞ‡0H› İñ*Q)³šº£™İ¢BG­–kÂ1(l¦K$gº\Ë;hÔÁ†ôT°0V¹c°è´Ôˆì!LP”Œ…ÉÁŸCÒ€^¿œrV¾©éÄ¦›GV×h<À#›Vƒ7ƒ€Œ&ÄÍŠ&ƒ“òHQçœAÔå	˜„}­Ó(MñD#i¤“h•1Ä”ÒOÜ>T£™–‡IĞ!€Ìø¢gšXùos¦¿œV‹ÿ¿{Ú¶ÀSd£^·=¼y !H¨Ô:t/"q¼!ú›"ÇÌ.òEô‡à!ÀGG WfÀÈ@-„Å“A/˜q#Épk`¯¬åÊ19+Ç¤3ÆÄH,9ËÆ…VÛ¢½1+&eFƒ©ƒõUé¨ÑM—0*‰ïéàl”u çª“¥WNP!òTtİéä¿:Î¡Êùt“åçjcì+QUNVú7:S2©`8˜äË3˜¨Vî1iÃ%J–EëR™è(Ç˜Ë› (1"n ™”ñ­Ø?c#Œ®À]´$«=ºU¤GÊƒT@nE»ÀÅ‹KÆ B"˜@ˆ¯°BK•ãe• ÁK¥éàåjjP¤Z"V€—N"%2‰T˜§²H|áÏD‘b•Ş¬ ÉbrÉ¾5€´AõQ&ÉÑã ŞŒ^1ZÈiëä¦’Ægq­šEN¹EÂÚâ®XÁÃ)®'X_ˆ>¼ü*¥ª<T°ØÌ’]µÁú2˜°CúÉ,A a0³T5œîbƒGÖ	îæëF¥Á=z‡‘­KæhV›3BD@Œù°ˆ]Å!rTTğ’PÍ°ğ€uO
°E:ÕÆÆ^$NµWªD™-ecgÓ‰b¥rÓ€“pŠÇJd±É¸jfM;;qs	±3Û f{R!Œì©ÍæË³´X%gÀâªU“Vµ:À46å'I?´€÷Œ !^oåİ# ±²kÊ¶k”MÎŸñ	Üí–ìmx!Yù>¼¢Œ¯=Vîä©?êrH=r3 ™–Etltàx\YA WÖ Æ.Äâ4	°\Q”Ÿ*Ô¬vÊ¹“ÄåªL<dõ
lQÂ¨SUÖ oXÇAŞ2X¨º‹
š”fòr…Õ¨‡vö€
©+cïà&Ñ¶)&ç÷Ë,î1õ‰S!ßSá‚S˜¡é ½1óÈ~8„LÛÊWzºà@ÿËqæ‘İÿèreb°o1• ò@¶Èš%ä¹İ~VsBXY1«kõä3E‘œ"ˆ­¤ a
Z–f=¦Ò‰ ãâùà×”°n ¨ğ»
Ye…ü¤D	*$„B˜–[;Ëã`‘ÁÖoÀ-°= ¹µc©ø~=$õ)QÃÊ˜ÉíÁ{°q¹<®ò(XY2«q´Æå$ÃÊ‰-»ITE…<Ò6Dã÷FÀ’£Aœ&¦ÔÒ¢uHj{*k[óÈ`¨ş”ÌÅz€†.™órÇSõR†êıwb.8AZÏæ¿H·!é'—G‚{—0é “P2ÖÊ%”,Ù<èÔ&¨À~uŠ<C®€|Fp^[SßĞ½…¶Î”	@hPğ`W ärEN+bäJxqã_yH+7íXÙ‡]›÷!EI– ËÑÆ¹¢‰nÍ´İN†UD1D@xÏ9Ë’LÙş2¡…Y¨	4µ¨Š1ág±Şò‡,í›y+ìTâ‰=Ä>Éí2e[»A2ÿõëutTX×zÓ˜!s;+òß¼-¸İúu§2q“‚cá3ü>Üê‘ùÙşË„‘ãk¥å®>TºÅí÷Z]JCÊ˜>¹CBÇw¶)ª9¼úT[ñÖÅ_Óg®	ıKfOO|³`¡{­ëÛé°ÀĞÃëúveĞàqj…Oq´öò:SÚkİ³SÑºWQğ.¯OrrO0,‚yU,f^ÏÆ>ß[ŒÊÓèşüœd˜¯lfVdû‹tíØ/ ¾}3	â¼cÀ}8Ái8<ÙÃî¾°9K û
‚‰ ¸„£û«D¡Áóoø¹>ü>ÁËÌ[Üp¢‹æAÂË:>>pET|Ú€ñ‰F <Âø±&pTÜÅÇ{J¸¯İ$Çt 6tƒ.$à„OVØ?BjÍô¡áIûÏ	İˆË dXKË*¡acû(‚y²TŸüàóŠÁQQşûj¦P ¡%ÜãÆë¾!@é¼!@1ña9ÂcéWÂyŒd7¦P0›ZxĞŸKáü·:SLOíÜøz~zÀhp´á{@¸˜ÛTƒ÷{4Ü«ƒ;˜ğ©‘
fAºñİ<êrÚ‡¨°8¾V½ÏaâCUÃ)a§áËØ*BÔÖÁ>åv¥àX>Hƒ›úæÜ‘‘—;Ş&úÂ¯¶Œv°ÏÙôZŠ~>7¨Áøäy‡ç<ÀŸH£!ğ nhÅ‡ÈÉR€W¨MñğO}Voş:¿xĞ›İ¾Aé@A¹²xàN|n*‚™ñçX®`MOÔ3Ä‚ã5^á#ê_ñö×ôuddÇîÜbß%TUĞƒŸóŞĞ<HÍ®/nleÉ±rceGƒäì}D
Ùçùøeê²u ÜáG¸Ão¡8Î éÎpîÅğé î;npîm®pÄQnŒÜâ`¬œ9@»œÇAOÜs6øÕĞ±ê€¯'`€Ö#Xø"	y®Õ¶Ê8óo  şoşD³¿ôÛÿÿü?Çæ7®ôô:Û¦«‘I»œ€œ÷5Ic½¼l>4Ùé‘$¿6]ÓÈ$:'€ëè‘†İßÈ´½i@f»ê‘yAtºNKmÚDŸ$ò–èe4¿ÒXª•°)ï5ÉvIÖ—~{Ö»˜zíQÛ-û„S¨Ïåe×ØIg¾¦³õ¯äéë‘zzæªÎËvÕæÖ‡(!ò ‚Õ KV”úğ«Ó&Fú½ŒÌõzøVt¼05¯ú'^ømèÖx_ß¼™î¼@%C ¹ñ—ZB¼=)ÚÁ‰¶jPÓÁ…vâ»ğİœ]İ#àÒ.5—tlÅ‰Íé:¸š¹i¡2 ©ä2¾]ÍCÅ"©\&úSüjÒÕYü°ªAg“-t	ègÃ/UA»©^6üàÔ¾ŒDÜg‡¶ŸÜW×ïæµ?Ÿvoı>mÏ¦¡mÏİ<üÁsÅê¯>‹.õ(©Yšİ7|E½İ7ZÒCâ¾dšoİßşÊ×ñÍù6––¯o©M‹{mMiØët‚¸îÛÛ§L3#Ïhß¡®·ƒ?˜¢Ú•8ÃÃ˜ßÔ?TÈã?\ïûxéú‰G÷œfÔÖÈbÕı£ıŸoı¬w¢©ôY§qßƒ’Ê¦um]0¦ÓâÉÛ—Zoõ~ªñõ/Á9¥×rdkÍÖóöO¨&{´qï5Ó•~ié›Wã÷¼OÇ·šïØÚõìô[¡ƒ(w¿&o>öÚâ&wê˜¯È/n4Ìùö˜COîìn;6?3•zÜP\šM®,g˜İ´6I~70Ğ×3Î¤›+›¶2°¤-Êµ´G5Ò¨è°¡¡±¾>İ;Ô2°0¨—i²5ıûÙGOÖ5n}vâÅ5z·_L‡áí:=éîËi¾İeSİÜZ«;¸Å~Ù'ƒàO?)©©D%ñ-èzØİĞ¼¦“‹“ƒƒc{gÚÕ…va±j‰XeÖÑ¯KXóËë‚ŸŞ½·´ÔÎhFİj|:§mfĞîC÷ÎäõÊ	NP©R<ìíÌ“–ÿ@T¬\jŸ’$‘§(ícÉöå8µr ñ·£àF§á´¨×<èKK9¤¢p×´^N¯?L¬P)ÿÆt*ºdrÑƒ|º¢ëgë‘ÄØ-uo”5º1…¨y¼QX¿ĞïËò«GÖüÉ¶Y8_::«u½·§:Mõ>1QÜàVóŞn-'“¥£ó:>ùfÜA|­^³õÍ:—œÖ·j1¼ñ·û;Šä»‡×îªüà×Sbf(ëøà^–¨ÙLóeû'Î*ˆ´ìÛ¹Wx·öËîJÙydÇ´½»z}”FnX˜qiîÍÁê¬ïVluiÌCçœ9Vëß^oŸ¢ºê³şáúnşCcBšxÜ×LìPó¢Â«}ÃÙ%ƒ÷	„±I‡çšUoó!Î÷ö¹…ÇÅİ‡G¼ŠÚù»*±´¸^Ù+"G·½oùSÌÙ£æF…,{ñ¨÷ğ°7çnØílØwmÈ<ïágË¬%zicÆLóº¹²C„»Ã‡êÔ¸`¾ükÆş•Ÿ'{«^,{ê¨ùrgç~›9~}né‰ˆßZ[›^¾w£®Y»|³·ÛcÆİlzje–Øn~í	ÁÈô~e¯üO<ö¿4öø&·{™E&_o?zÿdFÌ›sÇKõLô6¶>t÷¥<òsşWÿ?¶˜~®6¥t‚WülåÔ~ûy/ûËf¤]TÇÊ¼¾$áÃˆ1Û¢®9T{i{Wø¥,wùvõåº¿Ïİ£x¸¯ËÓ{ƒbêÌ¡f?Ş”¨—›µXï’}ãTÕĞ4«á§†Ş={ı¨Æ»æ­ÕªmÁïyoK¿]üp"áí²3#ŸÿşÍøXø\:Û¨Î6(Ğº}Â½Ãv×†{šÆ3Ù]Wkj€ÛÏó¸_šF›Õ7o[nNT¨~ËÒ”^µ9!T{<Õª¹‹<4ŸÏ
'Úvs øn(]hGøği§ˆ.Beëıô08èAp «ºH.°ºívpõLcçu»î}«[zğ¥C~†ğFÇ‘/˜v—¸–SóİÍdã³K®6İ¿±ñ²j1Ûw¯<}%ô‹ï®–_FÙ¿;8¹y»Y7¼î®ßhşøİò-Â}/Mä¹|l½ßyËã5¯„<÷ı°íà›kË^)}ñ,[è8â*(yqÈªµÇ.ì™ÙÑ{ì“Íßvz6~>Ô£kûü-'#.<~{üÑ‰èÃOŞéµ¯õÃÃRuóC”À¿NúÑ…9çmS÷,iU*m0i³ñ˜×¶5°nÖŞÿüÔµó^¶Ù´öS÷¯;æ.²x×³Îxé”ÈËƒC²ïÜÕŸvfSÉ¾å–{Öõßq¢a«\jtZÌÖÃ=;Ov¹ú›O·–MæÏmbz§Áùø¦ü:£në»ºîıíîF3ı…™FC¶Ÿ]~[ü€——W¾kuyË“+·Î*NôNjşmûÂÌC2NígÌ`–q>ç¨­Ïİ±¿wšĞßºg¶f¼Ùv¤Q‡ÖKÒße÷S)xuk.˜n°iğ´Ó³ó„İN4	­^c¥å¸­-2ŸNÙéhú²æwÆ¹V£Ü·.êgúÙksÆ¼VŠüå§»ô¥[Ş^ŞÛ´íµõzûYÏì±çÓ‹iKÇwÈ5Ï˜“sãbñïc†ˆ¶1Ûõnü2¾ïşµe;ºyv)K|L½Xä<îRÃsôn3³§˜A»Udmfd¢Éåê“.IB'V––¨§gPÃÊj(jX1ytíroHëƒŸ¯ãvzü)Ş¿Õ3ºùhÅAşé–cè6Æ	è^tp^Ï¼î9š°áéÇÇ8¨½â<2¡l,-0Š9ĞQLtÈE3ˆn¡tÄ]CtóúUt³åBÛ/à«*¹"&€Õ›ÑÌ­Mğ³±÷¾:D¯>3ãZxôZ}¢éà¶“B–¬=ÙôI³ß¬=j×RkxÑ]íhdeßŞ.¥Ûâi?8ûôÊZûÊá™Âß©yÙ®¥úãC·¹šäF´5oÔaÑğà/ú.ü}ëGş™ßzâ+èñV8®ÿŞåÍ“jM¼\R;¸Ì~Òì‹v<Íëù~eı[‰ıá›1{LŞ´î^ßP`6)Äâù£ÅÍ>şîáŸßä¸Ywx(*ˆ’Í_æ:şÚÂë¯’–yHš)nä,qŒX^²ÖsüÒ‹[Š~äíqm,?>ÚáìòéË6|Ì»+ZlJ§OmÚŞ™î˜÷›‡ğŞ9§j;^×\âw¥™Úh£à­çî'¼\^·%ûwëÔbâoîm*»ÇïVÁg_ç/ä©à¥^nİZ¡Ü.=³4wşú¾ıH·z\¾?êÜ>Õİ³=3…YüÇÖùú¡£qâÒÈ“5‚ß¾;PV8uİª¾…S“èöúŠ:ßÿdçX–ÍŸúÇMŞÚã¢qÑß„·×;ş%:=xáê»ŞîP%Şkåf5´ÆûZÑ+ú_³)¼U{“ı¸şu-ş¸Ÿ”iB;ì}{æz³DïU·úDïš¢“‚¦•ZkZm{ƒåmÚ‹3—ö¢úo¸;ğÅËp‡ú¯ö·6˜|1lİõzø­aªó\ì3;4t2ºĞô]“ûadİ¾_ùÙ?ÓÙßÃª‰–ıcÿ§"5Z^Öz,U³D2Ñç×(Ï}aÍ«#í
®:¿¤fÚëú´½v ¿…µ9D}îºjW[	WcWö0lvˆo½¡—zGæë¿v¤½t†×à;Ñyõ2ëşXúÊo”iù3ÃÓ5'Xßd“ÄŠQW7[Ìøtó@â¹Z]gü1lä‡#¾¿±Ku{äòĞ%s‚N8áø‹v#d7oœ|ñóÊ…)ã¦Ôş`ÒĞÏlù9Ëi÷¾Ç]|w-åyıÓ¿\Y±¦{›\ñŠƒuL[cÒ ÑÔ6¾”Ö¤#B·ùŸ^×ñğ
áÍønöM2Ÿ¹½3.xyW±Ş5ğn;¶›b«¯ï‹Ë"÷;¥Âşç;½[zS¿î„Ç‚¢+Ö½sóß½õ´]FÁ”—VØfnî½ìöıškÓÜk+UÅE¯¶kuòÚ¹>I#X´ºä6ØŒ—ÿ|Eş‰«unMí~;Á¬(î«{Ğä™Ş[÷¼6]¢RLëüš×rîüìëèì«Ê™«¯Oò³@šÔ`f¹„p©Ş š Ôëÿ¸TÏ&#ŒªsZ`«õl2xë±À´TzT?S}²ŠµzßÈA“¦Úı¾Ä¡î‡õî{'Q²'
^=¸0¸ç¤¹óõŒÏïSYšÃš5îğ×ÙÑ‰çêA¦ù&/ëÒ²¬tÖÙ$Qû›k1ºæuÕÍ­d‚‰8YD…	”¯ ÈÃÙ™ïiG;ûÒv>îN®üVtK6l¢M Ã`{€lŸ¦PšßéÍË®ænÜÊfÚœU¯ñ©Í;õâß+NBQ‘Ğk¬«ÙXªúp¢5mÍbÜ´JŒÙzŸfÒTgÚ)ª“›#õ>Ÿï¨¹üß)(È…#O*Yx?®ßt:}À³èor6>Øwr˜íÈ•çK^öyâVœyşğWÛç[Ìİóp09µì¾o5ï¢Ç~¦£§šË>M¼ØfuùæÃ†¶Vƒ.úwŸ`Mİ/¾9uÂ¢å½f_Ï´oX_Öq\ÈÖjÓ7Y}ÒÿĞ4?è`m²±¼ğŠÁ«u›sG7›•p¬°&yèVPÈÒÉóEœ¦uş$ûXxzÆG{ÇBò´kó	sKV®ØU<¦GĞëjÖiW„Õsz‡İLlŸì‘+ vg_¾rOníÉ>Yö‰_:\t/íÜíÇÑ—76¼<9ÕÚkşM¢ëtÚçäÛëÆõ7í,n½¶0`ñíFã·
­±zú,¢QÁ[ãí÷'¿óß³ëFƒ²@³±¡ï¨R2ÀjÚÛKÂã&½zÑå~ÏÏÁW×7Û³!w·E`ÉßOÔìûsJGº~Û¿X$]¢qûã<Åœ6^és7­M=saÖw×nw
šõ%Iù4iT‹Vó¿&ê×›˜êE	†OÏrkôˆ<ı~îÙ‡ÛMzĞùÊïÒÄù¯eªS[¶ùN¿<>âKªŸÁ†.}7»WrIœ£GÊš‰ï=¿oÉXvuÚñ÷?¼œøğt÷q²;Æw6>¿¸ëû-­ínì\»¹1ìxó““Ãe¯R£Ò¾{¸óDç"‹ê‡ĞgÈgÈª7õJúôx„;—#‚_ôÕÉ€·ïY<ø[ÿîË§w{ñ°ÑÎ…™»/	©Õ.^Q 10fÀÈ7wÏˆW487|¨ £Ø¬¶/N‡å…æ…äı,êı¬r£õ5:U>İ†ß–Im“¹TRÛhz d5Å,HmCşt..»ea&øål•ë6H\+¬âÔ M¹yõ«U\X@Õ­ŠúNœ¯sT=ı²;Ç®Šnî6}@›€¡/øoÖZìY)˜»rsĞÁA³BI‹¹«v?ösú¨wwq+•¼‘éü²z—»Lp^<5&rá5½.İ.lªyrÄìÓÇ›çúó¡ï÷iŞ¿ÈÆ¸a¯aM&~‰OÚ½Ğå»Uÿf¥ÓówuowúâÍOİCò¥êùjû6Q‹xµgOJ:Ğv}vƒï-<#Èì_kDáôq®s¿§½³êâuZaÑçt­ÜW#.Ímylæo1W‹vßszÛpú×©¹IÏKÛÏ²õx1hÂ²>—fıf.×Ûø r€ÿòàfæM[ØI¦p™càX»­¶íÏÜ)I¯5
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Graph not found: %s"), GraphName.IsEmpty() ? TEXT("EventGraph") : *GraphName));
	}

	// Parse color â€” default yellow (semi-transparent)
	double R = 1.0, G = 1.0, B = 0.0, A = 0.6;
	const TSharedPtr<FJsonObject>* ColorObj = nullptr;
	if (Params->TryGetObjectField(TEXT("color"), ColorObj) && ColorObj)
	{
		(*ColorObj)->TryGetNumberField(TEXT("r"), R);
		(*ColorObj)->TryGetNumberField(TEXT("g"), G);
		(*ColorObj)->TryGetNumberField(TEXT("b"), B);
		(*ColorObj)->TryGetNumberField(TEXT("a"), A);
	}

	double FontSizeD = 18.0;
	Params->TryGetNumberField(TEXT("font_size"), FontSizeD);
	int32 FontSize = (int32)FontSizeD;

	// Parse position and dimensions defaults
	int32 PosX = 0;
	int32 PosY = 0;
	double WidthD = 400.0, HeightD = 200.0;
	int32 Width = 400;
	int32 Height = 200;

	const TArray<TSharedPtr<FJsonValue>>* PosArray = nullptr;
	if (Params->TryGetArrayField(TEXT("position"), PosArray) && PosArray && PosArray->Num() >= 2)
	{
		PosX = (int32)(*PosArray)[0]->AsNumber();
		PosY = (int32)(*PosArray)[1]->AsNumber();
	}

	if (Params->TryGetNumberField(TEXT("width"), WidthD))  Width  = (int32)WidthD;
	if (Params->TryGetNumberField(TEXT("height"), HeightD)) Height = (int32)HeightD;

	// If node_ids provided, compute bounding rect from those nodes
	const TArray<TSharedPtr<FJsonValue>>* NodeIdsArray = nullptr;
	bool bAutoSized = false;
	if (Params->TryGetArrayField(TEXT("node_ids"), NodeIdsArray) && NodeIdsArray && NodeIdsArray->Num() > 0)
	{
		// Estimated node dimensions (no runtime widget dimensions available in editor backend)
		constexpr int32 EstNodeW = 200;
		constexpr int32 EstNodeH = 100;
		constexpr int32 Padding = 50;

		int32 MinX = INT_MAX, MinY = INT_MAX, MaxX = INT_MIN, MaxY = INT_MIN;

		for (const TSharedPtr<FJsonValue>& IdVal : *NodeIdsArray)
		{
			FString NodeId = IdVal->AsString();
			if (NodeId.IsEmpty()) continue;

			UEdGraphNode* Node = MonolithBlueprintInternal::FindNodeById(BP, GraphName, NodeId);
			if (!Node) continue;

			MinX = FMath::Min(MinX, Node->NodePosX);
			MinY = FMath::Min(MinY, Node->NodePosY);
			MaxX = FMath::Max(MaxX, Node->NodePosX + EstNodeW);
			MaxY = FMath::Max(MaxY, Node->NodePosY + EstNodeH);
		}

		if (MinX != INT_MAX)
		{
			PosX   = MinX - Padding;
			PosY   = MinY - Padding - 30; // extra space for comment header
			Width  = (MaxX - MinX) + Padding * 2;
			Height = (MaxY - MinY) + Padding * 2 + 30;
			bAutoSized = true;
		}
	}

	// Create the comment node
	UEdGraphNode_Comment* CommentNode = NewObject<UEdGraphNode_Comment>(Graph);
	CommentNode->NodeComment = CommentText;
	CommentNode->CommentColor = FLinearColor(R, G, B, A);
	CommentNode->FontSize = FontSize;
	CommentNode->NodePosX = PosX;
	CommentNode->NodePosY = PosY;
	CommentNode->NodeWidth = Width;
	CommentNode->NodeHeight = Height;

	if (bAutoSized)
	{
		CommentNode->MoveMode = ECommentBoxMode::GroupMovement;
	}

	Graph->AddNode(CommentNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
	CommentNode->CreateNewGuid(); // Gap #15: valid NodeGuid for deterministic cooking

	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedPtr<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetStringField(TEXT("node_id"), CommentNode->GetName());
	Root->SetStringField(TEXT("text"), CommentText);

	TSharedPtr<FJsonObject> Bounds = MakeShared<FJsonObject>();
	Bounds->SetNumberField(TEXT("x"), PosX);
	Bounds->SetNumberField(TEXT("y"), PosY);
	Bounds->SetNumberField(TEXT("w"), Width);
	Bounds->SetNumberField(TEXT("h"), Height);
	Root->SetObjectField(TEXT("bounds"), Bounds);
	Root->SetStringField(TEXT("graph"), Graph->GetName());

	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  promote_pin_to_variable  (Wave 7)
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandlePromotePinToVariable(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString NodeId = Params->GetStringField(TEXT("node_id"));
	if (NodeId.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: node_id"));
	}

	FString PinName = Params->GetStringField(TEXT("pin_name"));
	if (PinName.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: pin_name"));
	}

	FString GraphName = Params->GetStringField(TEXT("graph_name"));

	// Find the node
	UEdGraphNode* SourceNode = MonolithBlueprintInternal::FindNodeById(BP, GraphName, NodeId);
	if (!SourceNode)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Node not found: %s"), *NodeId));
	}

	// Find the pin
	FString PromoteAvailPins;
	UEdGraphPin* Pin = MonolithBlueprintInternal::FindPinOnNode(SourceNode, PinName, EGPD_MAX, &PromoteAvailPins);
	if (!Pin)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Pin '%s' not found on node '%s'. Available pins: %s"), *PinName, *NodeId, *PromoteAvailPins));
	}

	// Validate: not exec
	if (Pin->PinType.PinCategory == UEdGraphSchema_K2::PC_Exec)
	{
		return FMonolithActionResult::Error(TEXT("Cannot promote execution (exec) pins to variables"));
	}

	// Validate: not wildcard
	if (Pin->PinType.PinCategory == UEdGraphSchema_K2::PC_Wildcard)
	{
		return FMonolithActionResult::Error(TEXT("Cannot promote wildcard pins to variables â€” resolve the type first"));
	}

	// Validate: scalar types only (no containers)
	if (Pin->PinType.ContainerType != EPinContainerType::None)
	{
		return FMonolithActionResult::Error(
			TEXT("Container types (Array, Map, Set) are not yet supported by promote_pin_to_variable. "
			     "Use add_variable + manual wiring instead."));
	}

	// Determine variable name: use provided or default to pin name
	FString VarNameStr = Params->GetStringField(TEXT("variable_name"));
	if (VarNameStr.IsEmpty())
	{
		VarNameStr = PinName;
	}
	FName VarName(*VarNameStr);

	// Check for name collision
	for (const FBPVariableDescription& Existing : BP->NewVariables)
	{
		if (Existing.VarName == VarName)
		{
			return FMonolithActionResult::Error(FString::Printf(
				TEXT("A variable named '%s' already exists in this Blueprint. Provide a unique 'variable_name'."), *VarNameStr));
		}
	}

	// Find the hosting graph (needed for placing the new variable node)
	UEdGraph* Graph = nullptr;
	if (!GraphName.IsEmpty())
	{
		Graph = MonolithBlueprintInternal::FindGraphByName(BP, GraphName);
	}
	else
	{
		// Find graph by searching for the node
		auto SearchInGraphs = [&](const TArray<TObjectPtr<UEdGraph>>& Graphs) -> UEdGraph*
		{
			for (const auto& G : Graphs)
			{
				if (!G) continue;
				for (UEdGraphNode* N : G->Nodes)
				{
					if (N && N->GetName() == NodeId) return G;
				}
			}
			return nullptr;
		};
		Graph = SearchInGraphs(BP->UbergraphPages);
		if (!Graph) Graph = SearchInGraphs(BP->FunctionGraphs);
		if (!Graph) Graph = SearchInGraphs(BP->MacroGraphs);
	}
	if (!Graph)
	{
		return FMonolithActionResult::Error(TEXT("Could not locate graph containing the node"));
	}

	// Build pin type string for the response before modifying anything
	FString TypeStr = MonolithBlueprintInternal::ContainerPrefix(Pin->PinType) +
	                  MonolithBlueprintInternal::PinTypeToString(Pin->PinType);

	// Step 1: Add the member variable.
	if (!FBlueprintEditorUtils::AddMemberVariable(BP, VarName, Pin->PinType))
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Failed to add variable '%s' â€” a variable with that name may already exist"), *VarNameStr));
	}

	// Step 2: Position the new variable node relative to the source node
	// NOTE: MarkBlueprintAsStructurallyModified is deferred to AFTER pin
	// rewiring to avoid invalidating the Pin pointer during skeleton regen.
	const EEdGraphPinDirection PinDir = Pin->Direction;
	int32 VarNodePosX = SourceNode->NodePosX + (PinDir == EGPD_Output ? 200 : -200);
	int32 VarNodePosY = SourceNode->NodePosY;

	// Step 4: Create VariableGet (for output pins â€” feeds data to consumers)
	//         or VariableSet (for input pins â€” receives data from producers)
	UEdGraphNode* VarNode = nullptr;
	int32 ConnectionsMade = 0;

	if (PinDir == EGPD_Output)
	{
		// Output pin â†’ promote to VariableGet
		UK2Node_VariableGet* GetNode = NewObject<UK2Node_VariableGet>(Graph);
		GetNode->VariableReference.SetSelfMember(VarName);
		GetNode->NodePosX = VarNodePosX;
		GetNode->NodePosY = VarNodePosY;
		Graph->AddNode(GetNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		GetNode->AllocateDefaultPins();
		GetNode->CreateNewGuid(); // Gap #15: valid NodeGuid for deterministic cooking
		VarNode = GetNode;

		// Rewire: connect the VariableGet's output to each of the original pin's consumers
		// Find the output data pin on the new VariableGet node
		UEdGraphPin* GetOutputPin = nullptr;
		for (UEdGraphPin* P : GetNode->Pins)
		{
			if (P && P->Direction == EGPD_Output && P->PinType.PinCategory != UEdGraphSchema_K2::PC_Exec)
			{
				GetOutputPin = P;
				break;
			}
		}

		if (GetOutputPin)
		{
			// Collect existing connections before breaking
			TArray<UEdGraphPin*> Consumers;
			for (UEdGraphPin* Linked : Pin->LinkedTo)
			{
				if (Linked) Consumers.Add(Linked);
			}

			// Break the original pin's connections
			Pin->BreakAllPinLinks(true);

			// Wire the VariableGet output to each former consumer
			const UEdGraphSchema_K2* Schema = GetDefault<UEdGraphSchema_K2>();
			for (UEdGraphPin* Consumer : Consumers)
			{
				if (Schema->TryCreateConnection(GetOutputPin, Consumer))
				{
					ConnectionsMade++;
				}
			}
		}
	}
	else
	{
		// Input pin â†’ promote to VariableSet
		UK2Node_VariableSet* SetNode = NewObject<UK2Node_VariableSet>(Graph);
		SetNode->VariableReference.SetSelfMember(VarName);
		SetNode->NodePosX = VarNodePosX;
		SetNode->NodePosY = VarNodePosY;
		Graph->AddNode(SetNode, /*bUserAction=*/true, /*bSelectNewNode=*/false);
		SetNode->AllocateDefaultPins();
		SetNode->CreateNewGuid(); // Gap #15: valid NodeGuid for deterministic cooking
		VarNode = SetNode;

		// Find the input data pin on the VariableSet node (the value pin, not exec)
		UEdGraphPin* SetInputPin = nullptr;
		for (UEdGraphPin* P : SetNode->Pins)
		{
			if (P && P->Direction == EGPD_Input && P->PinType.PinCategory != UEdGraphSchema_K2::PC_Exec)
			{
				SetInputPin = P;
				break;
			}
		}

		if (SetInputPin)
		{
			// Collect existing producers before breaking
			TArray<UEdGraphPin*> Producers;
			for (UEdGraphPin* Linked : Pin->LinkedTo)
			{
				if (Linked) Producers.Add(Linked);
			}

			// Break the original pin's connections
			Pin->BreakAllPinLinks(true);

			// Wire each former producer to the VariableSet input
			const UEdGraphSchema_K2* Schema = GetDefault<UEdGraphSchema_K2>();
			for (UEdGraphPin* Producer : Producers)
			{
				if (Schema->TryCreateConnection(Producer, SetInputPin))
				{
					ConnectionsMade++;
				}
			}
		}
	}

	// Now safe to do structural modification â€” all pin rewiring is complete
	FBlueprintEditorUtils::MarkBlueprintAsStructurallyModified(BP);

	TSharedPtr<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetStringField(TEXT("variable_name"), VarNameStr);
	Root->SetStringField(TEXT("variable_type"), TypeStr);
	if (PinDir == EGPD_Output)
	{
		Root->SetStringField(TEXT("getter_node_id"), VarNode ? VarNode->GetName() : TEXT(""));
	}
	else
	{
		Root->SetStringField(TEXT("setter_node_id"), VarNode ? VarNode->GetName() : TEXT(""));
	}
	Root->SetNumberField(TEXT("connections_made"), ConnectionsMade);
	Root->SetStringField(TEXT("graph"), Graph->GetName());
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  get_timeline_data  (Phase 3A)
// ============================================================

static FString NodeInterpModeToString(ERichCurveInterpMode Mode)
{
	switch (Mode)
	{
	case RCIM_Linear:   return TEXT("linear");
	case RCIM_Constant: return TEXT("constant");
	case RCIM_Cubic:    return TEXT("cubic");
	default:            return TEXT("linear");
	}
}

static ERichCurveInterpMode StringToInterpMode(const FString& Str)
{
	if (Str.Equals(TEXT("constant"), ESearchCase::IgnoreCase)) return RCIM_Constant;
	if (Str.Equals(TEXT("cubic"),    ESearchCase::IgnoreCase)) return RCIM_Cubic;
	return RCIM_Linear; // default
}

static TSharedPtr<FJsonObject> SerializeRichCurveKeys(const FRichCurve& Curve)
{
	TSharedPtr<FJsonObject> CurveObj = MakeShared<FJsonObject>();
	TArray<TSharedPtr<FJsonValue>> KeysArr;

	const TArray<FRichCurveKey>& Keys = Curve.GetConstRefOfKeys();
	for (const FRichCurveKey& Key : Keys)
	{
		TSharedPtr<FJsonObject> KeyObj = MakeShared<FJsonObject>();
		KeyObj->SetNumberField(TEXT("time"), Key.Time);
		KeyObj->SetNumberField(TEXT("value"), Key.Value);
		KeyObj->SetStringField(TEXT("interp_mode"), NodeInterpModeToString(Key.InterpMode));
		KeysArr.Add(MakeShared<FJsonValueObject>(KeyObj));
	}

	CurveObj->SetArrayField(TEXT("keys"), KeysArr);
	CurveObj->SetNumberField(TEXT("num_keys"), Keys.Num());
	return CurveObj;
}

static TSharedPtr<FJsonObject> SerializeTimelineTemplate(const UTimelineTemplate* Template)
{
	TSharedPtr<FJsonObject> TLObj = MakeShared<FJsonObject>();
	TLObj->SetStringField(TEXT("name"), Template->GetVariableName().ToString());
	TLObj->SetStringField(TEXT("guid"), Template->TimelineGuid.ToString());
	TLObj->SetNumberField(TEXT("length"), Template->TimelineLength);
	TLObj->SetBoolField(TEXT("auto_play"), Template->bAutoPlay != 0);
	TLObj->SetBoolField(TEXT("loop"), Template->bLoop != 0);
	TLObj->SetBoolField(TEXT("replicated"), Template->bReplicated != 0);

	// Float tracks
	TArray<TSharedPtr<FJsonValue>> FloatArr;
	for (const FTTFloatTrack& Track : Template->FloatTracks)
	{
		TSharedPtr<FJsonObject> TrackObj = MakeShared<FJsonObject>();
		TrackObj->SetStringField(TEXT("track_name"), Track.GetTrackName().ToString());
		TrackObj->SetStringField(TEXT("track_type"), TEXT("float"));
		if (Track.CurveFloat)
		{
			TSharedPtr<FJsonObject> CurveData = SerializeRichCurveKeys(Track.CurveFloat->FloatCurve);
			TrackObj->SetArrayField(TEXT("keys"), CurveData->GetArrayField(TEXT("keys")));
			TrackObj->SetNumberField(TEXT("num_keys"), CurveData->GetNumberField(TEXT("num_keys")));
		}
		else
		{
			TrackObj->SetArrayField(TEXT("keys"), TArray<TSharedPtr<FJsonValue>>());
			TrackObj->SetNumberField(TEXT("num_keys"), 0);
		}
		FloatArr.Add(MakeShared<FJsonValueObject>(TrackObj));
	}
	TLObj->SetArrayField(TEXT("float_tracks"), FloatArr);

	// Vector tracks
	TArray<TSharedPtr<FJsonValue>> VectorArr;
	for (const FTTVectorTrack& Track : Template->VectorTracks)
	{
		TSharedPtr<FJsonObject> TrackObj = MakeShared<FJsonObject>();
		TrackObj->SetStringField(TEXT("track_name"), Track.GetTrackName().ToString());
		TrackObj->SetStringField(TEXT("track_type"), TEXT("vector"));
		if (Track.CurveVector)
		{
			TArray<TSharedPtr<FJsonValue>> ChannelArr;
			static const TCHAR* ChannelNames[] = { TEXT("x"), TEXT("y"), TEXT("z") };
			for (int32 i = 0; i < 3; ++i)
			{
				TSharedPtr<FJsonObject> ChObj = MakeShared<FJsonObject>();
				ChObj->SetStringField(TEXT("channel"), ChannelNames[i]);
				TSharedPtr<FJsonObject> CurveData = SerializeRichCurveKeys(Track.CurveVector->FloatCurves[i]);
				ChObj->SetArrayField(TEXT("keys"), CurveData->GetArrayField(TEXT("keys")));
				ChannelArr.Add(MakeShared<FJsonValueObject>(ChObj));
			}
			TrackObj->SetArrayField(TEXT("channels"), ChannelArr);
		}
		VectorArr.Add(MakeShared<FJsonValueObject>(TrackObj));
	}
	TLObj->SetArrayField(TEXT("vector_tracks"), VectorArr);

	// Event tracks
	TArray<TSharedPtr<FJsonValue>> EventArr;
	for (const FTTEventTrack& Track : Template->EventTracks)
	{
		TSharedPtr<FJsonObject> TrackObj = MakeShared<FJsonObject>();
		TrackObj->SetStringField(TEXT("track_name"), Track.GetTrackName().ToString());
		TrackObj->SetStringField(TEXT("track_type"), TEXT("event"));
		if (Track.CurveKeys)
		{
			// Event tracks use UCurveFloat but only the time values matter (fire at that time)
			TArray<TSharedPtr<FJsonValue>> KeysArr;
			const TArray<FRichCurveKey>& Keys = Track.CurveKeys->FloatCurve.GetConstRefOfKeys();
			for (const FRichCurveKey& Key : Keys)
			{
				TSharedPtr<FJsonObject> KeyObj = MakeShared<FJsonObject>();
				KeyObj->SetNumberField(TEXT("time"), Key.Time);
				KeysArr.Add(MakeShared<FJsonValueObject>(KeyObj));
			}
			TrackObj->SetArrayField(TEXT("keys"), KeysArr);
			TrackObj->SetNumberField(TEXT("num_keys"), Keys.Num());
		}
		else
		{
			TrackObj->SetArrayField(TEXT("keys"), TArray<TSharedPtr<FJsonValue>>());
			TrackObj->SetNumberField(TEXT("num_keys"), 0);
		}
		EventArr.Add(MakeShared<FJsonValueObject>(TrackObj));
	}
	TLObj->SetArrayField(TEXT("event_tracks"), EventArr);

	// Linear color tracks
	TArray<TSharedPtr<FJsonValue>> ColorArr;
	for (const FTTLinearColorTrack& Track : Template->LinearColorTracks)
	{
		TSharedPtr<FJsonObject> TrackObj = MakeShared<FJsonObject>();
		TrackObj->SetStringField(TEXT("track_name"), Track.GetTrackName().ToString());
		TrackObj->SetStringField(TEXT("track_type"), TEXT("color"));
		if (Track.CurveLinearColor)
		{
			TArray<TSharedPtr<FJsonValue>> ChannelArr;
			static const TCHAR* ChannelNames[] = { TEXT("r"), TEXT("g"), TEXT("b"), TEXT("a") };
			for (int32 i = 0; i < 4; ++i)
			{
				TSharedPtr<FJsonObject> ChObj = MakeShared<FJsonObject>();
				ChObj->SetStringField(TEXT("channel"), ChannelNames[i]);
				TSharedPtr<FJsonObject> CurveData = SerializeRichCurveKeys(Track.CurveLinearColor->FloatCurves[i]);
				ChObj->SetArrayField(TEXT("keys"), CurveData->GetArrayField(TEXT("keys")));
				ChannelArr.Add(MakeShared<FJsonValueObject>(ChObj));
			}
			TrackObj->SetArrayField(TEXT("channels"), ChannelArr);
		}
		ColorArr.Add(MakeShared<FJsonValueObject>(TrackObj));
	}
	TLObj->SetArrayField(TEXT("color_tracks"), ColorArr);

	return TLObj;
}

FMonolithActionResult FMonolithBlueprintNodeActions::HandleGetTimelineData(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString TimelineName = Params->GetStringField(TEXT("timeline_name"));

	TArray<TSharedPtr<FJsonValue>> TimelinesArr;

	for (const UTimelineTemplate* Template : BP->Timelines)
	{
		if (!Template) continue;

		// If a specific name was requested, filter
		if (!TimelineName.IsEmpty() && Template->GetVariableName().ToString() != TimelineName)
		{
			continue;
		}

		TimelinesArr.Add(MakeShared<FJsonValueObject>(SerializeTimelineTemplate(Template)));
	}

	if (!TimelineName.IsEmpty() && TimelinesArr.Num() == 0)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Timeline '%s' not found. Available timelines: %s"),
			*TimelineName,
			*([&]()
			{
				FString Names;
				for (const UTimelineTemplate* T : BP->Timelines)
				{
					if (T)
					{
						if (!Names.IsEmpty()) Names += TEXT(", ");
						Names += T->GetVariableName().ToString();
					}
				}
				return Names.IsEmpty() ? FString(TEXT("(none)")) : Names;
			}())));
	}

	TSharedRef<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetArrayField(TEXT("timelines"), TimelinesArr);
	Root->SetNumberField(TEXT("count"), TimelinesArr.Num());
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  add_timeline_track  (Phase 3A)
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleAddTimelineTrack(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString TimelineName = Params->GetStringField(TEXT("timeline_name"));
	if (TimelineName.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: timeline_name"));
	}

	FString TrackNameStr = Params->GetStringField(TEXT("track_name"));
	if (TrackNameStr.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: track_name"));
	}

	FString TrackTypeStr = Params->GetStringField(TEXT("track_type"));
	if (TrackTypeStr.IsEmpty())
	{
		TrackTypeStr = TEXT("float");
	}

	// Find the timeline template
	UTimelineTemplate* Template = nullptr;
	for (UTimelineTemplate* T : BP->Timelines)
	{
		if (T && T->GetVariableName().ToString() == TimelineName)
		{
			Template = T;
			break;
		}
	}

	if (!Template)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Timeline '%s' not found in Blueprint"), *TimelineName));
	}

	FName TrackName(*TrackNameStr);

	// Check track name uniqueness across all track types
	if (!Template->IsNewTrackNameValid(TrackName))
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Track name '%s' already exists in timeline '%s'"), *TrackNameStr, *TimelineName));
	}

	// Get the generated class as outer for curve objects (matches engine pattern)
	UClass* OwnerClass = BP->GeneratedClass;
	if (!OwnerClass)
	{
		return FMonolithActionResult::Error(TEXT("Blueprint has no GeneratedClass â€” compile the Blueprint first"));
	}

	Template->Modify();

	FString CreatedType;

	if (TrackTypeStr.Equals(TEXT("float"), ESearchCase::IgnoreCase))
	{
		FTTFloatTrack NewTrack;
		NewTrack.SetTrackName(TrackName, Template);
		NewTrack.CurveFloat = NewObject<UCurveFloat>(OwnerClass, NAME_None, RF_Public);
		Template->FloatTracks.Add(NewTrack);
		CreatedType = TEXT("float");
	}
	else if (TrackTypeStr.Equals(TEXT("vector"), ESearchCase::IgnoreCase))
	{
		FTTVectorTrack NewTrack;
		NewTrack.SetTrackName(TrackName, Template);
		NewTrack.CurveVector = NewObject<UCurveVector>(OwnerClass, NAME_None, RF_Public);
		Template->VectorTracks.Add(NewTrack);
		CreatedType = TEXT("vector");
	}
	else if (TrackTypeStr.Equals(TEXT("event"), ESearchCase::IgnoreCase))
	{
		FTTEventTrack NewTrack;
		NewTrack.SetTrackName(TrackName, Template);
		NewTrack.CurveKeys = NewObject<UCurveFloat>(OwnerClass, NAME_None, RF_Public);
		NewTrack.CurveKeys->bIsEventCurve = true;
		Template->EventTracks.Add(NewTrack);
		CreatedType = TEXT("event");
	}
	else if (TrackTypeStr.Equals(TEXT("color"), ESearchCase::IgnoreCase))
	{
		FTTLinearColorTrack NewTrack;
		NewTrack.SetTrackName(TrackName, Template);
		NewTrack.CurveLinearColor = NewObject<UCurveLinearColor>(OwnerClass, NAME_None, RF_Public);
		Template->LinearColorTracks.Add(NewTrack);
		CreatedType = TEXT("color");
	}
	else
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Unknown track_type '%s'. Must be: float, vector, event, or color"), *TrackTypeStr));
	}

	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedRef<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetStringField(TEXT("timeline_name"), TimelineName);
	Root->SetStringField(TEXT("track_name"), TrackNameStr);
	Root->SetStringField(TEXT("track_type"), CreatedType);
	return FMonolithActionResult::Success(Root);
}

// ============================================================
//  set_timeline_keys  (Phase 3A)
// ============================================================

FMonolithActionResult FMonolithBlueprintNodeActions::HandleSetTimelineKeys(const TSharedPtr<FJsonObject>& Params)
{
	FString AssetPath;
	UBlueprint* BP = MonolithBlueprintInternal::LoadBlueprintFromParams(Params, AssetPath);
	if (!BP)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Blueprint not found: %s"), *AssetPath));
	}

	FString TimelineName = Params->GetStringField(TEXT("timeline_name"));
	if (TimelineName.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: timeline_name"));
	}

	FString TrackNameStr = Params->GetStringField(TEXT("track_name"));
	if (TrackNameStr.IsEmpty())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: track_name"));
	}

	// Parse keys array â€” handle both EJson::Array and EJson::String (Claude Code quirk)
	TArray<TSharedPtr<FJsonValue>> KeysArr;
	TSharedPtr<FJsonValue> KeysField = Params->TryGetField(TEXT("keys"));
	if (!KeysField.IsValid())
	{
		return FMonolithActionResult::Error(TEXT("Missing required parameter: keys"));
	}
	if (KeysField->Type == EJson::Array)
	{
		KeysArr = KeysField->AsArray();
	}
	else if (KeysField->Type == EJson::String)
	{
		TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(KeysField->AsString());
		if (!FJsonSerializer::Deserialize(Reader, KeysArr))
		{
			return FMonolithActionResult::Error(TEXT("Failed to parse keys string as JSON array"));
		}
	}
	else
	{
		return FMonolithActionResult::Error(TEXT("'keys' must be an array"));
	}

	// Find the timeline template
	UTimelineTemplate* Template = nullptr;
	for (UTimelineTemplate* T : BP->Timelines)
	{
		if (T && T->GetVariableName().ToString() == TimelineName)
		{
			Template = T;
			break;
		}
	}

	if (!Template)
	{
		return FMonolithActionResult::Error(FString::Printf(TEXT("Timeline '%s' not found in Blueprint"), *TimelineName));
	}

	// Find the float track by name (manual iteration â€” FindFloatTrackIndex is not exported)
	FName TrackName(*TrackNameStr);
	int32 TrackIndex = INDEX_NONE;
	for (int32 i = 0; i < Template->FloatTracks.Num(); ++i)
	{
		if (Template->FloatTracks[i].GetTrackName() == TrackName)
		{
			TrackIndex = i;
			break;
		}
	}
	if (TrackIndex == INDEX_NONE)
	{
		// Build available track names for error message
		FString Available;
		for (const FTTFloatTrack& T : Template->FloatTracks)
		{
			if (!Available.IsEmpty()) Available += TEXT(", ");
			Available += T.GetTrackName().ToString();
		}
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Float track '%s' not found in timeline '%s'. Available float tracks: %s"),
			*TrackNameStr, *TimelineName, Available.IsEmpty() ? TEXT("(none)") : *Available));
	}

	FTTFloatTrack& Track = Template->FloatTracks[TrackIndex];
	if (!Track.CurveFloat)
	{
		return FMonolithActionResult::Error(FString::Printf(
			TEXT("Float track '%s' has no backing UCurveFloat object"), *TrackNameStr));
	}

	Template->Modify();
	Track.CurveFloat->Modify();

	// Clear existing keys
	FRichCurve& Curve = Track.CurveFloat->FloatCurve;
	Curve.Reset();

	// Add new keys
	int32 KeyCount = 0;
	for (const TSharedPtr<FJsonValue>& KeyVal : KeysArr)
	{
		const TSharedPtr<FJsonObject>& KeyObj = KeyVal->AsObject();
		if (!KeyObj.IsValid()) continue;

		double Time = 0.0;
		double Value = 0.0;
		KeyObj->TryGetNumberField(TEXT("time"), Time);
		KeyObj->TryGetNumberField(TEXT("value"), Value);

		FKeyHandle Handle = Curve.AddKey((float)Time, (float)Value);

		// Set interp mode if provided
		FString InterpStr = KeyObj->GetStringField(TEXT("interp_mode"));
		if (!InterpStr.IsEmpty())
		{
			Curve.SetKeyInterpMode(Handle, StringToInterpMode(InterpStr));
		}

		KeyCount++;
	}

	FBlueprintEditorUtils::MarkBlueprintAsModified(BP);

	TSharedRef<FJsonObject> Root = MakeShared<FJsonObject>();
	Root->SetStringField(TEXT("timeline_name"), TimelineName);
	Root->SetStringField(TEXT("track_name"), TrackNameStr);
	Root->SetNumberField(TEXT("keys_set"), KeyCount);
	return FMonolithActionResult::Success(Root);
}
