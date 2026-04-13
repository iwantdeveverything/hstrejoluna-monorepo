# Proposal: LinkedIn Certificates Sync

## Intent

Agregar una seccion de certificados en el portfolio alimentada con datos de LinkedIn via Apify, evitando acoplar scraping al frontend. El objetivo es mostrar credenciales actualizadas desde una fuente automatizable y controlada por CMS.

## Scope

### In Scope
- Definir modelo `certificate` en Sanity Studio y registrarlo en `schemaTypes`.
- Implementar ingesta backend desde Apify (`dev_fusion/linkedin-profile-scraper`) hacia Sanity con upsert.
- Exponer y renderizar certificados en una nueva seccion del stream (`certificates`) y su navegacion.
- Instalar y configurar infraestructura formal de testing para `apps/portfolio` (unit/integration) con comandos reproducibles.

### Out of Scope
- Sincronizacion en tiempo real con LinkedIn.
- Panel de administracion custom fuera de Sanity.
- Integraciones adicionales (badges, cursos, credly, etc.).

## Capabilities

### New Capabilities
- `linkedin-certificates-ingestion`: obtener `certifications[]` desde Apify y normalizar/upsert en Sanity.
- `portfolio-certificates-section`: visualizar certificados en el portfolio con enlaces a credencial original.
- `portfolio-testing-foundation`: establecer test runner, configuracion y pruebas base para flujo de certificados.

### Modified Capabilities
- None.

## Approach

Implementar un flujo server-side: ejecutar actor de Apify con `profileUrls`, leer dataset, mapear certificados y persistirlos en Sanity. El frontend continuara leyendo solo Sanity (no Apify directo). Se agregara `certificates` a `ObsidianStream` y a los componentes de navegacion por seccion.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/studio/schemaTypes/certificate.ts` | New | Nuevo schema de certificados (issuer, fechas, url, credentialId). |
| `apps/studio/schemaTypes/index.ts` | Modified | Registrar nuevo tipo `certificate`. |
| `apps/portfolio/types/sanity.ts` | Modified | Agregar interfaz `Certificate`. |
| `apps/portfolio/app/page.tsx` | Modified | Query de certificados y prop drilling al stream. |
| `apps/portfolio/components/ObsidianStream.tsx` | Modified | Nueva seccion `certificates` + section IDs. |
| `apps/portfolio/components/ui/CommandNav.tsx` | Modified | Incluir item/estado para `certificates`. |
| `apps/portfolio/components/fragments/CertificatesOverview.tsx` | New | Vista principal de certificados. |
| `apps/portfolio/lib/*` | Modified/New | Servicio de sync Apify->Sanity y utilidades de mapeo. |
| `apps/portfolio/vitest.config.ts` | New | Configuracion del runner de tests para entorno React/Next. |
| `apps/portfolio/test/setup.ts` | New | Setup compartido de pruebas (matchers, mocks base). |
| `apps/portfolio/package.json` | Modified | Scripts de test y dependencias de testing. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cambios en payload del actor community | Med | Validacion defensiva + fallback a campos opcionales. |
| Rate limits/costo de Apify | Med | Ejecucion programada (manual/cron) y batch controlado. |
| Seccion vacia en UI | Low | Empty state explicito con CTA a LinkedIn. |

## Rollback Plan

Desactivar job/endpoint de sync, remover `certificates` de navegacion y stream, y mantener datos en Sanity sin borrarlos. Si hay fallo severo, revertir commit de integracion y restaurar version previa del portfolio.

## Dependencies

- `apify-client` en entorno server.
- Variables de entorno: `APIFY_TOKEN`, `LINKEDIN_PROFILE_URL`.
- Credenciales de escritura a Sanity para upsert.
- Herramientas de test: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.

## Success Criteria

- [ ] Al ejecutar sync, se crean/actualizan certificados en Sanity sin duplicados.
- [ ] El portfolio muestra la seccion `certificates` con enlaces validos.
- [ ] Si no hay certificados, se renderiza empty state sin romper navegacion.
- [ ] Existe comando de test automatizado ejecutable en CI/local para la nueva logica de certificados.
