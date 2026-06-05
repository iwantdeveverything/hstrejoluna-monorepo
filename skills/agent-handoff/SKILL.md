---
name: agent-handoff
description: "Trigger: switching agents, token limit reached, brinco de agente, gemini-cli to claude-code. Reconstruye contexto y ciclos SDD usando Engram y OpenSpec."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.1"
---

## Activation Contract

Usa este skill cuando el usuario indique cambio de agente (Copilot, Claude Code, Gemini CLI, OpenCode) por límite de tokens o rotación. El objetivo es "aterrizar" en el estado exacto del agente anterior sin fricción.

## Hard Rules

- **Engram es la Verdad**: Antes de preguntar al usuario, busca el último `session_summary` y el estado SDD en Engram.
- **SDD First**: Si hay un ciclo SDD activo (detectado en Engram o `openspec/changes/`), recupera la fase actual (`propose`, `spec`, `apply`, etc.) y sus artefactos.
- **Git Status**: Reporta siempre `git status -sb` y `git diff HEAD` (resumido) para detectar cambios volátiles no guardados.
- **No cambios destructivos**: No hagas `git checkout` ni `git reset` sin permiso explícito tras el reporte.

## Decision Gates

| Hallazgo | Acción |
| --- | --- |
| `session_summary` reciente (< 2h) | Cárgalo automáticamente y resume logros/pendientes. |
| SDD `apply` en curso | Busca `apply-progress` en Engram; si falta, reconstruye vía `git diff`. |
| Working tree sucio vs Commits | Si hay cambios sin commit, prioriza el análisis del diff sobre el último commit. |

## Execution Steps

1. **Estado Git**: `git status -sb` + `git log -n 3`. Detectar rama y cercanía al origen.
2. **Contexto Engram**:
   - `mem_context()` para últimas sesiones.
   - `mem_search(query: "sdd/{change}/state")` para el progreso del cambio activo.
   - `mem_get_observation()` de los IDs relevantes (resúmenes y estados).
3. **OpenSpec Sync**: Si el modo es `hybrid` o `openspec`, lee el `state.yaml` del cambio activo en `openspec/changes/`.
4. **Verificación de Tests**: Si `strict_tdd` está activo (ver `sdd-init` memory), verifica el estado de la última ejecución de tests si está disponible en logs.
5. **Síntesis Handoff**: Presenta:
   - Rama + Cambios locales.
   - Último hito SDD (ej: "Phase: apply - 3/5 tasks done").
   - "Donde lo dejamos": Puntos clave del `session_summary` anterior.
6. **Next Action**: Pregunta confirmación para continuar la fase SDD o el hilo de trabajo actual.

## Output Contract

Resumen estructurado: **Repo State**, **SDD Phase/Progress**, **Context Recovery (from Engram)**, y **Next Steps**.

## References

- `AGENTS.md`
- `docs/standards/gitflow-semver-github-mcp.md`
- `openspec/config.yaml`
- `MEMORY.md` (private project memory)
