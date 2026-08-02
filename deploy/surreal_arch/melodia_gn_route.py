"""Melodia GN routing ΓÇö default path for new ornament / music / castle arches."""

from __future__ import annotations

import bpy

# arch_type ΓåÆ (builder_callable_import_path_key, node group name)
ARCH_TO_GN = {
    "GAZEBO": ("structures.build_gazebo", "MEL_gazebo"),
    "PORTICO": ("structures.build_portico", "MEL_portico"),
    # Melodia GN natives
    "MELODIA_NOTE_HEAD": ("music.build_music_note_head", "MEL_music_note_head"),
    "MELODIA_TREBLE_CLEF": ("music.build_music_treble_clef", "MEL_music_treble_clef"),
    "MELODIA_STAFF": ("music.build_music_staff", "MEL_music_staff"),
    "MELODIA_HARMONIC": ("music.build_music_harmonic", "MEL_music_harmonic"),
    "MELODIA_PHRASE": ("music.build_music_phrase", "MEL_music_phrase"),
    "ORN_VINE": ("ornament.build_ornament_vine", "MEL_ornament_vine"),
    "ORN_RADIAL": ("ornament.build_ornament_radial", "MEL_ornament_radial"),
    "ORN_FRAME": ("ornament.build_ornament_frame", "MEL_ornament_frame"),
    "ORN_PANEL": ("ornament.build_ornament_panel", "MEL_ornament_panel"),
    "ORN_GRID": ("ornament.build_ornament_grid", "MEL_ornament_grid"),
    # Live musical RNA aliases ΓåÆ Melodia GN (prefer_melodia_gn).
    # FILIGREE_* stays on monolith builders ΓÇö gothic kitbash SPECS need style props.
    "TREBLE_CLEF": ("music.build_music_treble_clef", "MEL_music_treble_clef"),
    "NOTE_HEAD": ("music.build_music_note_head", "MEL_music_note_head"),
    "SHEET_MUSIC_RAIL": ("music.build_music_staff", "MEL_music_staff"),
    "CASTLE_TOWER": ("castle.build_castle_tower", "MEL_castle_tower"),
    "CASTLE_GATEHOUSE": ("castle.build_castle_gatehouse", "MEL_castle_gatehouse"),
    "CASTLE_KEEP": ("castle.build_castle_keep", "MEL_castle_keep"),
}

MELODIA_GN_PREFIXES = ("MELODIA_", "ORN_", "MUSIC_", "CASTLE_")


def should_use_melodia_gn(arch_type: str, *, prefer: bool = True) -> bool:
    if not prefer or not arch_type:
        return False
    if arch_type in ARCH_TO_GN:
        return True
    return any(arch_type.startswith(p) for p in MELODIA_GN_PREFIXES)


def _resolve_builder(dotted: str):
    mod_name, fn_name = dotted.rsplit(".", 1)
    mod = __import__(f"surreal_arch.melodia_gn.{mod_name}", fromlist=[fn_name])
    return getattr(mod, fn_name)


def _collection_for_arch_type(arch_type: str) -> str | None:
    if arch_type.startswith(("MELODIA_", "MUSIC_")) or arch_type in ("NOTE_HEAD", "TREBLE_CLEF", "SHEET_MUSIC_RAIL"):
        return "MusicalGN_Editable"
    if arch_type.startswith("ORN_") or arch_type.startswith("CASTLE_"):
        return "OrnamentGN_Editable"
    return None


def _ensure_in_collection(obj, coll_name: str):
    coll = bpy.data.collections.get(coll_name)
    if coll is None:
        coll = bpy.data.collections.new(coll_name)
        try:
            bpy.context.scene.collection.children.link(coll)
        except Exception:
            pass
    for extant in obj.users_collection:
        if extant == coll:
            return
        if extant.name == coll_name:
            return
    try:
        coll.objects.link(obj)
    except Exception:
        pass


def try_apply_melodia_gn(obj, props, monolith=None) -> bool:
    """Ensure Melodia GN group exists and attach as modifier. Returns True if handled."""
    arch = getattr(props, "arch_type", "")
    from .quality_props import prefer_melodia_gn

    if not should_use_melodia_gn(arch, prefer=prefer_melodia_gn()):
        return False

    entry = ARCH_TO_GN.get(arch)
    if entry is None:
        print(f"[Melodia GN] prefer on for {arch} but no ARCH_TO_GN map ΓÇö fall through")
        return False

    dotted, group_name = entry
    try:
        if group_name not in bpy.data.node_groups:
            builder = _resolve_builder(dotted)
            builder(group_name)
        ng = bpy.data.node_groups.get(group_name)
        if ng is None:
            return False
        # Replace prior MelodiaGN mod
        for mod in list(obj.modifiers):
            if mod.name.startswith("MelodiaGN"):
                obj.modifiers.remove(mod)
        mod = obj.modifiers.new(name="MelodiaGN", type="NODES")
        mod.node_group = ng
        write_snaps = getattr(monolith, "_gb_write_snap_points", None) if monolith else None
        if write_snaps:
            try:
                write_snaps(obj, props)
            except Exception:
                pass
        print(f"[Melodia GN] attached {group_name} to {obj.name}")
        target_coll = _collection_for_arch_type(arch)
        if target_coll:
            _ensure_in_collection(obj, target_coll)
        return True
    except Exception as exc:
        print(f"[Melodia GN] apply failed for {arch}: {exc}")
        return False
