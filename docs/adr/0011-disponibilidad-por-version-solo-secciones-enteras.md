---
status: accepted
---

# La disponibilidad por versión es un módulo aparte y solo de secciones enteras

La Documentación de Service Layer describe la última versión (FP 2608) y no lleva avisos de versión repartidos por las hojas. Un único archivo, `factory/docs-src/service-layer/availability.md`, lista las secciones enteras que no existen antes de cierta versión (hoy `webhooks/` desde FP 2602 y `webhooks/webhook-formula/` desde FP 2608). El `SKILL.md` solo manda abrirlo cuando la Versión de B1 declarada en `config.md` es anterior a la última documentada; con la última, no se consulta y no cuesta contexto. Una sección que no figura se da por disponible desde la versión mínima (FP 2208). Sustituye la parte de «marcas en su contenido» del ADR 0004.

Qué entidades, propiedades y funciones existen en la versión del usuario no se decide aquí: lo dice el `$metadata` de su servidor a través del Contexto de objeto. Se descartó tabla del Change Log de SAP para esa capa (el servidor ya es la verdad y incluye los campos de usuario, que el Change Log no ve), y también marcar párrafos o propiedades sueltas (la documentación crece por detrás del producto, así que lo que falta en una versión antigua del manual puede existir igualmente).

Regla de mantenimiento: una fila se añade solo con evidencia positiva (una frase «As of FP xxxx» en la hoja, el Document History del manual o el Change Log de la API de SAP); que algo no aparezca en un manual antiguo nunca la justifica. Al regenerar la documentación para una versión nueva hay que actualizar la versión de referencia del `SKILL.md` y revisar la tabla. Evidencia reunida en la sesión del 2 de octubre de 2026 (webhooks FP 2602 confirmado por la hoja, el Document History rev 1.28 y el Change Log; fórmulas FP 2608 por la hoja y la rev 1.29): fuera de la tabla quedan funciones dentro de hojas disponibles (login con dominio Windows FP 2305, anotaciones de metadata V4 FP 2608, trabajos programados FP 2508 solo en el Change Log, y los cambios de comportamiento de logs de FP 2305 y FP 2311) porque no son secciones enteras. La versión de B1 no se compara por código: la IA compara el número `YYMM`.
