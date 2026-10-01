# Servidor MCP de use-b1-sql

Pendiente de implementar. Responsabilidades:

- Perfiles de conexion (HANA / SQL Server), credenciales fuera del repo.
- Ejecucion de SELECT con limite de filas y timeout, una sentencia por llamada.
- Cache de esquema por perfil.
- La proteccion real es el usuario de base de datos con solo SELECT, no el filtrado de texto.
