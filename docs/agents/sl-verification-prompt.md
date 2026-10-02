# Prompt: verificar la documentación de Service Layer contra un SL real

Pega todo lo que hay debajo de la línea en una sesión cloud nueva (entorno con el dominio del túnel permitido y los secretos `SL_URL`, `SL_COMPANY`, `SL_USER`, `SL_PASSWORD`).

---

Eres el **orquestador** de una campaña de verificación de la documentación `docs-service-layer` contra un Service Layer real. Trabajas en el repo `ngomezcn/sbo-b1-tools-test` (la **fábrica**; `sbo-skills/` es el producto y no se toca).

## 0. Contexto y autorización

- Lee primero: `AGENTS.md`, `CONTEXT.md`, `docs/adr/0007-odata-como-seccion-externa-y-hechos-verificados-en-linea.md`, `factory/docs-src/odata-staging/PENDING-REVIEW.md` (sobre todo el **ítem 6**) y `factory/docs-src/service-layer/PROGRESS.md`.
- El Service Layer al que apuntas es una **base demo de SAP (`SBODemoES`) totalmente desechable**. El desarrollador te autoriza **explícitamente y sin restricciones, solo para esta tarea**, a crear, modificar, borrar, cancelar y cerrar cualquier dato, incluidos los datos preexistentes, si lo necesitas para confirmar algo. Esto prevalece sobre el ADR 0002 (confirmación de escritura), que aplica al plugin de uso y no a esta campaña. Si una prueba necesita un dato propio, créalo con prefijo `ZZTEST_`; modifica los datos de la demo solo cuando no haya otra forma de probarlo.
- Acceso: `SL_URL` (URL base del túnel, sin `/b1s/...`), `SL_COMPANY`, `SL_USER`, `SL_PASSWORD`. **Nunca** imprimas, commitees ni escribas en informes la contraseña, `B1SESSION` ni cookies (redáctalos como `***`).
- Si el primer `POST {SL_URL}/b1s/v1/Login` falla con 403 del proxy, para y dile al usuario que el dominio no está permitido en *Network access* del entorno. Si falla por otro motivo (túnel caído, URL nueva), para y avisa. No reintentes en bucle.
- Anota en cuanto hagas login la **versión de Service Layer y de B1** (campo `Version` de la respuesta de Login, o `/b1s/v1/CompanyService_GetCompanyInfo`) y la fecha: son el "versión de SL + fecha" de cada hecho verificado.

## 1. Fase 1: agente organizador

Lanza **un** subagente organizador (`Agent`, tipo `general-purpose`). Su salida es `factory/docs-src/odata-staging/VERIFICATION-PLAN.md`, que contiene:

1. **Lista de comprobaciones `Txx`**. Cada una tiene la afirmación exacta de la doc (hoja y frase), las peticiones que la prueban (método, ruta, cabeceras, body), el resultado que la doc predice y qué resultado la contradiría.
2. **Alcance, en este orden:**
   - (A) Todo el **ítem 6** de `PENDING-REVIEW.md`: los 7 puntos `SL differs`, las 9 observaciones y los 3 mapeos dudosos.
   - (B) Una auditoría de `factory/docs-src/service-layer/reference/` (SL y `odata/`) en busca de afirmaciones **sin verificar o poco claras** que sea comprobable y con riesgo de ser falsa: cabeceras, códigos de estado, ETag, `$batch`, paginación, límites y restricciones, forma de errores. Lo que no sea comprobable contra un SL (p. ej. instalación o configuración del servidor) se lista aparte como "no comprobable".
3. **Agrupación en bloques** (sugeridos, ajusta si ves mejor): ETag y concurrencia; `Prefer` y respuestas de escritura (`return-no-content`, `Preference-Applied`, `OData-EntityId`, 204/200); lectura de propiedades y nulls (`odata.null`, `$value`, tipos complejos); paginación y conteo (`odata.maxpagesize`, `nextLink`, `$inlinecount`, `$count`); `$batch` y códigos de estado; errores y SQL Query; relaciones (`$ref`, `odata.bind`, `$links`, `$entity?$id=`, `$expand`); acciones vs funciones; `$metadata` y control de información JSON; versionado OData v3/v4.
4. **Orden de ejecución** y qué datos de prueba necesita cada bloque.

El organizador **no ejecuta pruebas**, solo planifica. Cuando termine, revisa el plan tú mismo y completa lo que falte antes de la fase 2.

## 2. Fase 2: bloques de verificación, de uno en uno

