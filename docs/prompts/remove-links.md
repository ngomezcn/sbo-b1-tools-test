# Prompt: quitar links de la docs, con su texto de referencia

Eres un agente que elimina enlaces externos que el usuario ha juzgado **sin valor** de las hojas de `docs-src`, junto con el texto que solo existía para apuntar a ellos. Lee `AGENTS.md` primero. Nunca edites `sbo-skills/plugins/*/dist/`. El contenido de las hojas va en inglés.

Se invoca como `/build-docs-from-sl-pdf <IDs> quitar los links`. Si el usuario no usa el skill, sigue igualmente este prompt.

## Entrada

Una lista de IDs de link de `factory/docs-src/service-layer/REVIEW.md`, por ejemplo: `l012-01 l016-01`. Actúa solo sobre esos IDs. Si un ID no existe o no es de kind `link`, indícalo y sigue con los demás.

## Regla central: quita la URL y el texto que solo la señala

"Quitar el link" no es solo borrar la URL. Por cada ID, lee la hoja (la sección entera) y decide qué hacer con el **texto que rodea a la URL**:

- **Texto que existe solo para apuntar al enlace**: bórralo junto con la URL. Ejemplos: "For details, see https://…", "Click here: https://…", "(see link below)", un `[texto](url)` cuyo texto es "this link" / "here" / "the following page", una línea que solo contiene la URL, una entrada de lista "More information: https://…".
- **Texto con significado propio, donde la URL era un adorno**: conserva el texto y quita solo la URL o el markup del enlace. Ejemplo: "…on SAP Help Portal (https://help.sap.com/…)" pasa a "…on SAP Help Portal". `[SAP Help Portal](https://…)` pasa a "SAP Help Portal".
- **La frase deja de tener sentido sin el enlace** (la URL era el contenido, p. ej. "The specification is at <URL>" y no hay nada más): no decidas tú. Pregunta al usuario citando fichero, línea y el texto afectado, y propón dejar la frase recortada, reescribirla o quitarla entera. Mientras tanto, sigue con los demás IDs.

Si dudas entre las dos primeras, pregunta. Tras quitar, revisa que no queden frases huérfanas ("For more information, see ." / "Refer to:" sin nada detrás), listas vacías ni paréntesis vacíos.

## Qué hacer, por cada ID

1. Edita la hoja indicada en la columna `hoja` de `REVIEW.md` (ruta relativa a `factory/docs-src/service-layer/reference/`). Si la misma URL aparece varias veces en la hoja (anchors partidos o repetidos, p. ej. `l161-01` y `l161-02`), trata solo el ID pedido y avisa de las demás apariciones. No las quites sin que estén en la lista.
2. En `REVIEW.md`, pon la fila del ID en `removed` y deja en `note` una frase corta: qué se quitó (solo URL, o URL + texto de referencia) y que fue decisión del usuario.
3. Ejecuta `python factory/scripts/verify_section.py <apartado>` para el apartado de la hoja. Debe salir con exit 0. Si falla en `links` o `todo-links`, arregla la causa (normalmente un ID que sigue `pending` o una URL que sigue en la hoja) y repite.
4. No toques `factory/.work/` (es salida de extracción, regenerable).

## Verificación

1. `grep -rn "<url>" factory/docs-src/service-layer/reference/<hoja>` no devuelve la URL de ese ID (salvo apariciones que avisaste que quedan).
2. `git diff` solo muestra la hoja y `REVIEW.md` por cada ID.
3. Nada de `git commit` salvo que el usuario lo pida.

## Al terminar

Informa, por ID: hoja, qué quitaste (solo URL o URL + texto), cómo quedó la frase resultante entre comillas, y si hay apariciones repetidas de la URL o preguntas pendientes. Actualiza "Done last session" y "Waiting on the user" de `PROGRESS.md` si cambió el número de filas `pending`.
