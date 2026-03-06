# Repotype Roadmap

## Near Term

- Expand built-in rule packs for common repo archetypes
- Add richer diagnostics classification and suppression policies
- Add CI helpers for common providers

## Runtime Portability

Node/TypeScript is the canonical implementation for v1.

Future runtime ports (demand-driven):

- Python client + service wrapper
- Go single-binary validator (spec-compatible)
- Container-first runtime image for language-agnostic pipelines

When requesting ports, file a roadmap issue with:

- target runtime (`python`, `go`, `rust`, etc.)
- expected deployment environment
- required feature parity level
- compatibility constraints with `repotype.yaml`

## Out of Scope (for now)

- Full AST/language-specific static analysis
- Policy language extensions beyond v1 schema model
