# sap-b1-marketplace

Marketplace de plugins para trabajar con SAP Business One. Lo usan desarrolladores de B1. Por ahora se centra en Service Layer. El vocabulario esta en [CONTEXT.md](CONTEXT.md) y las decisiones en [docs/adr/](docs/adr/).

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
6. Los plugins se instalan con `npx`. Cada release nueva de B1 se incorpora actualizando la documentacion y la lista de versiones soportadas.

## Pendiente de definir

- Formato de la cache de metadatos.
- Herramientas del servidor MCP.
- Sesion y relogin, errores, paginacion y `$batch`.
- Skill de guia de `use-service-layer`.
- Formato de las marcas de version en la documentacion (se define al crear la skill).
- Generacion de las marcas de version: se hara al crear la skill, comparando el changelog y los PDF de cada version.
