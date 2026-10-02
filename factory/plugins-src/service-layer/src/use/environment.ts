import { SboError } from '../common/errors.ts'
import { configuredEnvironments } from '../common/layout.ts'
import { isEnvironment, type Environment } from '../common/versions.ts'

/** The only configured environment, or the one named; with several configured the name is required. */
export async function resolveEnvironment(root: string, requested: string | undefined): Promise<Environment> {
  if (requested !== undefined) {
    if (!isEnvironment(requested)) throw new SboError('INVALID_ENVIRONMENT', `"${requested}" is not an environment. Use dev, uat or prod.`)
    return requested
  }
  const configured = await configuredEnvironments(root)
  if (configured.length === 1) return configured[0]
  if (configured.length === 0) throw new SboError('SETUP_MISSING', 'No environment is configured. Run the service-layer Setup first.')
  throw new SboError('ENVIRONMENT_REQUIRED', `Several environments are configured (${configured.join(', ')}). Pass --entorno <name>.`)
}
