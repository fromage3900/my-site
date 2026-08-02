"""Core GN tree builder utilities ΓÇö safe node creation, linking, coloring."""

from __future__ import annotations

import bpy

from .logging import log


def safe_node(tree, bl_idname, loc, fallback_callable=None):
    """Create a node, returns None on failure. Optionally call fallback.

    Logs failure at WARNING level so users can trace missing-node issues.
    """
    try:
        n = tree.nodes.new(bl_idname)
        n.location = loc
        return n
    except Exception as exc:
        log.warning(
            "safe_node: '%s' not available in %s ΓÇö %s",
            bl_idname, tree.name, exc,
        )
        if fallback_callable:
            log.debug("safe_node: attempting fallback for '%s'", bl_idname)
            try:
                return fallback_callable()
            except Exception as fb_exc:
                log.warning(
                    "safe_node: fallback also failed for '%s' ΓÇö %s",
                    bl_idname, fb_exc,
                )
        return None


def link_sockets(tree, from_socket, to_socket):
    """Link two sockets. Logs mismatches at debug level for troubleshooting."""
    if from_socket is None or to_socket is None:
        log.warning(
            "link_sockets: one or both sockets are None (tree=%s, from=%s, to=%s)",
            getattr(tree, "name", "?"), from_socket, to_socket,
        )
        return
    try:
        tree.links.new(from_socket, to_socket)
    except Exception as exc:
        log.warning(
            "link_sockets: cannot link %s ΓåÆ %s in %s ΓÇö %s",
            getattr(from_socket, "name", "?"),
            getattr(to_socket, "name", "?"),
            getattr(tree, "name", "?"),
            exc,
        )


def color_node(node, tag="default"):
    palette = {
        "default":  (0.3, 0.3, 0.3),
        "input":    (0.2, 0.4, 0.6),
        "output":   (0.6, 0.3, 0.2),
        "geometry": (0.2, 0.6, 0.3),
        "math":     (0.5, 0.3, 0.5),
        "curve":    (0.3, 0.5, 0.6),
        "instance": (0.6, 0.5, 0.2),
        "material": (0.4, 0.2, 0.5),
        "attribute":(0.3, 0.5, 0.4),
    }
    c = palette.get(tag, palette["default"])
    try:
        node.use_custom_color = True
        node.color = c
    except Exception as exc:
        log.debug("color_node: cannot color node '%s' ΓÇö %s", getattr(node, "name", "?"), exc)


def iter_tree_input_items(tree):
    """Yield input interface items (Blender 4+ interface or legacy tree.inputs)."""
    iface = getattr(tree, "interface", None)
    if iface is not None:
        try:
            for item in iface.items_tree:
                if getattr(item, "item_type", "") == "SOCKET" and getattr(item, "in_out", "") == "INPUT":
                    yield item
            return
        except Exception:
            pass
    inputs = getattr(tree, "inputs", None)
    if inputs is not None:
        for sock in inputs:
            yield sock


def tree_input_names(tree) -> list[str]:
    return [getattr(s, "name", "") for s in iter_tree_input_items(tree)]


def new_geometry_tree(name):
    """Create a new GeometryNodeTree with input/output already wired.

    Blender 4.0+ removed tree.inputs/outputs; use tree.interface instead.
    """
    old = bpy.data.node_groups.get(name)
    if old is not None:
        try:
            bpy.data.node_groups.remove(old)
            log.debug("new_geometry_tree: replaced existing tree '%s'", name)
        except Exception as exc:
            log.warning("new_geometry_tree: cannot remove old tree '%s' ΓÇö %s", name, exc)
    tree = bpy.data.node_groups.new(name, "GeometryNodeTree")
    try:
        tree.is_modifier = True
    except Exception:
        pass
    group_in = tree.nodes.new("NodeGroupInput")
    group_in.location = (-400, 0)
    group_out = tree.nodes.new("NodeGroupOutput")
    group_out.location = (600, 0)
    make_group_input(tree, "NodeSocketGeometry", "Geometry")
    make_group_output(tree, "NodeSocketGeometry", "Geometry")
    try:
        link_sockets(tree, group_in.outputs["Geometry"], group_out.inputs["Geometry"])
    except Exception as exc:
        log.warning(
            "new_geometry_tree: cannot link default I/O on '%s' ΓÇö %s", name, exc,
        )
    color_node(group_in, "input")
    color_node(group_out, "output")
    return tree, group_in, group_out