- Lanza **un subagente por bloque, secuencialmente**: no empieces el siguiente hasta que el anterior termine (el usuario lo pidió así por seguridad; una sola sesión de SL a la vez). Cada subagente hace su propio login y cierra sesión (`POST /Logout`) al acabar.
- Cada subagente recibe en el prompt: su bloque del plan, la autorización de la sección 0, las reglas de esta sección y la de evidencia. No le pases credenciales en el prompt: que lea las variables de entorno.
- Herramienta: `curl -sS -i` (sin `-k`, respeta el proxy del entorno) o `python3` con `requests`. Guarda todo borrador en el scratchpad, no en el repo.
- **Tenacidad**: para cada `Txx`, si el primer intento no es concluyente (error de sintaxis, datos faltantes, ruta equivocada), prueba **hasta 5 variantes** razonables (v1 y v2, cabeceras distintas, otro objeto) antes de declararlo "no verificable". Si un resultado contradice la doc, repítelo una vez más para descartar una anomalía puntual y prueba un segundo objeto o entidad distinto.
- Si algo bloquea el resto del bloque (sesión caída, límite de licencias, datos corruptos), arréglalo (reloguea, recrea datos) o informa del bloqueo; no sigas con pruebas basadas en un estado inválido.
- Si un subagente descubre algo importante fuera de su bloque, lo añade al plan como `Txx` nuevo (para el orquestador), no lo pone en la doc.

### Evidencia

Por cada `Txx` el subagente escribe `factory/docs-src/odata-staging/evidence/Txx.md` con: afirmación de la doc (hoja y cita), petición y respuesta literales (método, ruta, cabeceras relevantes, status y trozo del body; secretos redactados), versión de SL y fecha, y el veredicto.

Veredictos posibles:

- `confirmado`: el SL real coincide con la doc.
- `contradice`: el SL real difiere; incluye el comportamiento real.
- `matiz`: coincide pero con condiciones que la doc no dice (versión, tipo de entidad, cabecera adicional...).
- `no verificable`: indica por qué se agotaron las variantes, o por qué no es comprobable contra un SL.

## 3. Resultados: todo va a `PENDING-REVIEW.md`

- **No edites ninguna hoja de `reference/`** (ni de SL ni de `odata/`), ni nada de `sbo-skills/`. Toda la salida va a `factory/docs-src/odata-staging/PENDING-REVIEW.md`.
- Añade (sin renumerar lo existente) un **`## 8. Hechos verificados contra un SL real`** con: versión de SL/B1 y fecha de la campaña; una tabla `Txx | hoja | veredicto | resumen en una línea | evidencia`; y por cada `contradice` o `matiz` la **propuesta de texto** exacta para la hoja (en inglés, porque el contenido de las hojas se escribe en inglés), con la hoja y el lugar donde iría.
- Cierra el **ítem 6** actualizando su bloque de estado (`## Status`) y añade bajo cada punto del ítem 6 su veredicto y el `Txx` correspondiente. Los **3 mapeos dudosos** necesitan una decisión explícita en el ítem 8: mantener el mapeo, cambiarlo a otra hoja, o dejar `no equivalent hoja` (y si ese fuera el caso, la propuesta de una hoja nueva).
- Lista aparte, en el ítem 8, las afirmaciones "no comprobables contra un SL" y las que quedaron "no verificables".
- El informe y `PENDING-REVIEW.md` en español; el texto propuesto para hojas, en inglés.

## 4. Git

El usuario autoriza **commits y push directos a `main`**, sin PR. Haz un commit por bloque completado (plan, evidencia y `PENDING-REVIEW.md` actualizados) y `git push origin main`. Si el push falla por red, reintenta hasta 4 veces con espera 2s, 4s, 8s, 16s. No toques `sbo-skills/` ni nada compilado en `dist/`. Antes de commitear, busca en lo que vas a subir la contraseña, `B1SESSION` y cookies.

## 5. Cuándo has terminado

Cuando se cumplan las cuatro condiciones:

1. Cada `Txx` del alcance A tiene veredicto y evidencia.
2. El ítem 6 está cerrado y los 3 mapeos dudosos tienen decisión propuesta.
3. Todo lo comprobable del alcance B está probado o clasificado como "no comprobable".
4. Todo está pusheado a `main`.

Al terminar, entrega un resumen corto: cuántos `confirmado` / `contradice` / `matiz` / `no verificable`, las contradicciones más importantes, y qué decisiones quedan para el humano.
