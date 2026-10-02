# sbo-b1-tools (fabrica)

Fabrica del producto instalable `sbo-skills` (submodulo en `sbo-skills/`), plugins para trabajar con SAP Business One. Lo usan desarrolladores de B1. Por ahora se centra en Service Layer. El vocabulario esta en [CONTEXT.md](CONTEXT.md) y las decisiones en [docs/adr/](docs/adr/).

## Convencion de nombres

- `setup-<sistema>`: plugin de configuracion. Prepara `.sbo-b1/<sistema>/` con un script: version de B1, credenciales y cache de metadatos de cada entorno.
- `use-<sistema>`: plugin de uso. Ejecuta (servidor MCP + skill de guia). Al instalarlo se instalan tambien su `setup-` y su `docs-`.
- `docs-<sistema>`: plugin de documentacion, unico y global para todas las versiones de B1. Solo conocimiento, sin codigo ni conexion, y se puede consultar sin el `use-` (necesita el Setup). Marca las secciones no disponibles para ciertas versiones.

## Principios

1. Los `use-*` no contienen conocimiento de entidades ni de endpoints. Construyen su cache de metadatos con el Setup.
2. Los `docs-*` no contienen codigo ni conexion.
3. Un `use-*` necesita su `docs-*` y su `setup-*`, y se instalan siempre con el. El Setup pregunta la version de B1 (una por sistema, igual en todos sus entornos, guardada en `.sbo-b1/<sistema>/config.md`) y la IA la comprueba contra las marcas de la documentacion. Un `docs-*` tambien necesita el Setup hecho (si falta, da error y pide ejecutarlo), pero no necesita ningun `use-*`. Cada ejecucion del Setup limpia lo anterior y empieza de cero.
4. Las escrituras (POST, PATCH, DELETE) piden confirmacion. La Autoridad total la concede el desarrollador y dura una sesion.
5. Credenciales y metadatos viven en `.sbo-b1/<sistema>/<entorno>/` (entornos dev, uat, prod), dentro del repo y ignorados por git. La version de B1 de cada sistema vive en `.sbo-b1/<sistema>/config.md`. Los sistemas no comprueban entre si sus versiones.
6. Los plugins se instalan con el marketplace de Claude Code o con `npx sbo-skills` (paquete npm propio, pendiente). Cada release nueva de B1 se incorpora actualizando la documentacion y la lista de versiones soportadas.

## Pendiente de definir

- Formato de la cache de metadatos.
- Herramientas del servidor MCP.
- Sesion y relogin, errores, paginacion y `$batch`.
- Skill de guia de `use-service-layer`.
- Formato de las marcas de version en la documentacion (se define al crear la skill).
- Generacion de las marcas de version: se hara al crear la skill, comparando el changelog y los PDF de cada version.
- Sesion de grilling sobre patrones de integracion SBO con sistemas externos (CRM, e-commerce, middleware): concurrencia con ETag, `$batch`, paginacion, webhooks y sincronizacion incremental. Parte de `reference/etag/etag-guide.md` y de las pruebas de ETag en SL 1000340 (2026-10-02).
- Skill de construccion `build-docs-from-odata` (ADR 0007): fuentes spec OASIS OData V4.01 (Part 1 y 2) y la parte "Learn" de la documentacion de Microsoft (repo MicrosoftDocs/OData-docs, CC-BY-4.0), solo lo que interesa al consumidor de Service Layer, sin imagenes ni enlaces, con atribucion en el frontmatter. Incluye script de extraccion determinista, `PROGRESS.md` y prompt de arranque.
- Decidir si OData necesita un plugin `docs-` propio si llega a reutilizarse fuera de Service Layer (revisar entonces el ADR 0004: un `docs-` exige Setup y version de B1).
- Pruebas de ETag no hechas: UDFs, `$expand` en colecciones (cabecera), `If-Match` en acciones con valores mal formados, DELETE sin `If-Match`, sincronizacion incremental por ETag. La entidad de prueba `ZZETAGBP2` sigue en `SBODemoES` (tiene documentos, no se pudo borrar).

## Estructura

- `factory/`: `packages/` (codigo TS compartido), `plugins-src/` (fuente de setup y use), `scripts/`, `docs-src/`.
- `sources/`: PDFs fuente de SAP y `manifest.json`. Este repo no debe ser publico.
- `.claude/skills/build-*`: skills de construccion propias.
- `sbo-skills/`: producto instalable (submodulo).
