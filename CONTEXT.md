# SAP B1 Tools

Paquete de plugins y skills para que desarrolladores de SAP Business One trabajen con la IA contra sus sistemas. Se centra por ahora en Service Layer y se ampliará a otros sistemas.

## Language

**Plugin de uso (`use-`)**:
Plugin que permite a la IA operar contra un sistema B1 real: hacer las llamadas, iniciar sesión, gestionar credenciales y explorar metadatos.
_Avoid_: Conector, connector

**Plugin de documentación (`docs-`)**:
Plugin que aporta el conocimiento de un sistema, único y global para todas sus versiones de B1. Marca dónde una función no existe o cambia según la versión. Necesita el Setup del sistema hecho (para conocer la versión de B1), pero no necesita ningún plugin de uso.
_Avoid_: Plugin de conocimiento, knowledge plugin, documentación por versión, pack de documentación

**Service Layer**:
API REST de SAP Business One sobre la que se construye la primera pareja de plugins.

**Caché de metadatos**:
Copia local de los metadatos que un sistema expone sobre sí mismo, construida por el plugin de configuración.
_Avoid_: Índice, catálogo

**Sistema**:
Tecnología de B1 contra la que se opera: Service Layer, SQL, DI API, etc. Cada sistema tiene su propio plugin de configuración, de uso y de documentación, y su propia carpeta `.sbo-b1/<sistema>/`.

**Entorno**:
Instancia B1 concreta a la que un desarrollador se conecta mediante un sistema, con sus credenciales y su propia caché de metadatos. Solo hay tres: dev, uat y prod, y pertenecen a un único cliente por proyecto. Vive en una carpeta local del repositorio desde donde se ejecuta la skill (`.sbo-b1/<sistema>/<entorno>/`), ignorada por git.
_Avoid_: Perfil, empresa, tenant

**Plugin de configuración (`setup-`)**:
Plugin, propio de cada sistema, que prepara `.sbo-b1/<sistema>/`: guarda las credenciales de cada entorno, prueba el login, genera su caché de metadatos y pregunta y guarda la versión de B1. Lo ejecuta un script, no la IA a mano. Cada ejecución limpia lo anterior y empieza de cero. Configura solo los entornos que el desarrollador indique, al menos uno.
_Avoid_: Setup como comando de un plugin de uso

**Setup**:
Ejecución del plugin de configuración de un sistema.

**Versión de B1**:
Versión de SAP B1 (por ejemplo FP 2202) que el desarrollador declara en el Setup de un sistema, elegida de la lista de versiones soportadas, y que se guarda en `.sbo-b1/<sistema>/config.md`. Vale para todos los entornos de ese sistema. La IA la usa para comprobar que una función existe en esa versión. El sistema no la detecta ni la contrasta entre sistemas: es responsabilidad del desarrollador declararla bien.
_Avoid_: Versión del proyecto, versión del servidor

**Versión de OData**:
Versión de la API de Service Layer a la que el plugin de uso llama: `v1` (OData V3) o `v2` (OData V4), la que aparece en la URL (`/b1s/v2`). El Setup la pregunta al desarrollador, recomienda `v2` y la guarda en `.sbo-b1/<sistema>/config.md`; vale para todos los entornos de ese sistema. El plugin de uso usa siempre la guardada y no la cambia por su cuenta. La decisión final es del desarrollador, aunque elija una que su Versión de B1 no soporte.
_Avoid_: Versión de API, versión de Service Layer

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

- Un **Plugin de uso** necesita su **Plugin de configuración** y su **Plugin de documentación** para operar; el **Plugin de documentación** necesita el **Plugin de configuración** pero no el **Plugin de uso**, así que se puede consultar sin él (por ejemplo, un agente de código que programa contra Service Layer).
- Instalar un **Plugin de uso** instala siempre su **Plugin de configuración** y su **Plugin de documentación**. No hay elección de versiones de documentación.
- Si falta el Setup del sistema (`.sbo-b1/<sistema>/` o su `config.md`), tanto el **Plugin de uso** como el **Plugin de documentación** fallan con error que indica ejecutar el Setup.
- El **Setup** de un **Sistema** pregunta al desarrollador la **Versión de B1** y la guarda; el sistema no detecta la versión del servidor por su cuenta.
- Cada **Sistema** guarda su propia **Versión de B1**; los sistemas no las comparan entre sí.
- El **Setup** de Service Layer pregunta también la **Versión de OData**, independiente de la **Versión de B1**: informa de desde qué Versión de B1 SAP recomienda `v2`, pero no impide elegir `v1` ni una combinación que falle.
- Cada **Entorno** de un **Sistema** tiene sus credenciales y su **Caché de metadatos**, con la fecha en que se obtuvo.
- Una **Sección externa** se divide en **Bloques**; cada **Bloque** se construye en una sesión a partir de **Fragmentos** de sus fuentes, agrupados en **Unidades de trabajo** que producen **Hojas**.
- La **Caché de metadatos** la genera el **Setup**; la IA solo puede pedir permiso al desarrollador para regenerarla.