def make_group_input(tree, socket_type, name, default=None, min_val=None, max_val=None):
    """Add an input socket to the group (Blender 5.1 interface-safe)."""
    sock = None
    iface = getattr(tree, "interface", None)
    if iface is not None:
        try:
            sock = iface.new_socket(name=name, in_out="INPUT", socket_type=socket_type)
        except Exception as exc:
            log.debug(
                "make_group_input: interface.new_socket failed for '%s' (%s) ΓÇö %s; falling back to legacy",
                name, socket_type, exc,
            )
            sock = None
    if sock is None:
        inputs = getattr(tree, "inputs", None)
        if inputs is not None:
            try:
                sock = inputs.new(socket_type, name)
            except Exception as exc:
                log.warning(
                    "make_group_input: cannot create input '%s' (%s) in tree '%s' ΓÇö %s",
                    name, socket_type, getattr(tree, "name", "?"), exc,
                )
                return None
        else:
            log.warning(
                "make_group_input: no interface.inputs on tree '%s'",
                getattr(tree, "name", "?"),
            )
            return None
    if default is not None:
        try:
            sock.default_value = default
        except Exception as exc:
            log.debug("make_group_input: cannot set default on '%s' ΓÇö %s", name, exc)
    if min_val is not None:
        try:
            sock.min_value = min_val
        except Exception as exc:
            log.debug("make_group_input: cannot set min on '%s' ΓÇö %s", name, exc)
    if max_val is not None:
        try:
            sock.max_value = max_val
        except Exception as exc:
            log.debug("make_group_input: cannot set max on '%s' ΓÇö %s", name, exc)
    return sock


def make_group_output(tree, socket_type, name):
    iface = getattr(tree, "interface", None)
    if iface is not None:
        try:
            return iface.new_socket(name=name, in_out="OUTPUT", socket_type=socket_type)
        except Exception as exc:
            log.debug(
                "make_group_output: interface.new_socket failed for '%s' ΓÇö %s",
                name, exc,
            )
    outputs = getattr(tree, "outputs", None)
    if outputs is not None:
        try:
            return outputs.new(socket_type, name)
        except Exception as exc:
            log.warning(
                "make_group_output: cannot create output '%s' in tree '%s' ΓÇö %s",
                name, getattr(tree, "name", "?"), exc,
            )
            return None
    return None


def link_float_to_vector(tree, source_sock, target_node, target_input_name, component=0, defaults=None):
    """Link a float socket to one component of a vector input.

    Blender 5.1 removed vector socket .inputs sub-sockets, so we must
    use a CombineXYZ node as bridge. `component` is 0=X, 1=Y, 2=Z.
    `defaults` is a 3-tuple for the other two components (None = (0,0,0)).
    """
    if source_sock is None or target_node is None:
        log.debug(
            "link_float_to_vector: skipping ΓÇö source=%s target=%s",
            source_sock, getattr(target_node, "name", None),
        )
        return
    d = list(defaults) if defaults else [0.0, 0.0, 0.0]
    d[component] = source_sock
    vec_sock = target_node.inputs.get(target_input_name)
    if vec_sock is None:
        log.warning(
            "link_float_to_vector: '%s' input not found on node '%s'",
            target_input_name, getattr(target_node, "name", "?"),
        )
        return
    combine = safe_node(tree, "ShaderNodeCombineXYZ", (
        target_node.location.x - 180,
        target_node.location.y - 60,
    ))
    if combine is None:
        log.warning("link_float_to_vector: CombineXYZ unavailable")
        return
    for i, val in enumerate(d):
        sock_name = ["X", "Y", "Z"][i]
        if isinstance(val, (int, float)):
            try:
                combine.inputs[sock_name].default_value = val
            except Exception:
                pass
        else:
            try:
                tree.links.new(val, combine.inputs[sock_name])
            except Exception:
                pass
    try:
        tree.links.new(combine.outputs["Vector"], vec_sock)
    except Exception:
        pass


