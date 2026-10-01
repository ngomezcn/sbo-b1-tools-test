---
status: partially superseded by ADR-0004
---

# El plugin de uso solo funciona con documentación instalada y elegida en el Setup

Un plugin de uso (`use-`) no opera sin un plugin de documentación (`docs-`): el Setup detecta los instalados, pregunta al desarrollador cuál encaja con su servidor y falla con error si no hay ninguno. La elección es la versión del proyecto y vale para dev, uat y prod. Se descartó una dependencia blanda (operar sin docs) y que el plugin de uso traiga un mínimo de documentación propio, porque la IA operaría a ciegas o duplicaría contenido. La dependencia es unidireccional: el `docs-` se puede consultar por sí solo.
