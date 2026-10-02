# Reglas comunes de las sesiones de implementación de `service-layer`

Las lee cada sesión antes de empezar. Son las mismas para las tres.

## Contexto

Trabajas en `ngomezcn/sbo-b1-tools-test` (la **fábrica**). Vas a implementar el plugin `service-layer` (Setup, Uso y Documentación en un único plugin, ADR 0010). El diseño está cerrado: **no lo reabras**. Si algo no está claro o choca con lo escrito, para y pregunta al desarrollador.

Lee primero, por este orden:
1. `AGENTS.md` y `CONTEXT.md` (vocabulario: usa estos términos tal cual).
2. `docs/adr/` completos, sobre todo 0003, 0005, 0008, 0009 y 0010. El 0006 está sustituido por el 0010: ignóralo.
3. `README.md` (principios y estructura).
4. `docs/agents/implementacion/` (este directorio): tu prompt y `00-comun.md`.

Lo que ya existe y no es tuyo: `factory/docs-src/` (la documentación, se construye con skills `build-*`), `factory/scripts/` (Python de construcción), `sbo-skills/` (submódulo, producto). `sbo-skills/plugins/` hoy tiene tres plugins sueltos (`docs-`, `setup-`, `use-service-layer`) con skills antiguas: se reorganizan en la sesión 3.

## Diseño cerrado (resumen para no tener que deducirlo)

- **Carpeta local:** `.sbo-skills/service-layer/` dentro del repo del desarrollador, ignorada por git (el Setup añade la entrada a `.gitignore`). `config.md` (frontmatter YAML: `versionB1`, `versionOData`) para todos los entornos; `<entorno>/credentials.json` (url, companyDB, usuario, password en texto plano; la IA nunca lo lee); entornos solo `dev`, `uat`, `prod`.
- **Versión de B1:** de la lista cerrada FP 2208, FP 2305, SP 2308, SP 2311, SP 2402, FP 2405, SP 2408, SP 2411, FP 2502, SP 2505, FP 2508, SP 2511, FP 2602, SP 2605, FP 2608. Fuera de la lista: se acepta con aviso ("no testeada, no tiene por qué fallar").
- **Versión de OData:** `v1` (OData V3) o `v2` (OData V4); un solo valor. El Setup la preselecciona (`v2` desde FP 2405) y la pregunta; el Uso usa siempre la guardada.
- **Setup:** script, no la IA a mano. Prueba siempre el login (obligatorio), descarta la sesión con `POST /Logout`. Cada ejecución limpia lo anterior y empieza de cero. Solo configura los entornos indicados, al menos uno.
- **TLS:** nunca se valida el certificado, en ningún entorno (ADR 0009).
- **Uso:** script TypeScript sobre Node, compilado desde la fábrica a JavaScript dentro del plugin; el compilado no se edita a mano. Sesión: `B1SESSION` en `.sbo-skills/service-layer/<entorno>/`; relogin automático si tiene más de 30 minutos o da 401. Salida: JSON corto y fijo (`ok`, `status`, `resumen`); el error de Service Layer va literal (código y mensaje); los errores propios llevan código estable y una frase de qué hacer. Las credenciales nunca pasan por el contexto de la IA.
- **Entorno por llamada:** el único configurado, o `--entorno` obligatorio si hay varios.
- **Lectura:** una página (por defecto, con `$top`), recorrer (sigue `nextLink` hasta un tope de filas configurable; pide `odata.maxpagesize=100`, nunca 0), contar, por clave.
- **Volcado:** una carpeta por ejecución, `.sbo-skills/service-layer/<entorno>/data/<fecha>-<id>/<EntitySet>/<clave>.json` más `_index.json`. Los registros nunca entran en el contexto de la IA: el comando devuelve solo ruta, nº de filas y claves. No se comparte entre ejecuciones. Comando de limpieza; red de seguridad: se borra a las 24 h.
- **Contexto de objeto:** `.sbo-skills/service-layer/<entorno>/context/<Entidad>.md`, Markdown compacto: campos estándar y de usuario (`U_*`), tipo, si puede ir vacío, valores válidos; cabecera con fecha de obtención y Versión de OData. Combina `$metadata` con `UserFieldsMD` (`$metadata` solo da `Nullable`, que no siempre equivale a obligatorio). La herramienta lo regenera antes de cualquier operación sobre esa entidad si falta o tiene más de una semana, o si el desarrollador lo pide. La IA no lo regenera por su cuenta.
- **Escrituras:** toda petición que no es GET (`request`, ADR 0012; al diseñar la sesión eran `post`, `patch` y `delete`) es **en seco por defecto**; sin `--execute` solo imprime la petición exacta (ADR 0008). `prod` solo se escribe con una marca explícita en esa llamada. No se añaden ETag ni `If-Match` por su cuenta.
- **Fuera de alcance:** (histórico: la sesión de diseño dejaba fuera `$batch`, acciones, adjuntos, `SQLQueries`, vistas SQL y UDO; el ADR 0012 lo revoca: `request` cubre todo lo que la Documentación describe, con los adjuntos solo probados en unitario.)

