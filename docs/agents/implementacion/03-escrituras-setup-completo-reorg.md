# Sesión 3 — Escrituras en seco, Setup completo y reorganización de `sbo-skills` (slices 8–10)

Requiere las sesiones 1 y 2 mergeadas en `main`. Pega esto en una sesión local nueva en la raíz del repo.

---

Eres el **orquestador** de la sesión 3. Lee primero `docs/agents/implementacion/00-comun.md` y todo lo que indica, y `factory/plugins-src/service-layer/README.md` y `TESTING.md`. Rama: `impl/sesion-3` desde `main`.

## Slice 8 — Escrituras en seco

> Histórico: `post`, `patch` y `delete` se sustituyeron por el comando genérico `request` (ADR 0012); el modo en seco y `--allow-prod` se conservan.

- POST, PATCH y DELETE (ADR 0008): sin `--execute` solo imprimen la petición exacta (método, URL completa con la Versión de OData guardada, cuerpo) y no tocan el servidor; con `--execute` la envían. Salida JSON fija y error de SL literal.
- `prod` solo se escribe con una marca explícita en esa llamada, distinta de `--execute` (elige el nombre y documéntalo). Sin la marca, el error propio dice cómo continuar.
- Envía exactamente lo que se le pide: sin ETag ni `If-Match` propios. Antes de escribir sobre una entidad, aplica la regla del contexto de objeto (se regenera si falta o es antiguo).
- Test primero: el dry-run no hace ninguna petición de escritura (compruébalo contra el SL real consultando después que no cambió nada); con `--execute` crea, modifica y borra un registro en `BusinessPartners` en `v1` y `v2`; error literal de SL ante un campo desconocido y ante un campo obligatorio ausente.
- Anota en `TESTING.md` lo que verificaste del servidor (cuerpo de respuesta de POST, `204` en PATCH/DELETE, diferencias `v1`/`v2`).
- Redacta la guía de uso que irá en el SKILL.md del Uso (en inglés): cómo enseñar la petición en seco, esperar la aprobación y repetir con `--execute`; que la IA no propone la Autoridad total; que ante un error de campo desconocido solo avisa de la fecha del contexto sin regenerarlo.

## Slice 9 — Setup completo

- Entornos: solo los que indique el desarrollador (al menos uno); `dev`, `uat`, `prod`. Pregunta la Versión de B1 (lista cerrada, aviso si es otra) y la Versión de OData con **preselección**: `v2` desde FP 2405, `v1` antes. La recomendación de `v2` desde FP 2405 está confirmada por el desarrollador según fuente oficial de SAP.
- Probar el login de cada entorno configurado; si uno falla, el Setup lo indica y no lo da por configurado. Cada ejecución limpia lo anterior y empieza de cero (también datos y contexto de los entornos).
- Aviso claro si `.sbo-skills/` no puede añadirse a `.gitignore`.
- El Setup lo ejecuta un script (no la IA a mano): escribe el SKILL.md del Setup (en inglés) que lo lance y recoja las respuestas del desarrollador sin que las credenciales pasen por el contexto de la IA. Piensa cómo hacerlo sin que el `password` viaje por el chat (por ejemplo, el script pregunta por stdin al desarrollador); documenta la decisión y avisa de las limitaciones si las hay.
- Tests con el SL real en `v1` y `v2`.

## Slice 10 — Reorganización de `sbo-skills`

- `sbo-skills/` (submódulo) hoy tiene tres plugins sueltos (`docs-service-layer`, `setup-service-layer`, `use-service-layer`) con skills antiguas y referencias a `.sbo-b1`. Pasa a un **único plugin `service-layer`** (ADR 0010) con tres partes: Setup, Uso y Documentación. Actualiza `marketplace.json`, `plugin.json` y los README del submódulo.
- El Uso y el Setup se generan **compilando desde `factory/`** (nunca a mano en `dist/`): ejecuta el build y confirma que el resultado commiteado es reproducible (build dos veces, mismo resultado).
- La Documentación: mueve el contenido ya construido al plugin según lo hace hoy `docs-service-layer` (consulta cómo se publica; no regeneres con las skills `build-*`). Mantén que da error si falta `config.md` y que lee la Versión de B1.
- Quita todas las referencias a `.sbo-b1` y `sbo-core` en el submódulo y en `.claude/skills/`; si algún `build-*` usa esas rutas, corrígelo.
- Comprueba la instalación de punta a punta en un directorio temporal: instala el plugin (marketplace local), ejecuta el Setup contra el SL real y haz una lectura y una escritura en seco con `--execute` desde el plugin instalado.
- Commits en el submódulo en su propia rama `impl/sesion-3`; **no hagas push** en ninguno de los dos repos. Avisa al desarrollador de que, tras el push del submódulo, hay que actualizar el puntero en la fábrica.

## Entregable

Ramas con un commit por slice (el submódulo con los suyos), todos los tests pasando, `TESTING.md` completo con lo verificado contra FP 2608 y lo pendiente, y un resumen final al desarrollador con una checklist de lo que queda por decidir o verificar antes de publicar.
