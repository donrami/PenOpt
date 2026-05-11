package app

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// MeshLoader handles mesh file loading and BVH building.
type MeshLoader struct {
	mu          sync.Mutex
	CurrentMesh *mesh.Mesh
	CurrentBVH  *bvh.BVH
}

// MeshInfo holds mesh metadata returned to the frontend.
type MeshInfo struct {
	Name           string  `json:"name"`
	NumTriangles   int     `json:"numTriangles"`
	NumVertices    int     `json:"numVertices"`
	IsWatertight   bool    `json:"isWatertight"`
	BoundaryEdges  int     `json:"boundaryEdges"`
	BoundsMinX     float64 `json:"boundsMinX"`
	BoundsMinY     float64 `json:"boundsMinY"`
	BoundsMinZ     float64 `json:"boundsMinZ"`
	BoundsMaxX     float64 `json:"boundsMaxX"`
	BoundsMaxY     float64 `json:"boundsMaxY"`
	BoundsMaxZ     float64 `json:"boundsMaxZ"`
	CenterX        float64 `json:"centerX"`
	CenterY        float64 `json:"centerY"`
	CenterZ        float64 `json:"centerZ"`
	ExtentX        float64 `json:"extentX"`
	ExtentY        float64 `json:"extentY"`
	ExtentZ        float64 `json:"extentZ"`
}

func NewMeshLoader() *MeshLoader {
	return &MeshLoader{}
}

func (ml *MeshLoader) LoadMesh(name string, data []byte) (*MeshInfo, error) {
	ml.mu.Lock()
	defer ml.mu.Unlock()

	var m *mesh.Mesh
	var err error
	if len(name) > 4 && name[len(name)-4:] == ".obj" {
		m, err = mesh.ParseOBJ(data)
	} else {
		m, err = mesh.ParseSTL(data)
	}
	if err != nil {
		return nil, fmt.Errorf("mesh parse error: %w", err)
	}
	return ml.setMesh(m, name), nil
}

func (ml *MeshLoader) PickAndLoad(ctx context.Context) (*MeshInfo, error) {
	path, err := runtime.OpenFileDialog(ctx, runtime.OpenDialogOptions{
		Title: "Select STL or OBJ file",
		Filters: []runtime.FileFilter{
			{DisplayName: "STL/OBJ Files (*.stl, *.obj)", Pattern: "*.stl;*.obj"},
		},
	})
	if err != nil {
		return nil, err
	}
	if path == "" {
		return nil, nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("file read error: %w", err)
	}

	_, name := filepath.Split(path)
	return ml.LoadMesh(name, data)
}

func (ml *MeshLoader) setMesh(m *mesh.Mesh, name string) *MeshInfo {
	m.CenterAtOrigin()
	bvhTree := bvh.Build(m)
	ml.CurrentMesh = m
	ml.CurrentBVH = bvhTree
	return meshToInfo(m, name)
}

func (ml *MeshLoader) GetInfo() *MeshInfo {
	ml.mu.Lock()
	defer ml.mu.Unlock()
	if ml.CurrentMesh == nil {
		return nil
	}
	return meshToInfo(ml.CurrentMesh, "")
}

func (ml *MeshLoader) GetVertexBuffer() []float64 {
	ml.mu.Lock()
	defer ml.mu.Unlock()
	if ml.CurrentMesh == nil {
		return nil
	}
	return ml.CurrentMesh.VertexBuffer()
}

// Lock/Unlock for callers that need direct access to the BVH.
func (ml *MeshLoader) Lock()   { ml.mu.Lock() }
func (ml *MeshLoader) Unlock() { ml.mu.Unlock() }

func meshToInfo(m *mesh.Mesh, name string) *MeshInfo {
	wt, be := m.CheckWatertight()
	mc := m.Center()
	me := m.Extent()
	return &MeshInfo{
		Name:          name,
		NumTriangles:  m.NumTris,
		NumVertices:   m.NumVerts,
		IsWatertight:  wt,
		BoundaryEdges: be,
		BoundsMinX: m.Min.X, BoundsMinY: m.Min.Y, BoundsMinZ: m.Min.Z,
		BoundsMaxX: m.Max.X, BoundsMaxY: m.Max.Y, BoundsMaxZ: m.Max.Z,
		CenterX: mc.X, CenterY: mc.Y, CenterZ: mc.Z,
		ExtentX: me.X, ExtentY: me.Y, ExtentZ: me.Z,
	}
}
