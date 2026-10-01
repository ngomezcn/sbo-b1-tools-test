# Prompt: eliminar imágenes sin valor de la docs

Eres un agente que elimina imágenes que el usuario ha juzgado **dummy, artefactos de extracción o sin valor**, junto con todas sus referencias. No las sustituyas por nada: solo bórralas. Lee `AGENTS.md` primero. Nunca edites `sbo-skills/plugins/*/dist/`.

## Entrada

Una lista de IDs de imagen dada por el usuario, por ejemplo: `p113-03 p116-01`. Borra solo esos IDs, nada más. Si un ID no existe en ningún sitio, indícalo y sigue con los demás.

## Antes de borrar: revisa el contexto

Por cada ID, **antes de tocar nada**, lee el `.md` de `docs-src` donde aparece (unas líneas antes y después, o la sección entera) y busca texto que dependa de la imagen: "as shown in the figure", "see the screenshot", "the highlighted field", "the following diagram", un caption `Figure: ...`, pasos que remiten a lo que se ve, o cualquier valor/nombre que solo se entienda mirando la imagen.

- Si **no hay** ninguna dependencia, bórrala sin preguntar.
- Si **hay** alguna (o dudas), **no borres esa imagen**: pregunta al usuario citando fichero, línea, el texto afectado y qué propones (dejar el texto, reescribirlo o quitarlo). Espera su respuesta. Mientras tanto, sigue con las demás imágenes de la lista que estén limpias.

## Qué borrar, por cada ID

1. Los ficheros PNG, si existen:
   - `factory/docs-src/service-layer/assets/<ID>.png`
   - `factory/.work/service-layer/assets/<ID>.png`
2. Las referencias Markdown `![<ID>](...)` en:
   - `factory/docs-src/service-layer/**/*.md`
   - `factory/.work/service-layer/pages/*.md` (la referencia es `![<ID>](<ID>.png)`)
3. Las entradas del ID en `factory/.work/service-layer/elements.json` (JSON válido al terminar; compruébalo parseándolo).
4. Las menciones del ID en `factory/docs-src/service-layer/REVIEW.md` y `PROGRESS.md` solo si son entradas que dependen de la imagen (p. ej. una línea de la cola de revisión sobre esa imagen). Si la mención es historial de otra cosa, déjala.

No toques `render/` (son páginas completas, no estas imágenes) ni `warnings.md`.

## Cuidado al editar el Markdown

- Si la referencia está sola en su línea, borra la línea y deja **una sola** línea en blanco entre los párrafos vecinos (no dobles huecos).
- Si está **en línea dentro de una frase** (`texto ![ID](...) texto`), quita solo la referencia y arregla los espacios dobles. Revisa que la frase siga teniendo sentido.
- Si estaba dentro de una lista o un blockquote (`>`), conserva la sangría o el `>` de las líneas vecinas; si queda una línea `>` vacía sobrante, quítala.
- Nunca borres ni reescribas por tu cuenta texto que haga referencia a la imagen (captions, "as shown above", etc.): eso se pregunta al usuario, como indica la sección de revisión del contexto.

## Verificación

1. `grep -rn "<ID>" factory/` no debe devolver nada (salvo historial que dejaste a propósito en `PROGRESS.md`; menciónalo).
2. `factory/.work/service-layer/elements.json` parsea como JSON.
3. `git status` solo muestra cambios en los ficheros esperados.

No hagas `git commit` salvo que el usuario lo pida.

## Al terminar

Resume en una tabla: ID, ficheros PNG borrados, ficheros `.md` editados, y avisos (IDs inexistentes, menciones dejadas). Lista aparte las imágenes **no borradas por dependencia de contexto**, con la pregunta pendiente para el usuario.