def add_float_param(tree, name, default=0.0, min_val=0.0, max_val=1.0, description=""):
    return make_group_input(tree, "NodeSocketFloat", name, default, min_val, max_val)


def add_int_param(tree, name, default=0, min_val=0, max_val=100, description=""):
    return make_group_input(tree, "NodeSocketInt", name, default, min_val, max_val)


def add_bool_param(tree, name, default=False, description=""):
    return make_group_input(tree, "NodeSocketBool", name, default)


def add_vector_param(tree, name, default=(0.0, 0.0, 0.0), description=""):
    return make_group_input(tree, "NodeSocketVector", name, default)


# ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
# Builder registry ΓÇö populated by each module via register_builder()
# ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ

GROUP_BUILDERS: dict[str, callable] = {}
GROUP_METADATA: dict[str, dict] = {}

CATEGORY_META: dict[str, dict] = {
    "primitives":  {"label": "Primitives",          "icon": "MESH_GRID"},
    "profiles":    {"label": "Profiles",             "icon": "MESH_CYLINDER"},
    "math_attrs":  {"label": "Math & Attributes",    "icon": "NODETREE"},
    "structures":  {"label": "Structures",           "icon": "HOME"},
    "effects":     {"label": "Magic Effects",        "icon": "SHADERFX"},
    "ornament":    {"label": "Ornament",             "icon": "DECORATE"},
    "music":       {"label": "Musical Notation",     "icon": "FILE_SOUND"},
    "castle":      {"label": "Castle Kit",           "icon": "MOD_BUILD"},
    "operations":  {"label": "Operations",           "icon": "AUTOMERGE_ON"},
}


def register_builder(tree_name, builder_fn, label, description="", category=""):
    """Register a GN tree builder into the global registry.

    Called at module-import time by each builder module.  All derived
    data structures (TREE_TYPES, TREE_DESCRIPTIONS, etc.) are lazily
    rebuilt by _rebuild_derived_data() which __init__.py calls after
    all sub-modules have been imported.
    """
    GROUP_BUILDERS[tree_name] = builder_fn
    GROUP_METADATA[tree_name] = {
        "label":       label,
        "description": description,
        "category":    category,
    }


# Derived data (rebuilt by __init__.py after all builder registrations)
TREE_TYPES: list[tuple[str, str]] = []
TREE_LABEL_MAP: dict[str, str] = {}
TREE_DESCRIPTIONS: dict[str, str] = {}
TREE_CATEGORY_MAP: dict[str, str] = {}
TREE_CATEGORIES: dict[str, dict] = {}


def _rebuild_derived_data():
    """Rebuild all lookup tables from GROUP_METADATA after all registrations.

    Called once by __init__.py after importing every builder module.
    Idempotent ΓÇö safe to call on addon reload.
    """
    global TREE_TYPES, TREE_LABEL_MAP, TREE_DESCRIPTIONS, TREE_CATEGORY_MAP, TREE_CATEGORIES

    TREE_TYPES = sorted(
        [(name, meta["label"]) for name, meta in GROUP_METADATA.items()],
        key=lambda x: x[1],
    )
    TREE_LABEL_MAP = {name: meta["label"] for name, meta in GROUP_METADATA.items()}
    TREE_DESCRIPTIONS = {
        name: meta["description"]
        for name, meta in GROUP_METADATA.items()
        if meta["description"]
    }
    TREE_CATEGORY_MAP = {
        name: meta["category"]
        for name, meta in GROUP_METADATA.items()
        if meta["category"]
    }

    # Build categorized lookup (category_id ΓåÆ {label, icon, trees})
    cats: dict[str, dict] = {}
    for cid, cinfo in CATEGORY_META.items():
        cats[cid] = {
            "label": cinfo["label"],
            "icon":  cinfo["icon"],
            "trees": [],
        }
    for name, meta in GROUP_METADATA.items():
        cid = meta.get("category", "")
        if cid in cats:
            cats[cid]["trees"].append(name)
    TREE_CATEGORIES = cats
