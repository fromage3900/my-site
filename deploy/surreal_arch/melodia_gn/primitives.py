"""Primitive GN group builders ΓÇö circular array, linear array, grid array, bounding box, instance on spline."""

from __future__ import annotations

import math

import bpy

from .core import (
    safe_node, link_sockets, link_float_to_vector, color_node, new_geometry_tree,
    add_float_param, add_int_param, add_bool_param, add_vector_param,
    make_group_output, make_group_input, tree_input_names,
)


def build_circular_array(group_name="MEL_circular_array"):
    """Create a reusable circular array node group.

    Parameters:
        Geometry, Count, Radius, Scale per item, Offset Z
    """
    tree, gin, gout = new_geometry_tree(group_name)
    bx, by = 0, 0

    count_n = add_int_param(tree, "Count", 8, 1, 256)
    radius_n = add_float_param(tree, "Radius", 2.0, 0.01, 100.0)
    scale_n = add_float_param(tree, "Scale per item", 1.0, 0.01, 10.0)
    offset_z = add_float_param(tree, "Offset Z", 0.0, -100.0, 100.0)

    # Circle of points using MeshCircle with N vertices (fill=NONE = just vertices)
    circle = safe_node(tree, "GeometryNodeMeshCircle", (bx - 300, by + 200))
    link_sockets(tree, count_n, circle.inputs["Vertices"])
    link_sockets(tree, radius_n, circle.inputs["Radius"])
    circle.fill_type = "NONE"

    # Instance on circle vertices
    inst_on_pts = safe_node(tree, "GeometryNodeInstanceOnPoints", (bx, by + 100))
    link_sockets(tree, circle.outputs["Mesh"], inst_on_pts.inputs["Points"])
    link_sockets(tree, gin.outputs["Geometry"], inst_on_pts.inputs["Instance"])

    # Scale per item
    scale_inst = safe_node(tree, "GeometryNodeScaleInstances", (bx + 200, by + 100))
    link_float_to_vector(tree, scale_n, scale_inst, "Scale", component=1, defaults=(1.0, 0.0, 1.0))
    link_sockets(tree, inst_on_pts.outputs["Instances"], scale_inst.inputs["Instances"])

    # Z offset per item
    translate = safe_node(tree, "GeometryNodeTranslateInstances", (bx + 400, by))
    link_float_to_vector(tree, offset_z, translate, "Translation", component=2)
    link_sockets(tree, scale_inst.outputs["Instances"], translate.inputs["Instances"])

    link_sockets(tree, translate.outputs["Instances"], gout.inputs["Geometry"])

    color_node(circle, "geometry")
    color_node(inst_on_pts, "instance")
    color_node(scale_inst, "instance")
    color_node(translate, "instance")

    return tree


def build_linear_array(group_name="MEL_linear_array"):
    tree, gin, gout = new_geometry_tree(group_name)
    bx, by = 0, 0

    add_int_param(tree, "Count", 5, 1, 256)
    add_vector_param(tree, "Offset", (2.0, 0.0, 0.0))
    add_float_param(tree, "Scale per item", 1.0, 0.01, 10.0)
    add_float_param(tree, "Taper", 0.0, -1.0, 1.0)

    to_inst = safe_node(tree, "GeometryNodeTransform", (bx, by + 100))
    to_inst.inputs["Scale"].default_value = (0, 0, 0)
    link_sockets(tree, gin.outputs["Geometry"], to_inst.inputs["Geometry"])

    count_n = gin.outputs["Count"] if "Count" in tree_input_names(tree) else None
    off_n = gin.outputs["Offset"] if "Offset" in tree_input_names(tree) else None
    scale_n = gin.outputs["Scale per item"] if "Scale per item" in tree_input_names(tree) else None

    line = safe_node(tree, "GeometryNodeMeshLine", (bx - 300, by))
    if count_n:
        link_sockets(tree, count_n, line.inputs["Count"])
    if off_n:
        link_sockets(tree, off_n, line.inputs["Start Location"])
        link_sockets(tree, off_n, line.inputs["Offset"])

    inst_on_pts = safe_node(tree, "GeometryNodeInstanceOnPoints", (bx + 200, by))
    link_sockets(tree, line.outputs["Mesh"], inst_on_pts.inputs["Points"])
    link_sockets(tree, to_inst.outputs["Geometry"], inst_on_pts.inputs["Instance"])

    scale_inst = safe_node(tree, "GeometryNodeScaleInstances", (bx + 400, by))
    if scale_n:
        link_float_to_vector(tree, scale_n, scale_inst, "Scale", component=1, defaults=(1.0, 0.0, 1.0))
    link_sockets(tree, inst_on_pts.outputs["Instances"], scale_inst.inputs["Instances"])

    link_sockets(tree, scale_inst.outputs["Instances"], gout.inputs["Geometry"])

    color_node(to_inst, "instance")
    color_node(line, "curve")
    color_node(inst_on_pts, "instance")
    color_node(scale_inst, "instance")

    return tree


