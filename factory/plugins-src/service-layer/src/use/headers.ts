/** Headers of a `request`: the developer may send any header, except the three that the tool owns. */
import { SboError } from '../common/errors.ts'

/** Why each of these is not the caller's to set. */
const RESERVED: Record<string, string> = {
  cookie: 'the tool logs in and sends the session cookie itself (and never shows it)',
  host: 'it is set from the URL of the environment, so a request cannot be sent to another host',
  'content-length': 'it is computed from the body that is sent',
}

const TOKEN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/

/** Rejects a header that the tool owns, or that is not a header at all. Used for the headers of `--header` and of each sub-request of a batch. */
export function assertHeader(name: string, value: string, where = '--header'): void {
  if (!TOKEN.test(name)) throw new SboError('HEADER_INVALID', `${where}: "${name}" is not a valid header name.`)
  // A line break in a value would let one header smuggle another (or a whole request in a batch).
  if (/[\r\n\0]/.test(value)) throw new SboError('HEADER_INVALID', `${where}: the value of ${name} has a line break or a null character.`)
  const why = RESERVED[name.toLowerCase()]
  if (why) throw new SboError('HEADER_RESERVED', `${where}: ${name} cannot be set, ${why}. Remove it; nothing was sent.`)
}

/** `--header "Name: value"` (repeatable) -> a map. The same header twice is an error: which one would win is not obvious. */
export function parseHeaderFlags(flags: string[] | undefined): Record<string, string> {
  const headers: Record<string, string> = {}
  const seen = new Set<string>()
  for (const flag of flags ?? []) {
    const colon = flag.indexOf(':')
    if (colon < 1) throw new SboError('HEADER_INVALID', `--header must be "Name: value", got "${flag}".`)
    const name = flag.slice(0, colon).trim()
    const value = flag.slice(colon + 1).trim()
    assertHeader(name, value)
    if (seen.has(name.toLowerCase())) throw new SboError('HEADER_INVALID', `--header: ${name} is given twice. Give it once (several values go in one value, separated by commas).`)
    seen.add(name.toLowerCase())
    headers[name] = value
  }
  return headers
}

/** The same check for the `headers` object of a sub-request in a batch file. */
export function checkHeaderObject(headers: unknown, where: string): Record<string, string> {
  if (headers === undefined) return {}
  if (headers === null || typeof headers !== 'object' || Array.isArray(headers)) throw new SboError('BATCH_INVALID', `${where}: "headers" must be an object of name to text.`)
  const result: Record<string, string> = {}
  const seen = new Set<string>()
  for (const [name, value] of Object.entries(headers)) {
    if (typeof value !== 'string') throw new SboError('BATCH_INVALID', `${where}: the header ${name} must be text.`)
    assertHeader(name, value, `${where} header`)
    if (seen.has(name.toLowerCase())) throw new SboError('HEADER_INVALID', `${where}: ${name} is given twice.`)
    seen.add(name.toLowerCase())
    result[name] = value
  }
  return result
}

export const hasHeader = (headers: Record<string, string>, name: string) => Object.keys(headers).some((h) => h.toLowerCase() === name.toLowerCase())
