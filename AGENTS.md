# Multi-Agent Production Framework — Environment Portfolio Platform

This document defines the roles, ownership boundaries, communication protocols, and execution loops for the multi-agent production team responsible for building the **Environment Portfolio Platform** in Unreal Engine 5.8 and Blender 5.1.

---

## 1. Agent Personas & Specializations

To ensure clean execution, the multi-agent team is divided into five specialized personas. Each agent possesses a specific skill set, tool configurations, and system boundaries.

```
                  ┌───────────────────────────────┐
                  │      QA & SENTINEL AGENT      │
                  │   Audits, validation, status  │
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  GEOMETRY AGENT │      │ PLACEMENT AGENT │      │  MATERIAL AGENT │
│   Blender OS,   │      │   Unreal PCG,   │      │ Masters, PBR,   │
│ Style Genomes   │      │  PCGEx scatter  │      │ Material Maker  │
└────────┬────────┘      └─────────────────┘      └────────┬────────┘
         │                                                 │
         │          ┌───────────────────────────┐          │
         └─────────►│     INTEGRATION AGENT     │◄─────────┘
                    │   Live Link, HISM Import  │
                    └───────────────────────────┘
```

### 1.1 Procedural Geometry Agent (PGA)
*   **Role**: Procedural Architect & Systems Designer (Blender).
*   **Specialization**: Core asset generation, modular kit snapping, grammatical axis creation, and non-Euclidean transforms.
*   **System Ownership**:
    *   Blender generation core: [surreal_architecture_gen.py](file:///g:/EnvironmentPortfolio/BS_GodFile/deploy/surreal_architecture_gen.py)
    *   Style genomes & schema definitions: [deploy/surreal_os/](file:///g:/EnvironmentPortfolio/BS_GodFile/deploy/surreal_os/)
    *   Blender primitives & mesh utilities: [deploy/surreal_greybox/](file:///g:/EnvironmentPortfolio/BS_GodFile/deploy/surreal_greybox/)
    *   Architectural studies & research: [research/](file:///g:/EnvironmentPortfolio/BS_GodFile/research/)
*   **Tooling**: Blender 5.1 Python API, YAML/JSON parsing libraries, mesh topology analysis.

### 1.2 Material Pipeline Agent (MPA)
*   **Role**: Technical Material Artist & Shader Engineer (Unreal Engine & Material Maker).
*   **Specialization**: Substrate Toon conversion, master material node tree wiring, triplanar mapping, temporal visual effects, and procedural PBR generation.
*   **System Ownership**:
    *   Universal surface master & script: [setup_master_universal.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/setup_master_universal.py)
    *   Landscape master & script: [setup_landscape_height_blend.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/setup_landscape_height_blend.py)
    *   Water master & script: [setup_master_water.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/setup_master_water.py)
    *   Impressionist master & script: [setup_impressionist_materials.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/setup_impressionist_materials.py)
    *   Material Maker graphs & Python builders: [Tools/MaterialMaker/](file:///g:/EnvironmentPortfolio/BS_GodFile/Tools/MaterialMaker/)
    *   Material function generator library: [setup_material_functions.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/setup_material_functions.py)
    *   Substrate Toon profile presets: `/Game/EnvSandbox/Materials/ToonProfiles/`
*   **Tooling**: Unreal Engine Material Graph Python API (`unreal.MaterialEditingLibrary`), Material Maker `.ptex` graph compiler.

### 1.3 Procedural Placement Agent (PPA)
*   **Role**: Environment Scatter Specialist (Unreal Engine).
*   **Specialization**: PCG graph construction, PCGEx integration, density-falloff systems, and salvage of legacy assets.
*   **System Ownership**:
    *   PCG builder API: [pcg_graph_builder.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/pcg_graph_builder.py)
    *   PCG standards & paths: [pcg_portfolio_standards.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/pcg_portfolio_standards.py)
    *   Universal scatter graphs: `/Game/EnvSandbox/PCG/Graphs/Universal/`
    *   Style wrappers & builders: [setup_pcg_universal.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/setup_pcg_universal.py), [setup_pcg_sakura.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/setup_pcg_sakura.py)
    *   Melodia salvage mapping: `/Game/_PROJECT/PCG/`
*   **Tooling**: Unreal Engine PCG & PCGEx C++/Python API, point-cloud operations, volume/spline samplers.

### 1.4 World Integration Agent (WIA)
*   **Role**: Pipeline & Tools Engineer (Blender & Unreal Engine).
*   **Specialization**: Coordinate space transformations, Live Link networking, instancing optimization, and manifest parsing.
*   **System Ownership**:
    *   Live Link connection controller: [livelink_unreal.pyc](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/livelink_unreal.pyc)
    *   Editor startup integration: [init_unreal.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/init_unreal.py)
    *   World manifest importer: [import_world_manifest.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/import_world_manifest.py)
    *   Blender Live Link addon: [Tools/BlenderLiveLink/](file:///g:/EnvironmentPortfolio/BS_GodFile/Tools/BlenderLiveLink/)
    *   World export compiler: `deploy/surreal_world/export.py`
*   **Tooling**: Socket communication (TCP/UDP), FBX automated import scripts, HISM (Hierarchical Instanced Static Mesh) spawn interfaces.

### 1.5 QA & Sentinel Agent (SQA)
*   **Role**: Build & Release Engineer / Quality Assurance.
*   **Specialization**: Automated test execution, database verification, naming rule enforcement, and dead reference pruning.
*   **System Ownership**:
    *   Verification orchestrators: [run_verify.ps1](file:///g:/EnvironmentPortfolio/BS_GodFile/deploy/run_verify.ps1), [_mcp_verify_world.py](file:///g:/EnvironmentPortfolio/BS_GodFile/deploy/_mcp_verify_world.py)
    *   Asset audit scripts: `Content/Python/audit_*.py`
    *   Redirector and path patchers: [fix_migration_redirectors.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/fix_migration_redirectors.py), [fix_pcg_dead_systems.py](file:///g:/EnvironmentPortfolio/BS_GodFile/Content/Python/fix_pcg_dead_systems.py)
*   **Tooling**: Command-line verification runners (`UnrealEditor-Cmd.exe`), JSON report diffing, and dependency validation interfaces.

---

## 2. Ownership Boundaries

Agents must respect ownership domains. Modifying files outside of an agent's designated system requires coordination or explicit API integration.

| File Path Prefix / Directory | Primary Owner | Read Access | Write Access | Action Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `g:/.../BS_GodFile/Source/` | *Core Engine* | All Agents | None | **Do not modify** (handled by manual build) |
| `g:/.../BS_GodFile/Config/` | *Core Engine* | All Agents | MPA / WIA | Only for Project settings (`DefaultEngine.ini`) |
| `g:/.../BS_GodFile/deploy/surreal_os/` | **PGA** | WIA / SQA | **PGA** | Modifying genome requires updating taxonomy |
| `g:/.../BS_GodFile/deploy/surreal_world/` | **WIA** | PGA / SQA | **WIA** | Schema changes must update import script |
| `g:/.../BS_GodFile/Content/Python/` (Material) | **MPA** | SQA | **MPA** | Node changes must keep output pins unchanged |
| `g:/.../BS_GodFile/Content/Python/` (PCG) | **PPA** | SQA | **PPA** | Standard tags must remain backward-compatible |
| `g:/.../BS_GodFile/Tools/MaterialMaker/` | **MPA** | PGA | **MPA** | Texture dimensions must be power-of-two |
| `g:/.../BS_GodFile/Docs/` | **All Agents** | All Agents | All Agents | Append only, preserve history |

---

## 3. Communication Protocols & Contracts

Agents communicate via structured file formats, ports, and logical metadata mappings.

### 3.1 World Manifest Contract (`surreal_arch_world_v1`)
*   **Publisher**: **PGA** (via Blender addon export).
*   **Subscriber**: **WIA** (via `import_world_manifest.py`).
*   **Data Structure**: JSON file `{WorldRoot}.world.json`.
*   **Coordinate Standard**: Blender Z-Up (Matrix 4x4, meters) converted to UE Left-Handed Z-Up (cm) by WIA.

### 3.2 Material Mapping Interface (`ROLE_UE_HINTS`)
*   **Definition**: `deploy/surreal_world/export.py` contains mapping from structural role to EnvSandbox material instance paths.
*   **Contract**:
    *   **PGA** assigns roles (`large`, `medium`, `wall`, `sacred`) to generated geometries.
    *   **MPA** guarantees that matching target material instances (`MI_Show_StoneCliff`, `MI_Trimsheet_HeavyWear`, `MI_Zen_Karesansui`) exist, compile, and use the correct Substrate Toon parameters.

### 3.3 Live Link Connection Protocol
*   **TCP/IP Port**: Default port `55557` (established by UnrealMCP/livelink client).
*   **Payload Format**: JSON command packets containing mesh name, transform vectors, snap indices, and export path cues.

### 3.4 Audit & Status Reports
*   **Output Directory**: `/Saved/Audit/` inside the project folder.
*   **File Format**: `{system}_audit.json`.
*   **Usage**: **SQA** writes status; other agents read these files to identify dead systems, unassigned materials, or missing assets before running their cycles.

---

## 4. Coordination Framework & Autonomous Loops

Agents run in periodic loops managed by PowerShell sentinel runners.

```text
[Loop Runner] ──► [SQA Check] ──► [PGA Generator] ──► [WIA Importer] ──► [MPA Builder] ──► [SQA Verification]
       ▲                                                                                       │
       └─────────────────────────────────── Next Cycle ────────────────────────────────────────┘
```

1.  **Triggering Loop Cycles**:
    *   `start_surreal_loop.ps1` runs the **PGA** cycle (Interval: 120s) with sentinel `AGENT_LOOP_TICK_surreal_tierb`.
    *   `start_world_loop.ps1` runs the **WIA** cycle (Interval: 600s) with sentinel `AGENT_LOOP_TICK_world_micro10`.
    *   `run_material_aaa_loop_tick.py` runs the **MPA** cycle (Interval: 15m) with sentinel `AGENT_LOOP_WAKE_material_aaa`.
2.  **Safety Interlocks**:
    *   If **SQA** verification fails (`run_verify.ps1` returns non-zero), the loops halt immediately, creating a `*_LOOP_STOP` file on disk. No agent can publish changes until the block is resolved.
    *   No file writes to `Content/_PROJECT/` are permitted. All ports and exports must target `/Game/EnvSandbox/` or `deploy/`.
