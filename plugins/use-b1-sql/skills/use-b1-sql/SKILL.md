---
name: use-b1-sql
description: Ejecuta consultas SQL de solo lectura contra la base de datos de SAP B1 (HANA o SQL Server). Invocar manualmente con /use-b1-sql.
disable-model-invocation: true
---

# use-b1-sql

Punto de entrada manual para consultar la base de datos de SAP B1.

## Reglas
- Solo lectura, y real: la conexion usa un usuario de base de datos con permisos unicamente de SELECT.
- Una sola sentencia por llamada. Limite de filas y timeout.
- Nunca escribir datos por aqui. Para crear o modificar, usa `use-service-layer`.
- Cuidado con datos sensibles (salarios, datos personales, precios).

## Alcance
Solo SQL de lectura. Para estructura de tablas, usa `docs-b1-database-<version>` si esta instalado.

TODO: herramientas del servidor MCP y cache de esquema.
