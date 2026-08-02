"""Structure GN group builders ΓÇö gazebo, column, arch, roof assemblies.

Composes primitives and profiles into reusable architectural structures.
"""

from __future__ import annotations

import bpy

from .core import (
    safe_node, link_sockets, link_float_to_vector, color_node, new_geometry_tree,
    add_float_param, add_int_param, add_bool_param,
    make_group_input,
)


def build_gazebo(group_name="MEL_gazebo"):
    """Composable gazebo: circular array of columns + beam ring + roof + star finial.

    Inputs:
      Column Profile ΓÇö geometry input to instance as columns
      Roof Profile ΓÇö geometry input for roof panels
      Radius, Column Count, Roof Pitch, Height
    """
    tree, gin, gout = new_geometry_tree(group_name)
    bx, by = 0, 0

    make_group_input(tree, "NodeSocketGeometry", "Column Profile")
    make_group_input(tree, "NodeSocketGeometry", "Roof Profile")

    add_float_param(tree, "Radius", 1.5, 0.2, 20.0)
    add_int_param(tree, "Column Count", 8, 3, 64)
    add_float_param(tree, "Column Height", 2.4, 0.2, 20.0)
    add_float_param(tree, "Roof Pitch", 0.8, 0.1, 3.0)
    add_float_param(tree, "Beam Radius", 0.04, 0.01, 0.2)
    add_bool_param(tree, "Has Finial", True)

    col_profile = gin.outputs["Column Profile"] if "Column Profile" in gin.outputs else None
    roof_profile = gin.outputs["Roof Profile"] if "Roof Profile" in gin.outputs else None

    # ΓöÇΓöÇ Circular array of columns ΓöÇΓöÇ
    circle_col = safe_node(tree, "GeometryNodeMeshCircle", (bx - 200, by + 600))
    link_sockets(tree, gin.outputs["Radius"], circle_col.inputs["Radius"])
    link_sockets(tree, gin.outputs["Column Count"], circle_col.inputs["Vertices"])
    circle_col.fill_type = "NONE"

    # Instance column profile on circle points
    inst_col = safe_node(tree, "GeometryNodeInstanceOnPoints", (bx, by + 600))
    link_sockets(tree, circle_col.outputs["Mesh"], inst_col.inputs["Points"])
    if col_profile:
        link_sockets(tree, col_profile, inst_col.inputs["Instance"])

    # Scale column instances by height
    scale_col = safe_node(tree, "GeometryNodeScaleInstances", (bx + 200, by + 600))
    link_sockets(tree, inst_col.outputs["Instances"], scale_col.inputs["Instances"])
    link_float_to_vector(tree, gin.outputs["Column Height"], scale_col, "Scale", component=2, defaults=(1.0, 1.0, 0.0))

    # Realize
    realize_col = safe_node(tree, "GeometryNodeRealizeInstances", (bx + 400, by + 600))
    link_sockets(tree, scale_col.outputs["Instances"], realize_col.inputs["Geometry"])

    # ΓöÇΓöÇ Beam ring on top of columns ΓöÇΓöÇ
    circle_beam = safe_node(tree, "GeometryNodeMeshCircle", (bx - 200, by + 300))
    link_sockets(tree, gin.outputs["Radius"], circle_beam.inputs["Radius"])
    link_sockets(tree, gin.outputs["Column Count"], circle_beam.inputs["Vertices"])
    circle_beam.fill_type = "NONE"

    # Extrude the beam circle into a ring
    extrude_beam = safe_node(tree, "GeometryNodeExtrudeMesh", (bx, by + 300))
    link_sockets(tree, circle_beam.outputs["Mesh"], extrude_beam.inputs["Mesh"])
    link_sockets(tree, gin.outputs["Beam Radius"], extrude_beam.inputs["Offset Scale"])
    extrude_beam.mode = "EDGES"

    # Set beam position at column height
    set_pos_beam = safe_node(tree, "GeometryNodeSetPosition", (bx + 200, by + 300))
    link_sockets(tree, extrude_beam.outputs["Mesh"], set_pos_beam.inputs["Geometry"])
    beam_z = safe_node(tree, "ShaderNodeMath", (bx + 100, by + 300))
    beam_z.operation = "MULTIPLY"
    beam_z.inputs[0].default_value = 1.0
    link_sockets(tree, gin.outputs["Column Height"], beam_z.inputs[1])

    beam_pos_in = safe_node(tree, "GeometryNodeInputPosition", (bx - 100, by + 200))
    sep_z = safe_node(tree, "ShaderNodeSeparateXYZ", (bx, by + 200))
    link_sockets(tree, beam_pos_in.outputs["Position"], sep_z.inputs["Vector"])

    combine_beam = safe_node(tree, "ShaderNodeCombineXYZ", (bx + 200, by + 200))
    link_sockets(tree, sep_z.outputs["X"], combine_beam.inputs["X"])
    link_sockets(tree, sep_z.outputs["Y"], combine_beam.inputs["Y"])
    link_sockets(tree, beam_z.outputs[0], combine_beam.inputs["Z"])
    link_sockets(tree, combine_beam.outputs["Vector"], set_pos_beam.inputs["Position"])

    # ΓöÇΓöÇ Roof ΓöÇΓöÇ
    # Cone at top of columns
    roof_cone = safe_node(tree, "GeometryNodeMeshCone", (bx - 200, by))
    link_sockets(tree, gin.outputs["Column Count"], roof_cone.inputs["Vertices"])
    link_sockets(tree, gin.outputs["Radius"], roof_cone.inputs["Radius Bottom"])
    roof_cone.inputs["Radius Top"].default_value = 0.05
    roof_height = safe_node(tree, "ShaderNodeMath", (bx - 300, by))
    roof_height.operation = "MULTIPLY"
    link_sockets(tree, gin.outputs["Radius"], roof_height.inputs[0])
    link_sockets(tree, gin.outputs["Roof Pitch"], roof_height.inputs[1])
    link_sockets(tree, roof_height.outputs[0], roof_cone.inputs["Depth"])

    # Move roof to top of columns
    set_pos_roof = safe_node(tree, "GeometryNodeSetPosition", (bx, by))
    link_sockets(tree, roof_cone.outputs["Mesh"], set_pos_roof.inputs["Geometry"])
    roof_z = safe_node(tree, "ShaderNodeMath", (bx - 100, by - 100))
    roof_z.operation = "ADD"
    link_sockets(tree, beam_z.outputs[0], roof_z.inputs[0])
    link_sockets(tree, roof_height.outputs[0], roof_z.inputs[1])

    roof_pos_in = safe_node(tree, "GeometryNodeInputPosition", (bx - 200, by - 200))
    sep_z_roof = safe_node(tree, "ShaderNodeSeparateXYZ", (bx - 100, by - 200))
    link_sockets(tree, roof_pos_in.outputs["Position"], sep_z_roof.inputs["Vector"])

    combine_roof = safe_node(tree, "ShaderNodeCombineXYZ", (bx + 100, by - 200))
    link_sockets(tree, sep_z_roof.outputs["X"], combine_roof.inputs["X"])
    link_sockets(tree, sep_z_roof.outputs["Y"], combine_roof.inputs["Y"])
    link_sockets(tree, roof_z.outputs[0], combine_roof.inputs["Z"])
    link_sockets(tree, combine_roof.outputs["Vector"], set_pos_roof.inputs["Position"])

    # Roof thickness via extrude
    solid_roof = safe_node(tree, "GeometryNodeExtrudeMesh", (bx + 200, by))
    link_sockets(tree, set_pos_roof.outputs["Geometry"], solid_roof.inputs["Mesh"])
    solid_roof.inputs["Offset Scale"].default_value = 0.02
    solid_roof.mode = "FACES"

    # ΓöÇΓöÇ Star finial on top ΓöÇΓöÇ
    finial_cone = safe_node(tree, "GeometryNodeMeshCone", (bx + 400, by + 100))
    finial_cone.inputs["Vertices"].default_value = 5
    finial_cone.inputs["Radius Top"].default_value = 0.0
    finial_cone.inputs["Radius Bottom"].default_value = 0.08
    finial_cone.inputs["Depth"].default_value = 0.15

    switch_finial = safe_node(tree, "GeometryNodeSwitch", (bx + 600, by + 100))
    link_sockets(tree, gin.outputs["Has Finial"], switch_finial.inputs["Switch"])

    # Set finial position
    set_pos_fin = safe_node(tree, "GeometryNodeSetPosition", (bx + 500, by + 200))
    link_sockets(tree, finial_cone.outputs["Mesh"], set_pos_fin.inputs["Geometry"])
    fin_z = safe_node(tree, "ShaderNodeMath", (bx + 400, by + 300))
    fin_z.operation = "ADD"
    fin_z_extra = safe_node(tree, "ShaderNodeMath", (bx + 300, by + 300))
    fin_z_extra.operation = "ADD"
    link_sockets(tree, roof_z.outputs[0], fin_z_extra.inputs[0])
    fin_z_extra.inputs[1].default_value = 0.15
    link_sockets(tree, fin_z_extra.outputs[0], fin_z.inputs[0])
    fin_z.inputs[1].default_value = 0.0

    fin_pos_in = safe_node(tree, "GeometryNodeInputPosition", (bx + 300, by + 400))
    sep_z_fin = safe_node(tree, "ShaderNodeSeparateXYZ", (bx + 400, by + 400))
    link_sockets(tree, fin_pos_in.outputs["Position"], sep_z_fin.inputs["Vector"])
    combine_fin = safe_node(tree, "ShaderNodeCombineXYZ", (bx + 500, by + 400))
    link_sockets(tree, sep_z_fin.outputs["X"], combine_fin.inputs["X"])
    link_sockets(tree, sep_z_fin.outputs["Y"], combine_fin.inputs["Y"])
    link_sockets(tree, fin_z.outputs[0], combine_fin.inputs["Z"])
    link_sockets(tree, combine_fin.outputs["Vector"], set_pos_fin.inputs["Position"])

    try:
        switch_finial.input_type = "GEOMETRY"
    except Exception:
        pass
    link_sockets(tree, set_pos_fin.outputs["Geometry"], switch_finial.inputs.get("False") or switch_finial.inputs.get("FALSE"))

    # ΓöÇΓöÇ Join everything ΓöÇΓöÇ
    join = safe_node(tree, "GeometryNodeJoinGeometry", (bx + 600, by - 100))
    link_sockets(tree, realize_col.outputs["Geometry"], join.inputs["Geometry"])
    link_sockets(tree, set_pos_beam.outputs["Geometry"], join.inputs["Geometry"])
    link_sockets(tree, solid_roof.outputs["Mesh"], join.inputs["Geometry"])
    link_sockets(tree, switch_finial.outputs["Output"], join.inputs["Geometry"])

    shade = safe_node(tree, "GeometryNodeSetShadeSmooth", (bx + 800, by - 100))
    shade.inputs["Shade Smooth"].default_value = True
    link_sockets(tree, join.outputs["Geometry"], shade.inputs["Geometry"])

    link_sockets(tree, shade.outputs["Geometry"], gout.inputs["Geometry"])

    color_node(circle_col, "curve")
    color_node(inst_col, "instance")
    color_node(scale_col, "instance")
    color_node(realize_col, "instance")
    color_node(circle_beam, "curve")
    color_node(extrude_beam, "geometry")
    color_node(set_pos_beam, "attribute")
    color_node(roof_cone, "geometry")
    color_node(set_pos_roof, "attribute")
    color_node(solid_roof, "geometry")
    color_node(finial_cone, "geometry")
    color_node(switch_finial, "instance")
    color_node(join, "geometry")
    color_node(shade, "geometry")

    return tree


