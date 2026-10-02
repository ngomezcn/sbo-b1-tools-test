# SAP B1 Tools

Paquete de plugins y skills para que desarrolladores de SAP Business One trabajen con la IA contra sus sistemas. Se centra por ahora en Service Layer y se ampliará a otros sistemas.

## Language

**Plugin de sistema**:
Único plugin instalable de un Sistema (por ejemplo, el de Service Layer). Se instala completo: lleva el **Setup**, el **Uso** y la **Documentación** de ese sistema y no se puede instalar por partes.
_Avoid_: Pack, suite

**Uso**:
Parte del plugin de sistema que permite a la IA operar contra un sistema B1 real: hacer las llamadas, iniciar sesión, gestionar credenciales y explorar metadatos. Antes se llamaba plugin de uso (`use-`).
_Avoid_: Conector, connector

**Documentación**:
Parte del plugin de sistema que aporta el conocimiento del sistema, único y global para todas sus versiones de B1. Marca dónde una función no existe o cambia según la versión. Exige el Setup hecho, para conocer la versión de B1.
_Avoid_: Plugin de conocimiento, knowledge plugin, documentación por versión, pack de documentación

**Service Layer**:
API REST de SAP Business One sobre la que se construye la primera pareja de plugins.

**Caché de metadatos**:
Conjunto de **Contextos de objeto** de un entorno, que el **Uso** mantiene en `.sbo-skills/<sistema>/<entorno>/context/`.
_Avoid_: Índice, catálogo

**Contexto de objeto**:
Ficha en Markdown (`context/<Entidad>.md`) con lo que un entorno expone de una entidad: campos estándar y de usuario, tipo, si pueden ir vacíos y valores válidos. Lleva la fecha de obtención y la Versión de OData con la que se obtuvo. La IA la lee antes de operar sobre la entidad; no hay un Contexto de objeto compartido entre entornos porque los campos de usuario difieren.

**Sistema**:
Tecnología de B1 contra la que se opera: Service Layer, SQL, DI API, etc. Cada sistema tiene su propio **Plugin de sistema** y su propia carpeta `.sbo-skills/<sistema>/`.

**Entorno**:
Instancia B1 concreta a la que un desarrollador se conecta mediante un sistema, con sus credenciales y su propia **Caché de metadatos**. Solo hay tres: dev, uat y prod, y pertenecen a un único cliente por proyecto. Vive en una carpeta local del repositorio desde donde se ejecuta la skill (`.sbo-skills/<sistema>/<entorno>/`), ignorada por git.
_Avoid_: Perfil, empresa, tenant

**Setup**:
Parte del plugin de sistema que prepara `.sbo-skills/<sistema>/`: guarda las credenciales de cada entorno, pregunta y guarda la versión de B1 y la Versión de OData, y prueba siempre el login (obligatorio; la sesión de prueba se descarta). Lo ejecuta un script, no la IA a mano. Cada ejecución limpia lo anterior y empieza de cero. Configura solo los entornos que el desarrollador indique, al menos uno.
_Avoid_: Setup como comando del Uso

**Versión de B1**:
Versión de SAP B1 (por ejemplo FP 2202) que el desarrollador declara en el Setup de un sistema, elegida de la lista cerrada de versiones soportadas (FP 2208, FP 2305, SP 2308, SP 2311, SP 2402, FP 2405, SP 2408, SP 2411, FP 2502, SP 2505, FP 2508, SP 2511, FP 2602, SP 2605, FP 2608), y que se guarda en `.sbo-skills/<sistema>/config.md`. Vale para todos los entornos de ese sistema. Una versión fuera de la lista se acepta con un aviso: no se ha testeado, aunque no tiene por qué fallar. La IA la usa para comprobar que una función existe en esa versión. El sistema no la detecta ni la contrasta entre sistemas: es responsabilidad del desarrollador declararla bien.
_Avoid_: Versión del proyecto, versión del servidor

**Versión de OData**:
Versión de la API de Service Layer a la que el **Uso** llama: `v1` (OData V3) o `v2` (OData V4), la que aparece en la URL (`/b1s/v2`); el nombre de OData se deduce de ella, no hay dos valores. El Setup la pregunta al desarrollador, la preselecciona según la Versión de B1 (`v2` desde FP 2405, cuando SAP deprecó OData V3) y la guarda en `.sbo-skills/<sistema>/config.md`; vale para todos los entornos de ese sistema. El **Uso** usa siempre la guardada y no la cambia por su cuenta. La decisión final es del desarrollador, aunque elija una que su Versión de B1 no soporte.
_Avoid_: Versión de API, versión de Service Layer

**Volcado**:
Carpeta local de una sola ejecución del **Uso** con los registros que esta trajo de un entorno, junto con la consulta y la fecha. Nunca se comparte entre ejecuciones y su contenido no entra en el contexto de la IA, solo su ruta y un resumen. Lo borra quien lo creó al terminar y, como red de seguridad, la herramienta lo borra pasadas 24 horas.
_Avoid_: Caché de datos, descarga

