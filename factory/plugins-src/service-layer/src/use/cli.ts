import { main } from './command.ts'

const output = await main(process.argv.slice(2), process.cwd())
console.log(JSON.stringify(output, null, 2))
process.exitCode = output.ok ? 0 : 1
