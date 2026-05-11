# Grozmani et al. 2019 — Measurement Uncertainty of X-ray CT as a Function of Part Orientation

## Reference

**Authors:** Natalia Grozmani, Andrea Buratti, Robert H. Schmitt (WZL, RWTH Aachen University)  
**Title:** *Investigating the influence of workpiece placement on the uncertainty of measurements in industrial computed tomography*  
**Venue:** 9th Conference on Industrial Computed Tomography (iCT 2019), Padova, Italy  
**URL:** https://www.ndt.net/article/ctc2019/papers/iCT2019_Full_paper_133.pdf

## Abstract

Industrial X-ray CT is a powerful technique for 3D reconstruction and dimensional measurement. The user choice of setup parameters constitutes the most subjective input to measurement uncertainty, and workpiece placement (orientation + source-object distance) is the trend-setting parameter that determines all subsequent settings. This paper presents a method for optimising workpiece placement for dimensional measurements of multi-material workpieces. The method works with the STL model of the workpiece and analytically tests the full placement range to find the placement that minimises the attenuation power. Validation via ANOVA on a multi-material workpiece demonstrated that the predicted orientation was optimal.

## Key Contributions & PenOpt Alignment

### 1. Measurement Uncertainty as a Function of Orientation (PenOpt: `f_uncertainty` in `objectives.go`)

The paper establishes that **face orientation relative to beam direction determines edge sharpness** and thus dimensional measurement uncertainty:

- Faces viewed **edge-on** (beam path tangent to the surface) produce the **sharpest edge gradients** in projection images
- Faces viewed **face-on** (beam path normal to the surface) produce **diffuse edges** with higher localisation uncertainty
- The optimal orientation minimises the number of faces with poor edge-on alignment

### 2. Objective Function Alignment (PenOpt: `internal/objectives/objectives.go`)

| PenOpt Objective | Paper Concept | Alignment |
|---|---|---|
| `f_uncertainty` — mean angle between face normal and nearest beam direction | Edge-on vs. face-on surface orientation | ✅ Directly derived from this work |
| `f_mtl` — generalized mean transmission | Attenuation power minimisation | ✅ Shared concept |
| `f_energy` — max transmission | Required photon energy / CNR | ✅ Shared concept |

### 3. Methodological Commonality

Both PenOpt and Grozmani 2019:
- Use STL mesh as input
- Evaluate candidate orientations analytically (no full simulation)
- Focus on geometric proxies rather than full reconstruction
- Target dimensional metrology applications

## Deviations from Paper

- The paper additionally optimises SOD (source-object distance); PenOpt treats SOD as a user-set scanner parameter
- The paper validates via physical CT scans and ANOVA; PenOpt currently has no experimental validation pipeline
- The paper uses CNR-based energy optimisation; PenOpt uses max-transmission-length surrogate
- The paper specifically targets multi-material workpieces; PenOpt is material-agnostic
