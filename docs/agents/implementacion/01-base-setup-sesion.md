# Sesión 1 — Base, Setup mínimo, login, lectura por clave y sesión (slices 1–4)

Pega esto en una sesión local de Claude Code abierta en la raíz del repo (`main`, `git pull origin main`). Es la **primera**; las sesiones 2 y 3 dependen de ella.

---

Eres el **orquestador** de la sesión 1 de la implementación de `service-layer`. Antes de nada lee `docs/agents/implementacion/00-comun.md` y todo lo que indica: contiene el diseño cerrado, las reglas de pruebas y la forma de trabajo (subagentes, rama, commits). Cúmplelo.

## Objetivo

Dejar funcionando de extremo a extremo, contra el SL real, lo mínimo del Setup y del Uso, con la estructura de proyecto sobre la que construirán las sesiones 2 y 3. Rama: `impl/sesion-1`.

## Slice 1 — Esqueleto y Setup mínimo

- Decide y deja documentado (en el README de `factory/plugins-src/service-layer/`, en inglés, breve) lo no decidido aún: gestor de paquetes, empaquetador a JS (por ejemplo esbuild o tsc), librería de tests (`node:test` o vitest) y cómo se ve un plugin en `sbo-skills` tras el build. Criterios: pocas dependencias, Node ≥ 20 (`fetch` nativo, TLS sin validar con un `Agent` de undici o equivalente), una sola forma de ejecutar tests y build desde la raíz de `factory/plugins-src/service-layer/`.
- Estructura sugerida (puedes ajustarla con razón): `factory/plugins-src/service-layer/{src/common,src/setup,src/use,test}`; el código común es una carpeta normal (ADR 0010), no un paquete.
- Define **un solo sitio** que conozca el formato de `.sbo-skills/service-layer/` (rutas, `config.md`, `credentials.json`): lo usan Setup y Uso.
- Test primero: el Setup escribe `config.md` y `credentials.json` en una carpeta de un repo temporal, añade `.sbo-skills/` al `.gitignore` (lo crea si no existe, no lo duplica), y valida el entorno (`dev|uat|prod`) y la Versión de B1 (lista cerrada, con aviso si es otra). Aún sin login.
- Borra la carpeta vacía `factory/packages/sbo-core` (y `factory/packages/` si queda vacía).

## Slice 2 — Login y logout en el Setup

- El Setup prueba **siempre** el login; si falla no deja el entorno por configurado y el error de SL va literal. La sesión de prueba se descarta con `POST /Logout`. TLS sin validar. Prueba `v1` y `v2`.
- Casos reales contra el SL: credenciales correctas, contraseña incorrecta, `CompanyDB` inexistente, URL inalcanzable. Anota en `TESTING.md` el error exacto que devuelve SL en cada caso.
- Cada ejecución del Setup limpia lo anterior y empieza de cero.

## Slice 3 — Lectura por clave (primer comando del Uso)

- Comando CLI del Uso: leer por clave (`EntitySet` + clave) con `--entorno` (único entorno o obligatorio, según 00-comun). Salida JSON fija (`ok`, `status`, `resumen`); el registro **se vuelca a disco** en la estructura del Volcado y la salida solo da ruta y claves. Errores de SL literales; errores propios con código estable y frase de qué hacer (por ejemplo: falta el Setup, entorno no configurado).
- Falla con error claro y accionable si falta `.sbo-skills/service-layer/` o `config.md`.
- Usa la Versión de OData de `config.md` para la URL; nunca la cambia por llamada. Prueba con un `BusinessPartners` que exista en la demo (compruébalo) en `v1` y `v2`, y con clave inexistente.
- Claves compuestas: impleméntalas solo si hace falta para lo anterior; anótalas como pendiente en `TESTING.md`.

## Slice 4 — Sesión

- Guarda `B1SESSION` en el entorno; reutilízala; relogin automático si tiene más de 30 minutos (reloj inyectable en el test, sin esperar de verdad) o si SL responde 401. Para forzar el 401 real, invalida la sesión con un `Logout` por fuera o corrompe la cookie y comprueba que la llamada se recupera sola.
- El fichero de sesión no debe contener la contraseña.
- Anota en `TESTING.md` lo que verificaste del SL (duración real de sesión, forma exacta del 401).

## Entregable

Rama `impl/sesion-1` con 4 commits (uno por slice), tests pasando con un único comando, `TESTING.md` con lo verificado y lo pendiente, y un resumen final para el desarrollador. No empieces las slices 5 en adelante.
