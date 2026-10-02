import { SboError } from './errors.ts'

export const SUPPORTED_B1_VERSIONS = [
  'FP 2208', 'FP 2305', 'SP 2308', 'SP 2311', 'SP 2402', 'FP 2405', 'SP 2408', 'SP 2411',
  'FP 2502', 'SP 2505', 'FP 2508', 'SP 2511', 'FP 2602', 'SP 2605', 'FP 2608',
] as const

export const ODATA_VERSIONS = ['v1', 'v2'] as const
export type ODataVersion = (typeof ODATA_VERSIONS)[number]

export const ENVIRONMENTS = ['dev', 'uat', 'prod'] as const
export type Environment = (typeof ENVIRONMENTS)[number]

export function isEnvironment(value: string): value is Environment {
  return (ENVIRONMENTS as readonly string[]).includes(value)
}

/** Validates the shape of a Versión de B1 and returns it normalised plus any warning. */
export function checkB1Version(input: string): { version: string; warnings: string[] } {
  const version = input.trim().toUpperCase().replace(/\s+/g, ' ')
  if (!/^(FP|SP) \d{4}$/.test(version)) {
    throw new SboError('INVALID_VERSION_B1', `"${input}" is not a B1 version. Use the form "FP 2608" or "SP 2308".`)
  }
  if ((SUPPORTED_B1_VERSIONS as readonly string[]).includes(version)) return { version, warnings: [] }
  return {
    version,
    warnings: [`B1 version ${version} is not tested; it does not have to fail. Tested versions: ${SUPPORTED_B1_VERSIONS.join(', ')}.`],
  }
}

/** OData v2 (OData V4) is the default from FP 2405, when SAP deprecated OData V3. */
export function defaultODataVersion(b1Version: string): ODataVersion {
  const yymm = Number(b1Version.trim().split(/\s+/)[1])
  return yymm >= 2405 ? 'v2' : 'v1'
}

export function checkODataVersion(input: string): ODataVersion {
  if ((ODATA_VERSIONS as readonly string[]).includes(input)) return input as ODataVersion
  throw new SboError('INVALID_ODATA_VERSION', `"${input}" is not an OData version. Use "v1" (OData V3) or "v2" (OData V4).`)
}
