package mesh

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"fmt"
	"math"
	"strconv"
	"strings"
)

// ParseSTL parses STL data (binary or ASCII) and returns a Mesh.
func ParseSTL(data []byte) (*Mesh, error) {
	if len(data) < 84 {
		return nil, fmt.Errorf("STL file too short: %d bytes", len(data))
	}
	// Detect binary vs ASCII: binary header starts with solid? or look at size
	header := string(data[:80])
	isASCII := strings.HasPrefix(strings.TrimSpace(header), "solid") &&
		bytes.Contains(data[:200], []byte("facet"))

	if isASCII {
		return parseSTL_ASCII(data)
	}
	return parseSTL_Binary(data)
}

// parseSTL_Binary parses a binary STL file.
// Format: 80-byte header, 4-byte triangle count, then 50-byte triangles
// (12 bytes normal, 36 bytes vertices, 2 bytes attribute).
func parseSTL_Binary(data []byte) (*Mesh, error) {
	if len(data) < 84 {
		return nil, fmt.Errorf("binary STL too short: %d bytes", len(data))
	}

	numTris := int(binary.LittleEndian.Uint32(data[80:84]))
	expected := 84 + numTris*50
	if len(data) < expected {
		return nil, fmt.Errorf("binary STL truncated: have %d, need %d bytes for %d triangles",
			len(data), expected, numTris)
	}

	m := NewMesh()
	offset := 84
	for range numTris {
		if offset+50 > len(data) {
			break
		}
		// Read normal
		nx := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset:])))
		ny := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+4:])))
		nz := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+8:])))
		// Read vertices
		v0x := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+12:])))
		v0y := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+16:])))
		v0z := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+20:])))
		v1x := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+24:])))
		v1y := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+28:])))
		v1z := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+32:])))
		v2x := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+36:])))
		v2y := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+40:])))
		v2z := float64(math.Float32frombits(binary.LittleEndian.Uint32(data[offset+44:])))

		tri := Triangle{
			V0: Vec3{v0x, v0y, v0z},
			V1: Vec3{v1x, v1y, v1z},
			V2: Vec3{v2x, v2y, v2z},
		}

		// Normalize normal (STL normals can be zero)
		lenN := math.Sqrt(nx*nx + ny*ny + nz*nz)
		if lenN > 0 {
			tri.Normal = Vec3{nx / lenN, ny / lenN, nz / lenN}
		} else {
			// Compute face normal from vertices
			tri.Normal = computeNormal(tri.V0, tri.V1, tri.V2)
		}

		m.AddTriangle(tri)
		offset += 50
	}

	return m, nil
}

// parseSTL_ASCII parses an ASCII STL file.
func parseSTL_ASCII(data []byte) (*Mesh, error) {
	m := NewMesh()
	scanner := bufio.NewScanner(bytes.NewReader(data))
	var currentVerts []Vec3
	var currentNormal Vec3

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		fields := strings.Fields(line)
		if len(fields) == 0 {
			continue
		}

		switch fields[0] {
		case "facet":
			// facet normal nx ny nz
			if len(fields) >= 5 {
				nx, _ := strconv.ParseFloat(fields[2], 64)
				ny, _ := strconv.ParseFloat(fields[3], 64)
				nz, _ := strconv.ParseFloat(fields[4], 64)
				currentNormal = Vec3{nx, ny, nz}
			}
			currentVerts = nil
		case "vertex":
			if len(fields) >= 4 {
				x, _ := strconv.ParseFloat(fields[1], 64)
				y, _ := strconv.ParseFloat(fields[2], 64)
				z, _ := strconv.ParseFloat(fields[3], 64)
				currentVerts = append(currentVerts, Vec3{x, y, z})
			}
		case "endfacet":
			if len(currentVerts) == 3 {
				tri := Triangle{
					V0: currentVerts[0],
					V1: currentVerts[1],
					V2: currentVerts[2],
					Normal: currentNormal,
				}
				// Ensure normal
				if currentNormal.X == 0 && currentNormal.Y == 0 && currentNormal.Z == 0 {
					tri.Normal = computeNormal(tri.V0, tri.V1, tri.V2)
				}
				m.AddTriangle(tri)
			}
			currentVerts = nil
			currentNormal = Vec3{}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("STL ASCII parse error: %w", err)
	}

	if m.NumTris == 0 {
		return nil, fmt.Errorf("no triangles found in STL file")
	}

	return m, nil
}

// computeNormal computes the face normal of a triangle via cross product.
func computeNormal(v0, v1, v2 Vec3) Vec3 {
	edge1 := Vec3{v1.X - v0.X, v1.Y - v0.Y, v1.Z - v0.Z}
	edge2 := Vec3{v2.X - v0.X, v2.Y - v0.Y, v2.Z - v0.Z}
	nx := edge1.Y*edge2.Z - edge1.Z*edge2.Y
	ny := edge1.Z*edge2.X - edge1.X*edge2.Z
	nz := edge1.X*edge2.Y - edge1.Y*edge2.X
	lenN := math.Sqrt(nx*nx + ny*ny + nz*nz)
	if lenN > 0 {
		return Vec3{nx / lenN, ny / lenN, nz / lenN}
	}
	return Vec3{}
}
