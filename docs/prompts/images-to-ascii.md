# Prompt: sustituir imágenes de la docs por ASCII + explicación

Eres un agente que sustituye referencias a imágenes en la docs de Service Layer por **contenido textual real** (ASCII o descripción), para que un LLM consumidor pueda leerlo sin ver el PNG. Lee `AGENTS.md` y `CONTEXT.md` antes de empezar y usa sus términos.

Reglas del repo: la docs que se publica se escribe en **inglés**, aunque este prompt y el usuario hablen español. Nunca edites `sbo-skills/plugins/*/dist/`. Trabaja solo en `factory/docs-src/service-layer/`.

## Entrada

El usuario te da una lista de IDs de imagen, por ejemplo: `p013-01 p024-01`.

- Cada ID corresponde a `factory/docs-src/service-layer/assets/<ID>.png`.
- La página PDF de origen es el número del ID (`p013` = página 13). El render completo de esa página está en `factory/.work/service-layer/render/p013.png`; úsalo para ver el contexto.
- Localiza el `.md` que la referencia con `grep -rn "<ID>" factory/docs-src/service-layer --include=*.md`.

## Requisitos previos

`plantuml` debe estar en el PATH (`plantuml -version`). Si no lo está, **para y avisa al usuario**; no lo instales ni lo simules a mano.

## Proceso por imagen

1. **Mira la imagen** (`Read` sobre el PNG) y el texto que la rodea en el `.md`, para entender qué ilustra.
2. **Decide el tipo**:
   - **Diagrama** (arquitectura, flujo, secuencia, componentes, estados, clases, despliegue): conviértelo con la skill `/plantuml-ascii`. Escribe el `.puml` en el scratchpad, genera con `plantuml -utxt` y revisa el resultado. Etiquetas cortas; si el diagrama es complejo, simplifícalo conservando todas las entidades y relaciones relevantes. Mantén los nombres exactamente como aparecen en la imagen.
   - **No es diagrama** (captura de pantalla de SAP B1, navegador, Postman, explorador de Windows, etc.): no inventes un diagrama. Identifica lo importante: qué ventana o pantalla es, qué elementos están **resaltados, seleccionados o marcados** (recuadros, flechas, campos rellenos), y qué texto o valores relevantes se leen. Escribe una descripción que diga qué muestra la captura y qué señala, por ejemplo: "SAP attaches a screenshot of the *Service Layer Controller* window with the *Port* field highlighted and set to `50000`".
3. **Redacta el reemplazo en inglés**:

   Para un diagrama:

   ````
   ```text
   <ascii generado>
   ```

   Figure: <caption original, si existe>. <Explicación de 2-4 frases: qué componentes hay, qué flujo o relación muestra y por qué importa en este contexto.>
   ````

   Para una captura: solo el párrafo descriptivo (sin bloque `text`), empezando por `Figure:` si ya había caption original.
4. **No toques el `.md` todavía.** Muestra al usuario, por cada imagen: el ID, el tipo decidido, el ASCII (si aplica), la explicación y el fichero + línea donde se sustituirá.

## Aprobación

El usuario debe aprobar explícitamente **cada** ASCII y su explicación antes de aplicar nada. Si pide cambios, itera. Solo tras la aprobación de una imagen:

1. Sustituye en el `.md` la línea `![<ID>](...)` por el reemplazo aprobado. Conserva la sangría o el `>` si la imagen estaba dentro de una lista o cita.
2. Borra `factory/docs-src/service-layer/assets/<ID>.png`. **No borres** la copia de `factory/.work/service-layer/assets/` ni los renders.
3. Comprueba con `grep -rn "<ID>" factory/docs-src/service-layer` que no quedan referencias.
4. Anota en `factory/docs-src/service-layer/PROGRESS.md` (formato existente) que `<ID>` pasó a texto.

No hagas `git commit` salvo que el usuario lo pida.

## Al terminar

Resume en una tabla: ID, tipo (diagrama/captura), fichero modificado, estado (sustituida / pendiente de aprobación / no convertible con motivo).
