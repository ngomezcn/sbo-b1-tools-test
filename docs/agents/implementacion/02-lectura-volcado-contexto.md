# Sesión 2 — Lectura completa, volcado y contexto de objeto (slices 5–7)

Requiere la sesión 1 terminada (rama `impl/sesion-1` mergeada en `main`, o continúa sobre ella si el desarrollador lo indica). Pega esto en una sesión local nueva en la raíz del repo.

---

Eres el **orquestador** de la sesión 2. Lee primero `docs/agents/implementacion/00-comun.md` y todo lo que indica, y también `factory/plugins-src/service-layer/README.md` y `TESTING.md` que dejó la sesión 1, para respetar sus decisiones de herramientas y estructura. Rama: `impl/sesion-2` desde `main` (o desde `impl/sesion-1` si no está mergeada).

## Slice 5 — Una página, contar y recorrer

- **Una página** (por defecto, con `$top`), **contar** (`$count`; verifica contra el real qué forma devuelve en `v1` y `v2`, que difiere) y **recorrer** (sigue `nextLink` hasta un tope de filas configurable; pide `odata.maxpagesize=100`, nunca 0).
- Todas con volcado a disco y `_index.json`; la salida JSON solo da ruta, nº de filas y claves (si hay miles, devuelve el recuento y la ruta del `_index.json`, no una lista larga).
- Prueba contra entidades con datos reales de la demo: `BusinessPartners`, `Items`, `Orders`. Crea volumen propio si la demo tiene poco (libertad total, ver 00-comun) para probar `nextLink` con varias páginas y el tope de filas.
- Verifica y anota en `TESTING.md` el formato real de `nextLink` en `v1` y `v2` (relativo o absoluto, `skip` o `skiptoken`) y cómo se comporta con `$orderby` y `$filter`. Si el comportamiento real contradice lo que asumía el diseño, para y pregunta.
- Soporta pasar `$filter`, `$select`, `$orderby` y `$expand` tal cual, sin reinterpretarlos.

## Slice 6 — Limpieza del Volcado

- Comando de limpieza: borra el Volcado de una ejecución (por id o ruta) y solo ese.
- Red de seguridad: cualquier ejecución del Uso borra además los volcados con más de 24 h del entorno (reloj inyectable en los tests). Los volcados de ejecuciones concurrentes no se pisan: prueba dos ejecuciones en paralelo.
- No se borra nada fuera de `.sbo-skills/service-layer/<entorno>/data/`.

## Slice 7 — Contexto de objeto

- Genera `context/<Entidad>.md` combinando `$metadata` (campos estándar, tipo, `Nullable`, valores de enumeración) con `UserFieldsMD` (campos de usuario `U_*`: tipo, tamaño, valores válidos). Markdown compacto, cabecera con fecha de obtención y Versión de OData.
- Regeneración automática antes de **cualquier operación** (lectura o escritura) sobre esa entidad si falta o tiene más de una semana, o si el desarrollador lo pide (comando o flag explícito); la IA no lo regenera por su cuenta. Comando para mostrarlo.
- Verifica contra el real y anota: cómo se mapea `UserFieldsMD` a la entidad (campo `TableName`, con o sin prefijo `@`), cómo difieren `v1` y `v2` en `$metadata`, tamaño real de `$metadata` y tiempo de la petición. Para probar campos de usuario, crea uno propio en `UserFieldsMD` (libertad total) y comprueba que aparece en la ficha.
- Cuidado con el tamaño: `$metadata` de SL es muy grande; extrae solo la entidad pedida y no vuelques el XML al contexto de la IA.
- La ficha debe ser útil para escribir (qué campos pueden ir vacíos, valores válidos) pero compacta; decide el formato con un par de ejemplos reales (`BusinessPartners`, `Orders`) y deja uno de muestra como fixture de test.

## Entregable

Rama con 3 commits (uno por slice), tests pasando, `TESTING.md` ampliado con lo verificado y lo pendiente, y un resumen final al desarrollador. No empieces la slice 8.