## Cómo se prueba

- **TDD, vertical slices**, con la skill `tdd`: un test, una implementación, repetir. Nada de escribir todos los tests y luego todo el código.
- **Contra el Service Layer real, nunca uno falso.** Está en `https://localhost:50000`, compañía `SBODemoES`, SL de FP 2608 (`Version` `1000340` en el login). Las credenciales están en el `.env` de la raíz (gitignored) como `SL_URL`, `SL_COMPANY`, `SL_USER`, `SL_PASSWORD`; cárgalas con `set -a; . ./.env; set +a`. Es una base demo desechable y el desarrollador la restaura al acabar: **tienes libertad total** para crear, modificar y borrar datos. No pongas guardarraíles ni limpieza obligatoria que no hagan falta. Nunca imprimas, commitees ni escribas en ficheros la contraseña ni `B1SESSION`.
- `v1` y `v2` responden los dos; prueba en los dos lo que dependa de la versión.
- Parte de la lógica (dry-run, caducidad por tiempo, parseo de `config.md`) no necesita servidor, pero se ejecuta junto con el resto, sin falso.
- Los tests validan el código nuestro (Setup y Uso), **no la documentación**. No escribas Hechos verificados en las hojas del `docs-`.
- Mantén `factory/plugins-src/service-layer/TESTING.md`: línea "ejecutadas contra FP 2608, v1 y v2, fecha", más la lista de comportamientos del servidor **no verificados**. Un comportamiento no verificado contra el SL real se marca pendiente; no lo des por bueno.

## Forma de trabajo

- **Usa subagentes.** Orquestas tú, los subagentes ejecutan:
  - `Explore` para localizar cosas en el repo o la estructura de plugins.
  - Un subagente `general-purpose` por tarea independiente dentro de una slice (por ejemplo, el comando de lectura y los tests de relogin), en paralelo solo si no tocan los mismos ficheros.
  - Al cerrar cada slice, un subagente revisor que lea el diff y compruebe si cumple CONTEXT.md, los ADR y el diseño de arriba. Aplica sus hallazgos válidos antes de cerrar.
  - Cada subagente recibe en su prompt las partes relevantes de este documento: arranca en frío.
- **Rama y commits:** crea una rama `impl/<tu-sesion>` desde `main` (`git pull origin main` antes). Un commit por slice, mensaje en inglés, terminado con las líneas de atribución que indique el sistema. **No hagas push** ni abras PR sin que lo pida el desarrollador.
- **Idiomas:** el contenido de los plugins que se publica va en **inglés** (SKILL.md, mensajes de error, README de plugin). `CONTEXT.md`, ADR y documentos de la fábrica, en **español**. No introduzcas detalles de implementación en `CONTEXT.md`.
- **Nunca edites** `sbo-skills/plugins/*/dist/` a mano: se edita en `factory/` y se recompila. No toques `factory/docs-src/` ni `factory/scripts/`.
- **Seguridad:** no logs ni salidas con credenciales, `B1SESSION` o cookies; en informes, `***`.
- **Si encuentras que el diseño no se sostiene** (contradicción entre ADR, o algo que el SL real desmiente), no lo resuelvas en silencio: para, resume el problema en un párrafo con la evidencia y pregunta.
- **Al terminar:** informa de qué slices están hechas, qué quedó pendiente (con razón), cómo ejecutar los tests y qué verificaste contra el SL real, sin repetir el código.
