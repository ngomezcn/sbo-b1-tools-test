import { main } from './command.ts'

const { output, exitCode } = await main(process.argv.slice(2), process.env, process.cwd())
if (output !== undefined) console.log(JSON.stringify(output, null, 2))
process.exitCode = exitCode
