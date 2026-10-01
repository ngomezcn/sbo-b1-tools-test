---
name: use-service-layer
description: Conecta con SAP B1 Service Layer y ejecuta consultas, depuracion o cambios (campos de usuario, tablas, UDOs). Invocar manualmente con /use-service-layer.
disable-model-invocation: true
---

# use-service-layer

Punto de entrada manual para trabajar contra un Service Layer de SAP B1.

## Antes de empezar
1. Comprueba que existe un perfil de conexion (host, puerto, base de datos, usuario). Si no, guia al usuario en la configuracion. La contrasena va en variable de entorno o archivo local, nunca en el chat.
2. Haz login y lee la version del servidor. Si hay una skill de docs de Service Layer disponible, consultala antes de construir una llamada. Si no hay, sugiere instalar la que corresponde a la version.
3. Usa el cache de metadatos para validar entidades y campos (incluidos los U_) antes de llamar.

## Reglas de seguridad
- Solo lectura por defecto.
- Antes de cualquier POST, PATCH o DELETE: muestra el JSON exacto, el endpoint y el perfil (dev o prod), y pide confirmacion.
- Para consultar datos masivos o diagnosticar, prefiere `use-b1-sql` si esta instalado. Aqui se crea y modifica.
- Nunca imprimas credenciales ni cookies de sesion.

## Alcance
Solo Service Layer. Para API Gateway usa `use-api-gateway`.

TODO: detallar herramientas del servidor MCP (sl_login, sl_get, sl_post, sl_patch, sl_delete, sl_batch, sl_describe_entity, sl_find_field, sl_refresh_metadata).
