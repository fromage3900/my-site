"""Melodia Studio product identity ΓÇö display branding only.

Keep MODULE_ID / surreal_arch.* operator prefixes unchanged for compatibility.
"""

from __future__ import annotations

PRODUCT_NAME = "Melodia Studio"
PRODUCT_SUBTITLE = "Architecture ┬╖ Ornament ┬╖ Genome"
PRODUCT_TAGLINE = "powered by SurrealArch kits"
MODULE_ID = "surreal_architecture_gen"  # Blender addon module ΓÇö do not rename yet
N_PANEL_CATEGORY = "Melodia Studio"


def version_string(bl_info: dict | None = None) -> str:
    if bl_info is None:
        try:
            import surreal_architecture_gen as mod

            bl_info = getattr(mod, "bl_info", {}) or {}
        except Exception:
            bl_info = {}
    v = bl_info.get("version", (0, 0, 0))
    return f"v{v[0]}.{v[1]}.{v[2]}"


def product_label(bl_info: dict | None = None) -> str:
    return f"{PRODUCT_NAME} ({version_string(bl_info)})"


def select_mesh_hint() -> str:
    return f"Select a mesh with {PRODUCT_NAME}"


def unify_npanel_categories() -> list[str]:
    """Force Melodia VIEW_3D panels onto one category and nest under carousel.

    Only SURREAL_ARCH_PT_genome_carousel stays top-level (plus floating plan).
    Idempotent. Safe to call after register_overhaul / addon reload.
    """
    import bpy

    parent = "SURREAL_ARCH_PT_genome_carousel"
    # Only the carousel stays top-level in the Melodia Studio N-tab
    skip_parent = {parent}
    fixed: list[str] = []
    nest_refresh: list[type] = []
    for cls in list(bpy.types.Panel.__subclasses__()):
        bid = getattr(cls, "bl_idname", "") or ""
        mod = getattr(cls, "__module__", "") or ""
        space = getattr(cls, "bl_space_type", None)
        cat = getattr(cls, "bl_category", None)
        if space != "VIEW_3D":
            continue
        owns = (
            bid.startswith(("SURREAL_ARCH_PT_", "MEL_GN_PT_", "MPR_PT_", "BRIB_PT_", "MATB_PT_"))
            or "surreal_arch" in mod
            or mod.endswith("surreal_architecture_gen")
        )
        if not owns:
            continue
        if cat != N_PANEL_CATEGORY:
            try:
                cls.bl_category = N_PANEL_CATEGORY
                fixed.append(bid)
            except Exception:
                pass
        if bid and bid not in skip_parent:
            try:
                changed = getattr(cls, "bl_parent_id", None) != parent
                if changed:
                    cls.bl_parent_id = parent
                    opts = set(getattr(cls, "bl_options", set()) or set())
                    opts.add("DEFAULT_CLOSED")
                    cls.bl_options = opts
                    fixed.append(f"{bid}:nested")
                    nest_refresh.append(cls)
                elif "DEFAULT_CLOSED" not in (getattr(cls, "bl_options", set()) or set()):
                    opts = set(getattr(cls, "bl_options", set()) or set())
                    opts.add("DEFAULT_CLOSED")
                    cls.bl_options = opts
                    nest_refresh.append(cls)
            except Exception:
                pass
        if bid == "SURREAL_ARCH_PT_plan_edit_floating":
            try:
                cls.bl_label = f"{PRODUCT_NAME} Plan"
            except Exception:
                pass
    # Re-register so bl_parent_id takes effect in the live sidebar
    for cls in nest_refresh:
        try:
            bpy.utils.unregister_class(cls)
        except Exception:
            pass
        try:
            bpy.utils.register_class(cls)
        except Exception:
            pass
    return fixed
