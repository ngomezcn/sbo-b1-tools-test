# sap-b1-marketplace

Marketplace de plugins para trabajar con SAP Business One. Se instala por plugin: cada persona instala solo lo que necesita.

## Convencion de nombres

- `use-<sistema>`: conector que ejecuta (servidor MCP + skill corta de guia y seguridad).
- `docs-<sistema>[-<version>]`: solo conocimiento (skills, sin codigo ni conector).

## Plugins

| Plugin | Tipo | Estado |
|---|---|---|
| use-service-layer | conector | esqueleto |
| use-b1-sql | conector (solo lectura) | esqueleto |
| use-api-gateway | conector | por definir |
| docs-service-layer-10 | docs | esqueleto |
| docs-b1-database-10 | docs | esqueleto |
| docs-api-gateway | docs | esqueleto |

## Principios

1. Los `use-*` no contienen conocimiento de entidades ni de endpoints. Construyen su propio cache de metadatos.
2. Los `docs-*` no contienen codigo ni conexion.
3. Sin dependencias duras entre plugins.
4. Solo lectura por defecto. Escribir exige activarlo explicitamente y confirmar.
5. Las credenciales nunca van en el repo: variables de entorno o archivo local ignorado por git.
6. Las skills `use-*` se invocan a mano (`/use-service-layer ...`).
7. Consultar datos: SQL. Crear o modificar: Service Layer.
8. Instala un solo plugin de docs por sistema, el que corresponde a tu version.