def build_grid_array(group_name="MEL_grid_array"):
    tree, gin, gout = new_geometry_tree(group_name)
    bx, by = 0, 0

    add_int_param(tree, "Count X", 4, 1, 50)
    add_int_param(tree, "Count Y", 4, 1, 50)
    add_float_param(tree, "Spacing X", 2.0, 0.1, 50.0)
    add_float_param(tree, "Spacing Y", 2.0, 0.1, 50.0)

    to_inst = safe_node(tree, "GeometryNodeTransform", (bx, by + 100))
    to_inst.inputs["Scale"].default_value = (0, 0, 0)
    link_sockets(tree, gin.outputs["Geometry"], to_inst.inputs["Geometry"])

    grid = safe_node(tree, "GeometryNodeMeshGrid", (bx - 300, by))
    grid.inputs["Size X"].default_value = 1
    grid.inputs["Size Y"].default_value = 1

    inst_on_pts = safe_node(tree, "GeometryNodeInstanceOnPoints", (bx + 200, by))
    link_sockets(tree, grid.outputs["Mesh"], inst_on_pts.inputs["Points"])
    link_sockets(tree, to_inst.outputs["Geometry"], inst_on_pts.inputs["Instance"])

    resolve = safe_node(tree, "GeometryNodeRealizeInstances", (bx + 400, by))
    link_sockets(tree, inst_on_pts.outputs["Instances"], resolve.inputs["Geometry"])
    link_sockets(tree, resolve.outputs["Geometry"], gout.inputs["Geometry"])

    color_node(to_inst, "instance")
    color_node(grid, "geometry")
    color_node(inst_on_pts, "instance")
    color_node(resolve, "geometry")

    return tree


def build_bounding_box(group_name="MEL_bounding_box"):
    """Bounding box group ΓÇö outputs size and center for proportional sizing."""
    tree, gin, gout = new_geometry_tree(group_name)
    bx, by = 0, 0

    bbox = safe_node(tree, "GeometryNodeBoundBox", (bx + 100, 0))
    link_sockets(tree, gin.outputs["Geometry"], bbox.inputs["Geometry"])

    bbox_min = safe_node(tree, "GeometryNodeInputMeshVolume", (bx, -200))
    bbox_min = safe_node(tree, "ShaderNodeVectorMath", (bx - 100, -200))
    bbox_min.operation = "MINIMUM"

    separate_xyz = safe_node(tree, "ShaderNodeSeparateXYZ", (bx + 300, 0))
    link_sockets(tree, bbox.outputs["Bounding Box"], separate_xyz.inputs["Vector"])
    link_sockets(tree, separate_xyz.outputs["Z"], gout.inputs["Geometry"])

    link_sockets(tree, bbox.outputs["Bounding Box"], bbox_min.inputs[0])
    link_sockets(tree, bbox.outputs["Min"], bbox_min.inputs[1])
    link_sockets(tree, bbox_min.outputs["Vector"], separate_xyz.inputs["Vector"])

    make_group_output(tree, "NodeSocketVector", "Size")
    make_group_output(tree, "NodeSocketVector", "Center")

    link_sockets(tree, bbox.outputs["Bounding Box"], gout.inputs["Size"])
    link_sockets(tree, gin.outputs["Geometry"], gout.inputs["Center"])

    color_node(bbox, "geometry")
    color_node(separate_xyz, "math")
    color_node(bbox_min, "math")

    return tree


