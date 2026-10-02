/** HTTP access to the Service Layer. TLS certificates are never validated (ADR 0009). */
import { Agent, fetch as undiciFetch } from 'undici'
import { SboError } from './errors.ts'
import type { Credentials } from './layout.ts'
import type { ODataVersion } from './versions.ts'

export interface HttpRequest {
  method: string
  url: string
  headers: Record<string, string>
  /** Text (JSON, multipart) or raw bytes (a file being uploaded). */
  body?: string | Uint8Array
}

export interface HttpResponse {
  status: number
  headers: Headers
  /** The body decoded as UTF-8. */
  text: string
  /** The body as received. Absent in an injected answer that only has `text`. */
  bytes?: Uint8Array
}

/** The most a single answer may weigh; a bigger one is cut off and reported (a download goes to disk, but not without a limit). */
export const MAX_RESPONSE_BYTES = 100 * 1024 * 1024

/** The bytes of an answer, whichever way it was built. */
export const bodyBytes = (response: HttpResponse): Uint8Array => response.bytes ?? Buffer.from(response.text, 'utf8')

/** Injectable so tests can observe the real traffic; the default talks to the network. */
export type Transport = (request: HttpRequest) => Promise<HttpResponse>

const insecureAgent = new Agent({ connect: { rejectUnauthorized: false } })

export const defaultTransport: Transport = async (request) => {
  const response = await undiciFetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    dispatcher: insecureAgent,
  })
  const declared = Number(response.headers.get('content-length'))
  if (declared > MAX_RESPONSE_BYTES) throw tooLarge(declared)
  const chunks: Uint8Array[] = []
  let total = 0
  if (response.body) {
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
      total += chunk.byteLength
      if (total > MAX_RESPONSE_BYTES) throw tooLarge(total)
      chunks.push(chunk)
    }
  }
  const bytes = Buffer.concat(chunks)
  return {
    status: response.status,
    headers: response.headers as unknown as Headers,
    bytes,
    // Decoded on demand: a downloaded file is never turned into a string.
    get text() {
      return bytes.toString('utf8')
    },
  }
}

const tooLarge = (size: number) =>
  new SboError('RESPONSE_TOO_LARGE', `The Service Layer answer is larger than ${MAX_RESPONSE_BYTES / 1024 / 1024} MB (${size} bytes so far) and was not read. Ask for less (a filter, $select, a page) or download it another way.`)

/** Error returned by the Service Layer, kept literal: status, code and message as received. */
export class SlError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | number | undefined,
    message: string,
  ) {
    super(message)
    this.name = 'SlError'
  }
}

/** v1 answers `message: {lang, value}` and a numeric code; v2 a plain string message and a string code. */
export function parseSlError(status: number, text: string): SlError {
  try {
    const error = (JSON.parse(text) as { error?: { code?: string | number; message?: string | { value?: string } } }).error
    if (error) {
      const message = typeof error.message === 'string' ? error.message : (error.message?.value ?? text)
      return new SlError(status, error.code, message)
    }
  } catch {
    /* not JSON */
  }
  // Not JSON: usually an HTML page from the proxy in front of the SL (e.g. "502 Proxy Error"); keep its title, not the markup.
  const title = /<title>\s*([^<]*?)\s*<\/title>/i.exec(text)?.[1]
  return new SlError(status, undefined, title ? `HTTP ${status}: ${title}` : text.trim().slice(0, 300) || `HTTP ${status}`)
}

export const baseUrl = (url: string, version: ODataVersion) => `${url.replace(/\/+$/, '')}/b1s/${version}`

/** Sends a request; network failures become a SboError, anything else is returned as is. */
export async function send(transport: Transport, request: HttpRequest): Promise<HttpResponse> {
  try {
    return await transport(request)
  } catch (e) {
    if (e instanceof SboError) throw e
    const cause = (e as { cause?: { code?: string; message?: string } }).cause
    const reason = cause?.code ?? cause?.message ?? (e as Error).message
    throw new SboError('SL_UNREACHABLE', `Could not reach ${request.url} (${reason}). Check the URL and that the Service Layer is running.`)
  }
}

export interface LoginResult {
  sessionId: string
  /** `Cookie` header value to send afterwards: B1SESSION plus ROUTEID when the SL sets one. */
  cookie: string
  /** `Version` field of the login response (SL build number). */
  version: string
}

export async function login(
  credentials: Credentials,
  version: ODataVersion,
  transport: Transport = defaultTransport,
): Promise<LoginResult> {
  const response = await send(transport, {
    method: 'POST',
    url: `${baseUrl(credentials.url, version)}/Login`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ CompanyDB: credentials.companyDB, UserName: credentials.userName, Password: credentials.password }),
  })
  if (response.status < 200 || response.status >= 300) throw parseSlError(response.status, response.text)
  let body: { SessionId?: string; Version?: string } = {}
  try {
    body = JSON.parse(response.text)
  } catch {
    /* handled below */
  }
  if (!body.SessionId) {
    throw new SboError('SL_BAD_RESPONSE', `${baseUrl(credentials.url, version)}/Login answered without a session. Check that the URL is a Service Layer.`)
  }
  const routeId = response.headers.getSetCookie?.().map((c) => /^ROUTEID=([^;]*)/.exec(c)?.[1]).find(Boolean)
  const cookie = `B1SESSION=${body.SessionId}` + (routeId ? `; ROUTEID=${routeId}` : '')
  return { sessionId: body.SessionId, cookie, version: body.Version ?? '' }
}

export async function logout(
  credentials: Credentials,
  version: ODataVersion,
  cookie: string,
  transport: Transport = defaultTransport,
): Promise<void> {
  const response = await send(transport, {
    method: 'POST',
    url: `${baseUrl(credentials.url, version)}/Logout`,
    headers: { Cookie: cookie },
  })
  if (response.status < 200 || response.status >= 300) throw parseSlError(response.status, response.text)
}

/** A request against the SL with a session cookie. Any non-2xx answer is thrown as the literal SlError. */
export async function request(
  transport: Transport,
  credentials: Credentials,
  version: ODataVersion,
  method: string,
  path: string,
  cookie: string,
  headers: Record<string, string> = {},
  body?: string | Uint8Array,
): Promise<HttpResponse> {
  const response = await send(transport, { method, url: `${baseUrl(credentials.url, version)}/${path}`, headers: { ...headers, Cookie: cookie }, body })
  if (response.status < 200 || response.status >= 300) throw parseSlError(response.status, response.text)
  return response
}
