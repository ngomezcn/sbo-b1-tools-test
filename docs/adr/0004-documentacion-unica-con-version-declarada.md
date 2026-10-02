---
status: partially superseded by ADR-0010
---

# Una sola documentación por sistema; la versión de B1 se declara en el Setup

Cada sistema tiene un único plugin de documentación (`docs-service-layer`, sin versión en el nombre) que cubre todas las versiones de B1 soportadas y marca en su contenido las secciones no disponibles para ciertas versiones. El Setup del sistema pregunta al desarrollador su versión de B1 entre una lista cerrada de versiones soportadas y la guarda en `.sbo-skills/<sistema>/config.md`, igual para dev, uat y prod de ese sistema y sin contrastarla con la de otros sistemas; antes de usar una función la IA comprueba esa versión contra las marcas. Instalar un `use-` instala siempre su `docs-` (y su `setup-`). El `docs-` también exige el Setup hecho y da error si falta, aunque no depende del `use-`; así la IA nunca consulta documentación sin saber la versión. Se descartó una documentación por versión o por pack de versiones porque multiplica el mantenimiento con cada release y obliga a un mapeo versión→plugin; sustituye la parte de selección de documentación del ADR 0001.