def build_instance_on_spline(group_name="MEL_instance_on_spline"):
    """Instance geometry along a curve ΓÇö used for railings, arches, fences."""
    tree, gin, gout = new_geometry_tree(group_name)
    bx, by = 0, 0

    add_int_param(tree, "Count", 10, 2, 500)
    add_float_param(tree, "Scale", 1.0, 0.01, 10.0)
    add_float_param(tree, "Offset along curve", 0.0, -10.0, 10.0)

    to_inst = safe_node(tree, "GeometryNodeTransform", (bx, by + 100))
    to_inst.inputs["Scale"].default_value = (0, 0, 0)
    link_sockets(tree, gin.outputs["Geometry"], to_inst.inputs["Geometry"])

    spline_in = make_group_input(tree, "NodeSocketGeometry", "Spline")
    if spline_in is None:
        spline_in = gin.outputs["Geometry"]

    count_n = gin.outputs["Count"] if "Count" in tree_input_names(tree) else None

    resample = safe_node(tree, "GeometryNodeResampleCurve", (bx - 300, by))
    if count_n:
        try:
            resample.mode = "COUNT"
        except Exception:
            res_in = resample.inputs.get("Count")
            if res_in is not None:
                link_sockets(tree, count_n, res_in)
            try:
                resample.inputs["Count"].default_value = 10
            except Exception:
                pass

    inst_on_pts = safe_node(tree, "GeometryNodeInstanceOnPoints", (bx + 200, by))
    link_sockets(tree, resample.outputs["Curve"], inst_on_pts.inputs["Points"])
    link_sockets(tree, to_inst.outputs["Geometry"], inst_on_pts.inputs["Instance"])

    resolve = safe_node(tree, "GeometryNodeRealizeInstances", (bx + 400, by))
    link_sockets(tree, inst_on_pts.outputs["Instances"], resolve.inputs["Geometry"])

    join = safe_node(tree, "GeometryNodeJoinGeometry", (bx + 550, by - 50))
    link_sockets(tree, resolve.outputs["Geometry"], join.inputs["Geometry"])
    link_sockets(tree, gin.outputs["Geometry"], join.inputs["Geometry"])
    link_sockets(tree, join.outputs["Geometry"], gout.inputs["Geometry"])

    color_node(to_inst, "instance")
    color_node(resample, "curve")
    color_node(inst_on_pts, "instance")
    color_node(resolve, "geometry")
    color_node(join, "geometry")

    return tree


# -- Registry --
from .core import register_builder

register_builder("MEL_circular_array", build_circular_array, "Circular Array",
    "Radial array ΓÇö instance geometry around a circle with scale and Z offset",
    "primitives")
register_builder("MEL_linear_array", build_linear_array, "Linear Array",
    "Linear array along a direction vector with count, spacing, and taper",
    "primitives")
register_builder("MEL_grid_array", build_grid_array, "Grid Array",
    "2D grid array with count and spacing controls on both axes",
    "primitives")
register_builder("MEL_bounding_box", build_bounding_box, "Bounding Box",
    "Extract bounding box size and center from input geometry",
    "primitives")
register_builder("MEL_instance_on_spline", build_instance_on_spline, "Instance on Spline",
    "Instance geometry along a curve with controllable spacing",
    "primitives")
