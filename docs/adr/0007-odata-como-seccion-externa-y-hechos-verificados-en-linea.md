---
status: accepted
---

# OData es una sección externa de docs-service-layer y los hechos verificados van en línea

El conocimiento genérico de OData (protocolo, ETag, cabeceras, opciones de consulta) vive en `reference/odata/` dentro de `docs-service-layer`, como **sección externa** construida desde fuentes públicas (spec OASIS V4.01 y la parte "Learn" de la documentación de Microsoft), con atribución y sin imágenes ni enlaces. Lo que se comprueba contra un Service Layer real (**hecho verificado**) va en línea, con versión de SL y fecha, en la hoja de Service Layer que corresponde (por ejemplo `reference/etag/etag-guide.md`), nunca en una sección aparte; el ETag genérico de OData se queda en `odata/` y enlaza a la hoja de SL con "In Service Layer:". Se descartó un plugin `docs-odata` propio porque OData no es un Sistema de B1 y el ADR 0004 obliga a todo `docs-` a exigir un Setup para conocer la versión de B1, que aquí no tiene sentido; se descartó separar lo verificado de lo documentado porque obliga al LLM a cruzar dos lugares y pierde el matiz junto a la regla que corrige; y se descartó añadir notas verificadas a las hojas transcritas del PDF porque rompería la comparación del reviewer contra sus páginas. Si `odata/` llega a reutilizarse fuera de Service Layer, se extrae entonces a un plugin propio.

## Ampliación 2026-10-02

Las fuentes de la sección externa `odata/` se amplían a OData JSON Format 4.01 y OData CSDL XML 4.01 (OASIS Standard `os`, 23 de abril de 2020), además de Part 1 (Protocol), Part 2 (URL Conventions) y Microsoft Learn. De Microsoft Learn solo se usan los ficheros de protocolo (`overview.md` y `concepts/*.md`: 10, de los que `derived-types-adv.md` es un stub y se omite, así que 9). OASIS 4.01 solo existe como HTML exportado de Word; el Markdown de GitHub es el borrador V4.02 y se rechazó. La atribución va solo en el `index.md` de `odata/`, no en cada hoja (decisión del desarrollador). La skill de construcción es `build-docs-from-odata`. Hasta que el desarrollador revise, el destino es provisional en `factory/docs-src/odata-staging`.
