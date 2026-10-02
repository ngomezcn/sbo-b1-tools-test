/** `entities`: where the Índice de entidades is (renewed if missing or old, or when the developer asks with `--refresh`). */
import { readFile } from 'node:fs/promises'
import { openUse, type UseOptions } from './context.ts'
import { countEntities, ensureEntityIndex } from './entity-index.ts'
import { failure, success, type UseOutput } from './output.ts'
import { readHeader } from './metadata.ts'

export interface EntitiesOptions extends UseOptions {
  /** The developer asked for a new index. The AI never sets this by itself. */
  refresh?: boolean
}

export async function entitiesCommand(options: EntitiesOptions): Promise<UseOutput> {
  try {
    // The command renews the index itself, and `--refresh` must not be answered with the one that openUse would have just made.
    const ctx = await openUse(options, { index: false })
    const result = await ensureEntityIndex(ctx, { force: options.refresh })
    const header = readHeader(await readFile(result.standard, 'utf8'))
    return success(200, {
      entorno: ctx.environment,
      regenerado: result.regenerated,
      estandar: result.standard,
      usuario: result.user,
      fecha: header?.fetchedAt.toISOString() ?? null,
      versionOData: ctx.config.versionOData,
      entidades: await countEntities(result),
    })
  } catch (e) {
    return failure(e)
  }
}