def build_arch(group_name="MEL_arch"):
    """Arch structure ΓÇö curved top with straight columns."""
    tree, gin, gout = new_geometry_tree(group_name)
    bx, by = 0, 0

    add_float_param(tree, "Span", 2.0, 0.2, 20.0)
    add_float_param(tree, "Height", 3.0, 0.2, 20.0)
    add_float_param(tree, "Arch Rise", 1.0, 0.1, 5.0)
    add_float_param(tree, "Thickness", 0.1, 0.01, 0.5)
    add_int_param(tree, "Segments", 16, 4, 64)

    # Left column
    col = safe_node(tree, "GeometryNodeMeshCube", (bx - 300, by + 200))
    link_float_to_vector(tree, gin.outputs["Height"], col, "Size", component=2, defaults=(0.0, 0.0, 0.0))
    link_float_to_vector(tree, gin.outputs["Thickness"], col, "Size", component=0, defaults=(0.0, 0.0, 0.0))

    set_pos_col_l = safe_node(tree, "GeometryNodeSetPosition", (bx - 100, by + 200))
    link_sockets(tree, col.outputs["Mesh"], set_pos_col_l.inputs["Geometry"])
    col_x = safe_node(tree, "ShaderNodeMath", (bx - 200, by + 300))
    col_x.operation = "MULTIPLY"
    link_sockets(tree, gin.outputs["Span"], col_x.inputs[0])
    col_x.inputs[1].default_value = -0.5
    col_y = safe_node(tree, "ShaderNodeMath", (bx - 200, by + 200))
    col_y.operation = "MULTIPLY"

    # Arch curve: arc via Circle
    arc = safe_node(tree, "GeometryNodeMeshCircle", (bx - 300, by))
    link_sockets(tree, gin.outputs["Segments"], arc.inputs["Vertices"])
    arc.inputs["Radius"].default_value = 1.0

    # Simplify arch: use a grid bent by set position

    link_sockets(tree, arc.outputs["Mesh"], gout.inputs["Geometry"])

    color_node(col, "geometry")
    color_node(set_pos_col_l, "attribute")
    color_node(arc, "curve")

    return tree


