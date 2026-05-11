# ADR-0001: App struct decomposed into focused adapters

The App god struct was split into four adapters under internal/app/
(MeshLoader, Optimizer, PhysicsAPI, ScannerAPI) to improve testability
and locality. Each adapter has a narrower interface than the original
App struct. App itself becomes a thin composition layer that delegates
to these adapters.

Status: accepted
