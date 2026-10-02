/** The path of a `request`: relative to the service root, sent as written except that characters a URL cannot carry are percent-encoded. */
import { SboError } from '../common/errors.ts'

export const METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const
export type Method = (typeof METHODS)[number]

export function parseMethod(value: string, where = 'The method'): Method {
  const method = value.toUpperCase()
  if (!(METHODS as readonly string[]).includes(method)) {
    throw new SboError('INVALID_METHOD', `${where} must be one of ${METHODS.join(', ')}, got "${value}".`)
  }
  return method as Method
}

// Anything outside this set is encoded; `%` is kept only when it already starts an escape (`%20`), so an encoded path is not encoded twice.
const URL_SAFE = /[A-Za-z0-9\-._~!$&'()*+,;=:@/?]/

function encodeUnsafe(text: string): string {
  let out = ''
  for (let i = 0; i < text.length; ) {
    const point = text.codePointAt(i)!
    const char = String.fromCodePoint(point)
    i += char.length
    if (char === '%' && /^[0-9A-Fa-f]{2}/.test(text.slice(i))) out += '%'
    else if (URL_SAFE.test(char)) out += char
    else out += [...Buffer.from(char, 'utf8')].map((b) => '%' + b.toString(16).toUpperCase().padStart(2, '0')).join('')
  }
  return out
}

/**
 * `Orders(5)/Cancel`, `SQLQueries('q')/List`, `$batch`, `Items?$filter=ItemCode eq 'A'`. Not an absolute URL, not with `/b1s/<version>`
 * (the tool adds the saved OData version), no `..`, and not Login/Logout: the tool owns the session.
 */
export function normalizePath(path: string, where = 'The path'): string {
  if (path.trim() === '') throw new SboError('INVALID_PATH', `${where} is empty. Give the path after the service root, for example Orders(5)/Cancel.`)
  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(path)) throw new SboError('INVALID_PATH', `${where} must not be a full URL: give only what comes after /b1s/<version>/. The host and the version come from the environment.`)
  const stripped = path.replace(/^\/+/, '')
  if (/^b1s\//i.test(stripped)) throw new SboError('INVALID_PATH', `${where} must not start with /b1s/<version>: the tool adds it from the saved OData version. Give the rest, for example Orders(5).`)
  const [resource] = stripped.split('?', 1)
  if (resource.split('/').some((s) => s === '..' || s === '.')) throw new SboError('INVALID_PATH', `${where} must not contain "." or ".." segments.`)
  if (/^(Login|Logout)(\?|\/|$)/i.test(resource)) {
    throw new SboError('PATH_RESERVED', `${where} is ${resource.split('/')[0]}: the tool logs in and out by itself and keeps the session; it cannot be driven through request.`)
  }
  return encodeUnsafe(stripped)
}

/** The first segment of a path as an entity set, when it is one: `Orders(5)/Cancel` -> `Orders`; `$batch`, `$1`, `$metadata` -> null. */
export function entitySetOf(path: string): string | null {
  const first = path.split('?', 1)[0].split('/', 1)[0]
  const name = /^([A-Za-z_][A-Za-z0-9_]*)(\(.*)?$/s.exec(first)?.[1]
  return name ?? null
}

/** The name of the Volcado folder of a request: the entity set, or the system resource without `$` (`$batch` -> `batch`). */
export function folderName(path: string): string {
  const first = path.split('?', 1)[0].split('/', 1)[0].replace(/\(.*$/s, '').replace(/^\$/, '')
  return /^[A-Za-z0-9_]+$/.test(first) && first !== '' ? first : 'response'
}
