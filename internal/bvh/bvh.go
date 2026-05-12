// Package bvh implements a bounding volume hierarchy for fast ray-triangle intersection.
// Uses median-split along the longest axis (simpler than SAH, sufficient for MVP).
package bvh

import (
	"math"
	"sort"

	"penopt/internal/mesh"
	"penopt/internal/vec"
)

const (
	// LeafSize is the max triangles per leaf node.
	LeafSize = 8
	// Epsilon for floating-point comparisons.
	Epsilon = 1e-8
)

// AABB is an axis-aligned bounding box.
type AABB struct {
	Min, Max mesh.Vec3
}

// Node is a BVH tree node.
type Node struct {
	Bounds   AABB
	Left     *Node
	Right    *Node
	TriStart int // index into triangle list (leaf)
	TriEnd   int // exclusive end
}

// BVH is the bounding volume hierarchy.
type BVH struct {
	Root      *Node
	Triangles []mesh.Triangle  // reordered triangles at leaves
	NumTris   int
}

// Build constructs a BVH from a mesh.
func Build(m *mesh.Mesh) *BVH {
	tris := make([]mesh.Triangle, len(m.Triangles))
	copy(tris, m.Triangles)

	bvh := &BVH{
		Triangles: tris,
		NumTris:   len(tris),
	}
	bvh.Root = bvh.buildRange(0, len(tris))
	return bvh
}

// buildRange recursively builds the BVH for triangles[start:end].
func (bvh *BVH) buildRange(start, end int) *Node {
	node := &Node{
		TriStart: start,
		TriEnd:   end,
	}

	// Compute bounds for this range
	node.Bounds = computeBounds(bvh.Triangles[start:end])

	// If few enough triangles, make leaf
	count := end - start
	if count <= LeafSize {
		return node
	}

	// Find longest axis
	extent := mesh.Vec3{
		X: node.Bounds.Max.X - node.Bounds.Min.X,
		Y: node.Bounds.Max.Y - node.Bounds.Min.Y,
		Z: node.Bounds.Max.Z - node.Bounds.Min.Z,
	}

	var axis int // 0=X, 1=Y, 2=Z
	if extent.Y >= extent.X && extent.Y >= extent.Z {
		axis = 1
	} else if extent.Z >= extent.X && extent.Z >= extent.Y {
		axis = 2
	}

	// Sort triangles by centroid along the chosen axis
	// Pre-compute centroids once to avoid recomputing per comparison
	centroids := make([]float64, count)
	for i := 0; i < count; i++ {
		centroids[i] = centroid(bvh.Triangles[start+i], axis)
	}
	sort.Slice(bvh.Triangles[start:end], func(i, j int) bool {
		return centroids[i] < centroids[j]
	})

	// Split at midpoint
	mid := start + count/2
	node.Left = bvh.buildRange(start, mid)
	node.Right = bvh.buildRange(mid, end)

	return node
}

// centroid returns the centroid coordinate of a triangle along the given axis (0=X,1=Y,2=Z).
func centroid(tri mesh.Triangle, axis int) float64 {
	switch axis {
	case 0:
		return (tri.V0.X + tri.V1.X + tri.V2.X) / 3
	case 1:
		return (tri.V0.Y + tri.V1.Y + tri.V2.Y) / 3
	default:
		return (tri.V0.Z + tri.V1.Z + tri.V2.Z) / 3
	}
}

// computeBounds returns the AABB for a slice of triangles.
func computeBounds(tris []mesh.Triangle) AABB {
	var b AABB
	b.Min = mesh.Vec3{X: 1e30, Y: 1e30, Z: 1e30}
	b.Max = mesh.Vec3{X: -1e30, Y: -1e30, Z: -1e30}
	for _, tri := range tris {
		for _, v := range []mesh.Vec3{tri.V0, tri.V1, tri.V2} {
			if v.X < b.Min.X {
				b.Min.X = v.X
			}
			if v.Y < b.Min.Y {
				b.Min.Y = v.Y
			}
			if v.Z < b.Min.Z {
				b.Min.Z = v.Z
			}
			if v.X > b.Max.X {
				b.Max.X = v.X
			}
			if v.Y > b.Max.Y {
				b.Max.Y = v.Y
			}
			if v.Z > b.Max.Z {
				b.Max.Z = v.Z
			}
		}
	}
	return b
}

// ── Ray-AABB intersection (slab method) ──

// RayAABBIntersect returns true if ray hits the AABB, and the near/far distances.
func RayAABBIntersect(origin, dir mesh.Vec3, bounds AABB) (hit bool, tNear, tFar float64) {
	tNear = -1e30
	tFar = 1e30

	for axis := 0; axis < 3; axis++ {
		var o, d, min, max float64
		switch axis {
		case 0:
			o, d, min, max = origin.X, dir.X, bounds.Min.X, bounds.Max.X
		case 1:
			o, d, min, max = origin.Y, dir.Y, bounds.Min.Y, bounds.Max.Y
		default:
			o, d, min, max = origin.Z, dir.Z, bounds.Min.Z, bounds.Max.Z
		}

		if math.Abs(d) < Epsilon {
			if o < min || o > max {
				return false, 0, 0
			}
		} else {
			t1 := (min - o) / d
			t2 := (max - o) / d
			if t1 > t2 {
				t1, t2 = t2, t1
			}
			if t1 > tNear {
				tNear = t1
			}
			if t2 < tFar {
				tFar = t2
			}
			if tNear > tFar {
				return false, 0, 0
			}
		}
	}

	return true, tNear, tFar
}

