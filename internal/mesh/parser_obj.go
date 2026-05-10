package mesh

import (
	"bufio"
	"bytes"
	"fmt"
	"strconv"
	"strings"
)

// ParseOBJ parses Wavefront OBJ data and returns a Mesh.
// Handles v, f, vn, vt (vt ignored), and triangulates quads.
func ParseOBJ(data []byte) (*Mesh, error) {
	verts := make([]Vec3, 0, 1000)
	m := NewMesh()

	scanner := bufio.NewScanner(bytes.NewReader(data))
	lineNo := 0

	for scanner.Scan() {
		lineNo++
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		fields := strings.Fields(line)
		if len(fields) < 2 {
			continue
		}

		switch fields[0] {
		case "v":
			if len(fields) < 4 {
				continue
			}
			x, _ := strconv.ParseFloat(fields[1], 64)
			y, _ := strconv.ParseFloat(fields[2], 64)
			z, _ := strconv.ParseFloat(fields[3], 64)
			verts = append(verts, Vec3{x, y, z})

		case "f": // face: can be 3+ vertices, may have v/vt/vn format
			if len(fields) < 4 {
				continue
			}
			// Parse vertex indices (may be in format v/vt/vn or v//vn or just v)
			indices := make([]int, 0, len(fields)-1)
			for _, tok := range fields[1:] {
				parts := strings.Split(tok, "/")
				idx, err := strconv.Atoi(parts[0])
				if err != nil {
					continue
				}
				// OBJ indices are 1-based; negative = relative
				if idx > 0 {
					indices = append(indices, idx-1)
				} else if idx < 0 {
					indices = append(indices, len(verts)+idx)
				}
			}
			if len(indices) < 3 {
				continue
			}
			// Triangulate: fan triangulation for quads/polygons
			for i := 1; i < len(indices)-1; i++ {
				i0, i1, i2 := indices[0], indices[i], indices[i+1]
				if i0 >= len(verts) || i1 >= len(verts) || i2 >= len(verts) {
					continue
				}
				v0, v1, v2 := verts[i0], verts[i1], verts[i2]
				normal := computeNormal(v0, v1, v2)
				m.AddTriangle(Triangle{
					V0:     v0,
					V1:     v1,
					V2:     v2,
					Normal: normal,
				})
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("OBJ parse error at line %d: %w", lineNo, err)
	}

	if m.NumTris == 0 {
		return nil, fmt.Errorf("no triangles found in OBJ file (need 'v' and 'f' records)")
	}

	return m, nil
}


