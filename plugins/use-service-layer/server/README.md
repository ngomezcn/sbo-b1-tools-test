# Servidor MCP de use-service-layer

Pendiente de implementar. Responsabilidades:

- Perfiles de conexion (dev, prod): host, puerto (50000 por defecto), base de datos, usuario.
- Login (/b1s/v1/Login), cookie B1SESSION, renovacion de sesion, reintentos.
- Certificado autofirmado, timeout, paginacion.
- Herramientas: sl_login, sl_get, sl_post, sl_patch, sl_delete, sl_batch, adjuntos.
- Cache de metadatos por perfil a partir de $metadata (entidades, campos, tipos, claves, U_, version, fecha). Herramientas: sl_describe_entity, sl_find_field, sl_refresh_metadata.
- Modo solo lectura por defecto; escritura solo con flag explicito.
- Sin nada especifico de ninguna empresa.

Cuando exista, se declarara en `.mcp.json` en la raiz del plugin.
