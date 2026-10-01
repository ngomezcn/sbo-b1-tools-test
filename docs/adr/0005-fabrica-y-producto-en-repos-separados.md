---
status: accepted
---

# La fábrica y el producto viven en dos repositorios enlazados por submódulo

El producto instalable es el repositorio `sbo-skills` (github.com/ngomezcn/sbo-skills). La fábrica (fuentes de documentación, scripts, skills `build-`, ADRs y glosario) es el repositorio exterior e incluye `sbo-skills` como submódulo en `sbo-skills/`. Así el desarrollador que instala el producto solo descarga plugins, sin PDFs de SAP ni herramientas de construcción, y el historial de cada repositorio se mantiene limpio. Se descartó un único monorepo porque mezclaría material de construcción (incluidos PDFs con copyright) con lo que se publica, y obligaría a filtrar qué se distribuye.
