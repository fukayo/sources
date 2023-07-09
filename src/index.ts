import { readdirSync, rmSync, writeFileSync } from 'fs'
import { type mirrorsLangsType } from 'fukayo-langs'
import { dirname, parse, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { type PublicSettings } from '@interfaces/sources/index.js'

const args = process.argv.slice(2)
if (!args[0]?.startsWith('v')) throw Error(`bad tag:${args[0]}`)
const FILENAME = fileURLToPath(import.meta.url)

const DIRNAME = dirname(FILENAME)

const files = readdirSync(DIRNAME)
const jsFiles = files.filter(f => parse(f).ext === '.js' && parse(f).name !== 'index')
const iconFiles = files.filter(f => parse(f).ext === '.svg' || parse(f).ext === '.png')

async function parseSources (): Promise<Array<{
  baseURL: string
  js: string
  icon: string
  name: string
  displayName: string
  version: number
  localSource: boolean
  puppeteer: boolean
  langs: mirrorsLangsType[]
  hostnames: string[]
  login: boolean
}>> {
  return await Promise.all(jsFiles.map(async js => {
    const icon = iconFiles.find(i => parse(i).name === parse(js).name)
    if (!icon) throw Error(`${parse(js).name} requires an icon (png/svg)`)
    const { publicSettings } = await import(pathToFileURL(resolve(DIRNAME, js)).toString()) as { publicSettings: PublicSettings }
    return {
      ...publicSettings,
      baseURL: `https://github.com/fukayo/sources/releases/download/${args[0]}`,
      js,
      icon
    }
  }))
}

async function writeIndex (source: Awaited<ReturnType<typeof parseSources>>): Promise<void> {
  writeFileSync(resolve(DIRNAME, 'all.json'), JSON.stringify(source))
}

async function publish (): Promise<void> {
  const sources = await parseSources()
  writeIndex(sources)
  rmSync(FILENAME)
}

publish()