**Confirmación de escritura**:
Permiso que la IA pide al desarrollador antes de cada operación que modifica datos (POST, PATCH, DELETE).

**Autoridad total**:
Estado, limitado a una sesión, en el que el desarrollador dispensa a la IA de pedir confirmación de escritura. Solo lo concede el desarrollador; la IA nunca lo propone.

**Desarrollador**:
Persona usuaria del paquete: conoce B1, tiene juicio técnico y opera con credenciales de manager.
_Avoid_: Usuario final, usuario funcional

**sbo-skills**:
Repositorio interior y producto instalable: contiene los plugins que recibe el desarrollador. Es lo único que se publica.
_Avoid_: Marketplace (como nombre del repo)

**Fábrica**:
Repositorio exterior donde se construye el producto: fuentes de documentación, scripts y skills de construcción. Incluye a `sbo-skills` enlazado y nunca se instala.
_Avoid_: Repo de desarrollo, tooling

**Skill de construcción (`build-`)**:
Skill propia de la fábrica que ayuda a fabricar el producto (por ejemplo, generar la documentación a partir de las fuentes). No se publica en `sbo-skills`.
_Avoid_: Plugin (no se distribuye)

**Apartado**:
Parte de primer nivel del PDF fuente con carpeta propia en `reference/` y su `index.md`.
_Avoid_: Capítulo, sección (ambiguos con los del PDF)

**Sección externa**:
Carpeta de `reference/` con su `index.md` cuyo contenido no sale del PDF fuente sino de fuentes públicas declaradas (por ejemplo, la spec OASIS y la documentación de Microsoft sobre OData). La atribución va en su `index.md` y la versión de la fuente en cada hoja. Se divide en bloques.
_Avoid_: Apartado (reservado a lo que sale del PDF)

**Bloque**:
Parte de primer nivel de una sección externa, con carpeta e `index.md` propios dentro de ella (por ejemplo `odata/headers-and-versioning/`). Unidad de una sesión de construcción.
_Avoid_: Apartado (reservado a lo que sale del PDF)

**Fragmento**:
Trozo de una fuente externa con id estable (`oasis-p1-8.3.2`, `ms-get-data`) que un transcriptor convierte en una o varias hojas.
_Avoid_: Sección (ambiguo con sección externa y con las de la spec)

**Hecho verificado**:
Afirmación de una hoja comprobada contra un Service Layer real, marcada en línea junto a la regla que matiza, con la versión de SL y la fecha de la prueba. No sustituye a lo que dice la fuente: lo completa o lo contradice a la vista del lector.
_Avoid_: Nota, observación

**Hoja**:
Fichero de documentación con un tema concreto, con el que el agente consumidor responde una consulta.
_Avoid_: Página (se confunde con las del PDF)

**Unidad de trabajo**:
Tramo contiguo de páginas del PDF, o conjunto de fragmentos de una fuente externa, que un transcriptor convierte en una o varias hojas sin partir un tema por la mitad.

**Cola de revisión**:
Lista (`REVIEW.md`) de imágenes y enlaces externos que una persona decide conservar, describir o quitar.

## Relationships

- Un **Plugin de sistema** se instala completo: **Setup**, **Uso** y **Documentación** van siempre juntos. La IA puede consultar la **Documentación** sin operar, pero no existe el plugin sin el **Uso**.
- Si falta el Setup del sistema (`.sbo-skills/<sistema>/` o su `config.md`), tanto el **Uso** como la **Documentación** fallan con error que indica ejecutar el Setup.
- El **Setup** de un **Sistema** pregunta al desarrollador la **Versión de B1** y la guarda; el sistema no detecta la versión del servidor por su cuenta.
- Cada **Sistema** guarda su propia **Versión de B1**; los sistemas no las comparan entre sí.
- El **Setup** de Service Layer pregunta también la **Versión de OData**, independiente de la **Versión de B1**: preselecciona `v2` desde FP 2405, pero no impide elegir `v1` ni una combinación que falle.
- Cada **Entorno** de un **Sistema** tiene sus credenciales y su **Caché de metadatos**, formada por un **Contexto de objeto** por entidad, cada uno con su fecha de obtención.
- Una **Sección externa** se divide en **Bloques**; cada **Bloque** se construye en una sesión a partir de **Fragmentos** de sus fuentes, agrupados en **Unidades de trabajo** que producen **Hojas**.
- En `prod`, el **Uso** solo escribe con una marca explícita añadida a esa llamada, y la **Autoridad total** no la sustituye.
- Las escrituras (POST, PATCH, DELETE) del **Uso** son en seco por defecto: sin `--execute` solo muestran la petición exacta (ADR 0008).
- El **Uso** envía exactamente lo que el desarrollador pide: no añade cabeceras de control de concurrencia (ETag, `If-Match`) por su cuenta.
- Un **Contexto de objeto** lo genera la herramienta del **Uso** antes de operar sobre su entidad, si falta o tiene más de una semana, o cuando el desarrollador lo pide expresamente; la IA no lo regenera por su cuenta.
