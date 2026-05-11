# PenOpt — CT Scan Orientation Optimizer

A desktop tool that finds the optimal orientation for CT scanning a manufactured part. It loads a 3D triangle mesh representing the part, simulates X-ray projections through the mesh at various orientations using BVH-accelerated ray casting, and searches over orientations to minimize penetration, energy requirements, and beam-hardening artifacts.

## Language

**Mesh:**
A 3D triangle mesh representing the scanned part. Loaded from STL or OBJ files. Stored as a flat list of triangles.
_Avoid:_ Model, object, geometry

**Orientation:**
A pair of angles (θ around X-axis, φ around Y-axis) defining the part's pose during scanning. The search space is θ ∈ [-45°, 45°] and φ ∈ [-45°, 45°].
_Avoid:_ Pose, rotation, angle

**Projection:**
A simulated 2D X-ray image at one rotation angle α around the object. Each projection consists of a grid of rays cast from the source through the mesh.
_Avoid:_ Shot, exposure, frame

**Ray:**
A single X-ray beam traced from the source through the mesh to the detector. The penetration length is the total distance the ray travels through solid material.
_Avoid:_ Beam, line, trace

**Penetration:**
The total path length a ray travels through mesh material (mm). The primary quantity being minimized.
_Avoid:_ Thickness, path length, distance

**BVH (Bounding Volume Hierarchy):**
A spatial acceleration structure that organizes mesh triangles so ray-triangle intersections can be found in O(log n) instead of O(n).
_Avoid:_ Tree, acceleration structure

**IntelliScan:**
An adaptive projection allocation method (Butzhammer 2026, Lifton & Poon 2023) that identifies projection angles where X-rays are tangent to mesh faces, and allocates more rays to informative orientations.
_Avoid:_ Adaptive scanning, tangent-ray selection

**Scanner Config:**
The geometric parameters of a CT scanner: source-to-detector distance (SDD), source-to-object distance (SOD), detector dimensions, pixel count, ray sampling grid size, and number of projection angles.
_Avoid:_ Scanner geometry, scan setup

**Objective function:**
One of three metrics evaluated at each orientation: f_mtl (generalized mean penetration), f_energy (max penetration), f_hdn (projection non-uniformity). Combined into a weighted score.
_Avoid:_ Metric, cost, target

## Relationships

- A **Mesh** is loaded from a file → a **BVH** is built from it
- An **Orientation** is evaluated by casting a grid of **Rays** through the **BVH**
- Each **Projection** produces a set of **Penetration** values (one per **Ray**)
- All **Projections** for an **Orientation** produce the three **Objective function** values
- **IntelliScan** analyzes mesh face normals at the best **Orientation** to recommend minimal projection angles

## Example dialogue

> **Dev:** "When I load a Mesh, the BVH is rebuilt every time?"
> **Domain expert:** "Yes — the BVH depends on triangle positions. Reloading the mesh replaces both."
> **Dev:** "And after the search, IntelliScan uses the Mesh to compute tangent angles?"
> **Domain expert:** "Right — it needs face normals, which come from the Mesh, not the BVH."
