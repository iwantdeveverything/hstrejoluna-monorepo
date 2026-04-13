# Design: LinkedIn Certificates Sync

## Technical Approach

Implementar una capa server-side de ingestion (`Apify -> normalize -> Sanity upsert`) y mantener el frontend desacoplado consumiendo solo Sanity. El stream del portfolio se extiende con una nueva seccion `certificates` integrada al tracking de secciones existente.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|----------|--------|--------------------------|-----------|
| Source of truth | Sanity `certificate` documents | Render directo desde Apify en runtime | Mantiene performance estable, cacheable y control editorial. |
| Execution boundary | Sync via server route handler protegido | Ejecutar desde cliente o build-time scraping | Evita exponer token Apify y permite retries/control operacional. |
| Identity strategy | Upsert por `credentialId`; fallback `name+issuer` normalizado | Insert-only sin key | Evita duplicados entre corridas y soporta updates incrementales. |
| Navigation integration | Extender `sectionIds` y `CommandNav` existentes | Nuevo sistema de navegación | Minimiza cambios y sigue patrón actual del stream. |
| Testing baseline | Vitest + Testing Library + jsdom en `apps/portfolio` | Solo QA manual | Formaliza validacion automatizada local/CI para logica y UI del cambio. |

## Data Flow

`Cron/Manual trigger` -> `Route handler (/api/.../sync-certificates)` -> `Apify actor run` -> `Dataset items` -> `normalizeCertificates()` -> `Sanity upsert` -> `Portfolio page GROQ fetch` -> `ObsidianStream` -> `CertificatesOverview`

Error flow:
- Apify failure -> structured error response, no writes.
- Invalid entries -> skipped with warning count; valid entries continue.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/studio/schemaTypes/certificate.ts` | Create | Schema de certificados (name, issuer, issueDate, expiryDate, credentialId, credentialUrl, source). |
| `apps/studio/schemaTypes/index.ts` | Modify | Registrar `certificate` en `schemaTypes`. |
| `apps/portfolio/types/sanity.ts` | Modify | Definir interface `Certificate`. |
| `apps/portfolio/app/page.tsx` | Modify | Agregar query de certificados en `Promise.all` y pasar prop a stream. |
| `apps/portfolio/components/ObsidianStream.tsx` | Modify | Incluir `certificates` en props, `sectionIds` y nuevo `<section id="certificates">`. |
| `apps/portfolio/components/fragments/CertificatesOverview.tsx` | Create | Render de tarjetas/lista + empty state. |
| `apps/portfolio/components/ui/CommandNav.tsx` | Modify | Agregar estado, label e item de ancla `certificates`. |
| `apps/portfolio/lib/certificates/apify.ts` | Create | Cliente Apify y `runLinkedinCertificatesActor()`. |
| `apps/portfolio/lib/certificates/normalize.ts` | Create | Mapper defensivo de payload Apify -> `CertificateInput`. |
| `apps/portfolio/lib/certificates/sanity-upsert.ts` | Create | Persistencia idempotente en Sanity. |
| `apps/portfolio/app/api/admin/sync-certificates/route.ts` | Create | Endpoint POST protegido (header secret) para disparar sync. |
| `apps/portfolio/vitest.config.ts` | Create | Config de Vitest para entorno jsdom y setup compartido. |
| `apps/portfolio/test/setup.ts` | Create | Inicializacion de matchers y mocks comunes para pruebas React. |
| `apps/portfolio/lib/certificates/normalize.test.ts` | Create | Tests unitarios de mapeo/idempotencia de certificados. |
| `apps/portfolio/components/fragments/CertificatesOverview.test.tsx` | Create | Tests de render y empty state de la nueva seccion. |
| `apps/portfolio/package.json` | Modify | Scripts `test`/`test:watch` y dependencias formales de testing. |

## Interfaces / Contracts

```ts
export interface Certificate {
  _id: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  source: "linkedin";
}

export interface SyncCertificatesResult {
  fetched: number;
  upserted: number;
  skipped: number;
  warnings: string[];
}
```

Route contract:
- `POST /api/admin/sync-certificates`
- Auth: `x-sync-secret` must match env `SYNC_CERTIFICATES_SECRET`
- Response: `200` with `SyncCertificatesResult`; `4xx/5xx` with structured error payload.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Normalization and identity key generation | Vitest unit suites for mapper outputs, fallback keys, invalid payload handling. |
| Integration | Route handler calling Apify + Sanity adapters | Vitest + mocked adapters to assert status codes, write behavior and error paths. |
| E2E | Certificates visible in stream and navigation anchors | Manual QA inicial; opcional Playwright en fase posterior si se requiere browser automation. |

## Migration / Rollout

No migration required. Rollout incremental:
1. Deploy schema + frontend empty-state support.
2. Configure env vars/secrets.
3. Trigger first sync manually.
4. Optional cron schedule after validating payload quality.

## Open Questions

- [ ] Definir frecuencia final de sync (manual only vs cron diario).
- [ ] Confirmar campos exactos del actor a persistir para minimizar ruido.
