"""Bootstrap + addon preferences for Surreal Architecture overhaul package."""
from __future__ import annotations

import bpy

from . import capabilities
from .capabilities import _DEFAULT_HIGGSAS

_PATCHED_MONOLITH = None


class SurrealArchAddonPreferences(bpy.types.AddonPreferences):
    bl_idname = "surreal_architecture_gen"

    higgsas_library_path: bpy.props.StringProperty(
        name="Higgsas Library (.blend)",
        subtype="FILE_PATH",
        default=_DEFAULT_HIGGSAS,
        description="Path to Higgsas Geo Node Groups library blend file",
    )
    synthia_addon_path: bpy.props.StringProperty(
        name="Synthia Addon Path",
        subtype="DIR_PATH",
        default="",
        description="Optional folder hint for Synthia math-viz addon (install separately)",
    )

    def draw(self, context):
        layout = self.layout
        layout.label(text="Optional Dependencies")
        layout.prop(self, "higgsas_library_path")
        layout.prop(self, "synthia_addon_path")
        col = layout.column(align=True)
        for name in ("beavel", "synthia", "higgsas", "sverchok"):
            col.label(text=capabilities.status_line(name))


def repatch(monolith) -> bool:
    """Idempotent re-apply integration patches after importlib.reload."""
    from .integration import patch_monolith
    try:
        patch_monolith(monolith)
        global _PATCHED_MONOLITH
        _PATCHED_MONOLITH = monolith
        return True
    except Exception as exc:
        print(f"[Surreal Architecture] repatch failed: {exc}")
        return False


def register_preferences():
    try:
        bpy.utils.register_class(SurrealArchAddonPreferences)
    except RuntimeError:
        pass


def unregister_preferences():
    try:
        bpy.utils.unregister_class(SurrealArchAddonPreferences)
    except RuntimeError:
        pass
