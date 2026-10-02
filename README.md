# sbo-b1-tools (fabrica)

Fabrica del producto instalable `sbo-skills` (submodulo en `sbo-skills/`), plugins para trabajar con SAP Business One. Lo usan desarrolladores de B1. Por ahora se centra en Service Layer. El vocabulario esta en [CONTEXT.md](CONTEXT.md) y las decisiones en [docs/adr/](docs/adr/).

## Convencion de nombres

Cada sistema es un unico plugin (`<sistema>`, por ejemplo `service-layer`) que se instala completo (ADR 0010) y tiene tres partes:

- `setup`: prepara `.sbo-skills/<sistema>/` con un script: version de B1, Version de OData, credenciales de cada entorno y prueba obligatoria del login.
- `use`: ejecuta contra el sistema (script compilado con comandos; las credenciales no pasan por el contexto de la IA). Las escrituras son en seco por defecto (ADR 0008).
- `docs`: documentacion unica y global para todas las versiones de B1. Solo conocimiento. Marca las secciones no disponibles para ciertas versiones.

## Principios

1. El `use` no contiene conocimiento de entidades ni de endpoints. Construye el contexto de objeto de cada entidad bajo demanda.
2. El `docs` no contiene codigo ni conexion.
3. El plugin se instala completo. El Setup pregunta la version de B1 (una por sistema, igual en todos sus entornos, guardada en `.sbo-skills/<sistema>/config.md`) y la IA la compara con la ultima version documentada y, si es anterior, consulta `availability.md` (secciones enteras no disponibles, ADR 0011). `use` y `docs` dan error si falta el Setup. Cada ejecucion del Setup limpia lo anterior y empieza de cero.
4. Las escrituras (POST, PATCH, DELETE) son en seco por defecto; la IA ejecuta con `--execute` tras la aprobacion del desarrollador. La Autoridad total la concede el desarrollador y dura una sesion.
5. Credenciales y contexto de objeto viven en `.sbo-skills/<sistema>/<entorno>/` (entornos dev, uat, prod), dentro del repo y ignorados por git. La version de B1 y la Version de OData de cada sistema viven en `.sbo-skills/<sistema>/config.md`. Los sistemas no comprueban entre si sus versiones. No se valida el certificado TLS (ADR 0009).
6. Los plugins se instalan con el marketplace de Claude Code o con `npx sbo-skills` (paquete npm propio, pendiente). Cada release nueva de B1 se incorpora actualizando la documentacion y la lista cerrada de versiones soportadas.
7. Las pruebas del Setup y del Uso se ejecutan contra un Service Layer real (sin falso). Lo no verificado queda como pendiente en `factory/plugins-src/service-layer/TESTING.md`.

## Pendiente de definir

- Sesion y relogin, errores, paginacion y `$batch`.

## Estructura

- `factory/`: `plugins-src/` (fuente TS de setup y use, con su codigo comun), `scripts/` (Python de extraccion y verificacion), `docs-src/` (fuente de la documentacion; incluye el seguimiento de las skills `build-*`).
- `docs/`: `adr/`, `agents/` (config de skills) y `prompts/` (prompts puntuales reutilizables).
- `sources/`: PDF fuente de SAP (`service-layer/`). Este repo no debe ser publico.
- `.claude/skills/build-*`: skills de construccion propias.
- `sbo-skills/`: producto instalable (submodulo), un unico plugin `service-layer`. Su `dist/` y sus skills se generan con `npm run publish-plugin` en `factory/plugins-src/service-layer`; no se editan a mano.
