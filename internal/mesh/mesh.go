// Package mesh provides data structures and parsers for 3D triangle meshes (STL/OBJ).
package mesh

import (
	"fmt"
)

// Vec3 is a 3D vector.
type Vec3 struct {
	X, Y, Z float64
}

// Triangle represents a single triangle with three vertices and a face normal.
type Triangle struct {
	V0, V1, V2 Vec3
	Normal     Vec3
}

// Mesh holds a collection of triangles plus metadata.
type Mesh struct {
	Triangles  []Triangle
	NumVerts   int
	NumTris    int
	HasNormals bool
	// Bounding box (computed on load)
	Min, Max Vec3
}

// NewMesh creates an empty mesh.
func NewMesh() *Mesh {
	return &Mesh{
		Triangles:  make([]Triangle, 0),
		Min:        Vec3{1e30, 1e30, 1e30},
		Max:        Vec3{-1e30, -1e30, -1e30},
	}
}

// AddTriangle adds a triangle and expands the bounding box.
func (m *Mesh) AddTriangle(t Triangle) {
	m.Triangles = append(m.Triangles, t)
	// Expand bounding box
	for _, v := range []Vec3{t.V0, t.V1, t.V2} {
		if v.X < m.Min.X {
			m.Min.X = v.X
		}
		if v.Y < m.Min.Y {
			m.Min.Y = v.Y
		}
		if v.Z < m.Min.Z {
			m.Min.Z = v.Z
		}
		if v.X > m.Max.X {
			m.Max.X = v.X
		}
		if v.Y > m.Max.Y {
			m.Max.Y = v.Y
		}
		if v.Z > m.Max.Z {
			m.Max.Z = v.Z
		}
	}
	m.NumTris = len(m.Triangles)
	m.NumVerts = m.NumTris * 3
}

// Center returns the center of the bounding box.
func (m *Mesh) Center() Vec3 {
	return Vec3{
		X: (m.Min.X + m.Max.X) / 2,
		Y: (m.Min.Y + m.Max.Y) / 2,
		Z: (m.Min.Z + m.Max.Z) / 2,
	}
}

// Extent returns the bounding box extent (half-size).
func (m *Mesh) Extent() Vec3 {
	return Vec3{
		X: (m.Max.X - m.Min.X) / 2,
		Y: (m.Max.Y - m.Min.Y) / 2,
		Z: (m.Max.Z - m.Min.Z) / 2,
	}
}

// VertexBuffer returns flat float64 array [x0,y0,z0, x1,y1,z1, ...] for all vertices.
func (m *Mesh) VertexBuffer() []float64 {
	buf := make([]float64, 0, m.NumTris*9)
	for _, tri := range m.Triangles {
		buf = append(buf, tri.V0.X, tri.V0.Y, tri.V0.Z)
		buf = append(buf, tri.V1.X, tri.V1.Y, tri.V1.Z)
		buf = append(buf, tri.V2.X, tri.V2.Y, tri.V2.Z)
	}
	return buf
}

// IndexBuffer returns triangle indices [0,1,2, 3,4,5, ...].
func (m *Mesh) IndexBuffer() []uint32 {
	buf := make([]uint32, m.NumTris*3)
	for i := range m.NumTris {
		base := i * 3
		buf[base] = uint32(base)
		buf[base+1] = uint32(base + 1)
		buf[base+2] = uint32(base + 2)
	}
	return buf
}

// CheckWatertight checks whether the mesh is watertight by counting boundary edges.
// A watertight mesh has no edges belonging to only one triangle (no open edges).
// Returns true if watertight, plus the number of boundary edges found.
func (m *Mesh) CheckWatertight() (bool, int) {
	if m.NumTris == 0 {
		return false, 0
	}

	// Deduplicate vertices by rounding to 4 decimal places
	vertMap := make(map[string]int)
	dupIdx := make([]int, 0, m.NumTris*3)

	for _, tri := range m.Triangles {
		for _, v := range []Vec3{tri.V0, tri.V1, tri.V2} {
			key := fmt.Sprintf("%.4f,%.4f,%.4f", v.X, v.Y, v.Z)
			if idx, ok := vertMap[key]; ok {
				dupIdx = append(dupIdx, idx)
			} else {
				idx = len(vertMap)
				vertMap[key] = idx
				dupIdx = append(dupIdx, idx)
			}
		}
	}

	// Build edge map: count occurrences of each unique edge
	edgeMap := make(map[[2]int]int)
	for i := 0; i < m.NumTris; i++ {
		base := i * 3
		a, b, c := dupIdx[base], dupIdx[base+1], dupIdx[base+2]
		edges := [3][2]int{
			{min(a, b), max(a, b)},
			{min(b, c), max(b, c)},
			{min(c, a), max(c, a)},
		}
		for _, e := range edges {
			edgeMap[e]++
		}
	}

	// Count boundary edges (edges with count == 1)
	boundary := 0
	for _, count := range edgeMap {
		if count == 1 {
			boundary++
		}
	}

	return boundary == 0, boundary
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// CenterAtOrigin translates all vertices so the mesh bounding box is centered
// at the origin. This is important because the ray caster assumes the mesh is
// centered at the origin, as does the Three.js viewer.
func (m *Mesh) CenterAtOrigin() {
	c := m.Center()
	for i := range m.Triangles {
		m.Triangles[i].V0.X -= c.X
		m.Triangles[i].V0.Y -= c.Y
		m.Triangles[i].V0.Z -= c.Z
		m.Triangles[i].V1.X -= c.X
		m.Triangles[i].V1.Y -= c.Y
		m.Triangles[i].V1.Z -= c.Z
		m.Triangles[i].V2.X -= c.X
		m.Triangles[i].V2.Y -= c.Y
		m.Triangles[i].V2.Z -= c.Z
	}
	// Update bounding box
	m.Min.X -= c.X
	m.Min.Y -= c.Y
	m.Min.Z -= c.Z
	m.Max.X -= c.X
	m.Max.Y -= c.Y
	m.Max.Z -= c.Z
}

// String returns a summary string.
func (m *Mesh) String() string {
	return fmt.Sprintf("Mesh{%d tris, bounds:[%.1f,%.1f,%.1f]→[%.1f,%.1f,%.1f]}",
		m.NumTris,
		m.Min.X, m.Min.Y, m.Min.Z,
		m.Max.X, m.Max.Y, m.Max.Z,
	)
}
