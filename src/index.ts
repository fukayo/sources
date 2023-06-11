import { rmSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
const args = process.argv.slice(2)
if (!args[0]?.startsWith('v')) throw Error(`bad tag:${args}`)
const FILENAME = fileURLToPath(import.meta.url)

const DIRNAME = dirname(FILENAME)
export const hack = import.meta.glob(['./*.ts', './*.js', '!./*.d.ts'], { eager: true })

function getVersion (input: unknown): number {
  return (input as { version: number }).version
}

function getId (input: string): string {
  return input.replace(/^\.\//, '').replace(/\.js$|\.ts$/, '')
}

function isLocal (input: unknown): number {
  return (input as { localSource: number }).localSource
}

function hasPup (input: unknown): boolean {
  return (input as { puppeteer: boolean }).puppeteer
}

const all = Object
  .keys(hack)
  .map(key => Object.assign({}, {
    id: getId(key),
    version: getVersion(hack[key]),
    url: `https://github.com/fukayo/sources/releases/download/${args[0]}/${getId(key)}.js`,
    local: isLocal(hack[key]),
    puppeteer: hasPup(hack[key])
  }))

writeFileSync(resolve(DIRNAME, 'all.json'), JSON.stringify(all))
rmSync(FILENAME)
