---
status: superseded by ADR-0010
---

# El código compartido vive en la fábrica y se compila dentro de cada plugin

Los plugins `setup-` y `use-` de un sistema comparten código (formato de `.sbo-skills/<sistema>/<entorno>/`, credenciales, caché de metadatos, `config.md`). Cada plugin se instala por separado y no puede importar de otro, así que el código se escribe una sola vez en la fábrica (en TypeScript sobre Node) y un paso de build lo empaqueta dentro de cada plugin de `sbo-skills`, donde se commitea ya compilado. Se descartó duplicar el código a mano en cada plugin porque una divergencia en el manejo de credenciales sería difícil de detectar. El coste asumido es que `sbo-skills` contiene JavaScript empaquetado que no se edita a mano.
