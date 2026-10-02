import { SboError } from '../common/errors.ts'
import { SlError } from '../common/sl.ts'

/** Fixed output of every Uso command. Records never appear here: only paths, counts and keys. */
export interface UseOutput {
  ok: boolean
  /** HTTP status of the Service Layer answer; null when the failure is ours or the SL was not reached. */
  status: number | null
  resumen: Record<string, unknown> | null
  /** Present when `ok` is false: the SL error literally, or our own stable code plus what to do. */
  error?: { code: string | number | undefined; message: string }
}

export const success = (status: number | null, resumen: Record<string, unknown>): UseOutput => ({ ok: true, status, resumen })

export function failure(e: unknown): UseOutput {
  if (e instanceof SlError) return { ok: false, status: e.status, resumen: null, error: { code: e.code, message: e.message } }
  if (e instanceof SboError) return { ok: false, status: null, resumen: null, error: { code: e.code, message: e.message } }
  return { ok: false, status: null, resumen: null, error: { code: 'INTERNAL_ERROR', message: `Unexpected error: ${(e as Error).message}. Report it if it persists.` } }
}
