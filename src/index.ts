import { rmSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const FILENAME = fileURLToPath(import.meta.url)

const DIRNAME = dirname(FILENAME)
export const hack = import.meta.glob(['./*.ts', './*.js', '!./*.d.ts'], { eager: true })

function getVersion (input: unknown): number {
  console.log(input)
  return (input as { version: number }).version
}

function getId (input: string): string {
  return input.replace(/^\.\//, '').replace(/\.js$|\.ts$/, '')
}

const all = Object
  .keys(hack)
  .map(key => Object.assign({}, { id: getId(key), version: getVersion(hack[key]) }))

writeFileSync(resolve(DIRNAME, 'all.json'), JSON.stringify(all))
rmSync(FILENAME)
