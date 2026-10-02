import { openUse, type UseOptions } from './context.ts'
import { removeDump, sweepOldDumps } from './dump.ts'
import { failure, success, type UseOutput } from './output.ts'

export interface CleanOptions extends UseOptions {
  target: string
}

/** Deletes the Volcado of one execution (by id, folder name or path). Like any Uso run it then clears Volcados older than 24 h. */
export async function cleanDump(options: CleanOptions): Promise<UseOutput> {
  try {
    const ctx = await openUse(options, { sweep: false })
    const removed = await removeDump(ctx.root, ctx.environment, options.target)
    const old = await sweepOldDumps(ctx.root, ctx.environment, ctx.now())
    return success(200, { entorno: ctx.environment, eliminado: removed, caducados: old.length })
  } catch (e) {
    return failure(e)
  }
}