// ── Ray-Triangle intersection (Möller-Trumbore) ──

// RayTriangleIntersect returns true and the distance if the ray hits the triangle.
// Implements the standard Möller-Trumbore algorithm:
//   h = D × edge2, a = edge1 · h
//   u = (S · h) / a, v = (D · q) / a, t = (edge2 · q) / a
// where S = O - V0, q = S × edge1.
func RayTriangleIntersect(origin, dir mesh.Vec3, tri mesh.Triangle) (hit bool, t float64) {
	edge1 := mesh.Vec3{X: tri.V1.X - tri.V0.X, Y: tri.V1.Y - tri.V0.Y, Z: tri.V1.Z - tri.V0.Z}
	edge2 := mesh.Vec3{X: tri.V2.X - tri.V0.X, Y: tri.V2.Y - tri.V0.Y, Z: tri.V2.Z - tri.V0.Z}

	// h = D × edge2
	h := vec.Cross(dir, edge2)
	// a = edge1 · h
	a := vec.Dot(edge1, h)

	// If determinant is near zero, ray lies in plane of triangle
	if math.Abs(a) < Epsilon {
		return false, 0
	}

	f := 1.0 / a

	// S = O - V0
	s := vec.Sub(origin, tri.V0)

	// u = (S · h) / a
	u := vec.Dot(s, h) * f
	if u < 0 || u > 1 {
		return false, 0
	}

	// q = S × edge1
	q := vec.Cross(s, edge1)

	// v = (D · q) / a
	v := vec.Dot(dir, q) * f
	if v < 0 || u+v > 1 {
		return false, 0
	}

	// t = (edge2 · q) / a
	t = vec.Dot(edge2, q) * f

	if t < Epsilon {
		return false, 0
	}

	return true, t
}

// ── BVH traversal ──

// Intersect finds the nearest intersection of a ray with the BVH.
// Returns the distance and triangle index, or false if no hit.
func (bvh *BVH) Intersect(origin, dir mesh.Vec3) (hit bool, t float64, triIndex int) {
	t = 1e30
	triIndex = -1
	_intersectNode(bvh.Root, origin, dir, &t, &triIndex, bvh.Triangles)
	if triIndex >= 0 {
		return true, t, triIndex
	}
	return false, t, triIndex
}

// _intersectNode recursively traverses the BVH.
func _intersectNode(node *Node, origin, dir mesh.Vec3, bestT *float64, bestIdx *int, tris []mesh.Triangle) {
	// Check AABB
	hit, tNear, _ := RayAABBIntersect(origin, dir, node.Bounds)
	if !hit || tNear > *bestT {
		return
	}

	// Leaf: check all triangles
	if node.Left == nil && node.Right == nil {
		for i := node.TriStart; i < node.TriEnd; i++ {
			h, t := RayTriangleIntersect(origin, dir, tris[i])
			if h && t < *bestT && t > Epsilon {
				*bestT = t
				*bestIdx = i
			}
		}
		return
	}

	// Internal: recurse children (near first for efficiency)
	if node.Left != nil {
		_intersectNode(node.Left, origin, dir, bestT, bestIdx, tris)
	}
	if node.Right != nil {
		_intersectNode(node.Right, origin, dir, bestT, bestIdx, tris)
	}
}

// IntersectAll finds ALL intersections of a ray with the mesh (for penetration calculation).
// Returns sorted distances and triangle indices.
func (bvh *BVH) IntersectAll(origin, dir mesh.Vec3) (hits []float64, triIndices []int) {
	hits = make([]float64, 0, 64)
	triIndices = make([]int, 0, 64)
	_intersectAllNode(bvh.Root, origin, dir, &hits, &triIndices, bvh.Triangles)

	// Sort by distance (callers expect sorted results; triIndices left unsorted — unused)
	if len(hits) > 1 {
		sort.Float64s(hits)
	}
	return
}

func _intersectAllNode(node *Node, origin, dir mesh.Vec3, hits *[]float64, triIndices *[]int, tris []mesh.Triangle) {
	hit, _, tFar := RayAABBIntersect(origin, dir, node.Bounds)
	if !hit {
		return
	}

	// Early exit if all intersections behind the ray
	if tFar < 0 {
		return
	}

	// Leaf: collect all intersections
	if node.Left == nil && node.Right == nil {
		for i := node.TriStart; i < node.TriEnd; i++ {
			h, t := RayTriangleIntersect(origin, dir, tris[i])
			if h && t > Epsilon {
				*hits = append(*hits, t)
				*triIndices = append(*triIndices, i)
			}
		}
		return
	}

	// Internal: recurse
	if node.Left != nil {
		_intersectAllNode(node.Left, origin, dir, hits, triIndices, tris)
	}
	if node.Right != nil {
		_intersectAllNode(node.Right, origin, dir, hits, triIndices, tris)
	}
}