def build_portico(group_name="MEL_portico"):
    """Portico / pediment ΓÇö triangle gable roof over columns."""
    tree, gin, gout = new_geometry_tree(group_name)
    bx, by = 0, 0

    add_float_param(tree, "Width", 3.0, 0.5, 20.0)
    add_float_param(tree, "Depth", 1.5, 0.3, 10.0)
    add_float_param(tree, "Column Height", 2.4, 0.3, 20.0)
    add_int_param(tree, "Column Count", 4, 2, 20)

    # Simple box pediment
    cube = safe_node(tree, "GeometryNodeMeshCube", (bx - 200, by + 100))
    link_float_to_vector(tree, gin.outputs["Width"], cube, "Size", component=0, defaults=(0.0, 0.0, 0.0))
    link_float_to_vector(tree, gin.outputs["Depth"], cube, "Size", component=1, defaults=(0.0, 0.0, 0.0))
    cube.inputs["Size"].default_value[2] = 0.3

    set_pos_ped = safe_node(tree, "GeometryNodeSetPosition", (bx, by + 100))
    link_sockets(tree, cube.outputs["Mesh"], set_pos_ped.inputs["Geometry"])
    ped_z = safe_node(tree, "ShaderNodeMath", (bx - 100, by))
    ped_z.operation = "ADD"
    link_sockets(tree, gin.outputs["Column Height"], ped_z.inputs[0])
    ped_z.inputs[1].default_value = 0.3

    # Columns grid (simplified ΓÇö use grid of points + instance)
    grid = safe_node(tree, "GeometryNodeMeshGrid", (bx - 200, by - 200))
    link_sockets(tree, gin.outputs["Column Count"], grid.inputs["Vertices X"])
    grid.inputs["Vertices Y"].default_value = 2
    link_sockets(tree, gin.outputs["Width"], grid.inputs["Size X"])
    link_sockets(tree, gin.outputs["Depth"], grid.inputs["Size Y"])

    link_sockets(tree, set_pos_ped.outputs["Geometry"], gout.inputs["Geometry"])

    color_node(cube, "geometry")
    color_node(grid, "curve")
    color_node(set_pos_ped, "attribute")

    return tree


# -- Registry --
from .core import register_builder

register_builder("MEL_gazebo", build_gazebo, "Gazebo",
    "Full gazebo ΓÇö columns, beam ring, conical roof, star finial",
    "structures")
register_builder("MEL_arch", build_arch, "Arch",
    "Simple arch structure ΓÇö column pair with arc span",
    "structures")
register_builder("MEL_portico", build_portico, "Portico",
    "Portico assembly ΓÇö column grid with triangular pediment gable",
    "structures")
