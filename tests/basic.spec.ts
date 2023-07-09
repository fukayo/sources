/// <reference types="vite/client" />

import { test, beforeAll } from 'vitest'
import { type PublicSettings } from '../src/interfaces/sources/index'
import { Base } from '../src/abstracts/base'
import { mirrorsLang } from 'fukayo-langs'

class dummyCrawler {
  static instance: any
  static getInstance() {
    if(!this.instance) return new this()
    else return this.instance
  }
}

type SourceImport = { 
  publicSettings: PublicSettings,
  default: Base & { getInstance: (crawler:dummyCrawler) => Promise<Base>},
}

type PartialSourceImport = Partial<SourceImport>


const sources:string[] = []

beforeAll(async () => {
  const modules = import.meta.glob('../dist/*.js')
  for(const path in modules) {
    if(path.endsWith('index.js')) continue
    sources.push(path)
  }
})

const instances: { instance: Base, publicSettings: PublicSettings, path: string }[] = []

test('importing', async () => {
  for(const path of sources) {
    const load = await import(path) as PartialSourceImport
    if(!load.default) throw Error(`${path} has no default export`)
    const instance = await load.default.getInstance(dummyCrawler)
    if(!load.publicSettings) throw Error(`${instance.name} has no 'publicSetting' export`)
    instances.push({instance, publicSettings: load.publicSettings, path});
  }
})

test('definitions', () => {
  for(const src of instances) {
    const { instance, path } = src
    if(!instance.name || instance.name.length === 0) throw new Error(`Source is missing attribute "name" @ ${path}`)
    if(!instance.displayName || instance.name.length === 0) throw new Error(`Source "${instance.name}" is missing attribute "displayName"`)
    if(typeof instance.limitrate === 'undefined') throw new Error(`Source "${instance.name}" is missing attribute "limitrate"`)
    if(instance.limitrate.duration === 0) throw new Error(`limitrate.duration cannot be "0" @ ${instance.name}`)
    if(instance.limitrate.points === 0) throw new Error(`limitrate.points cannot be "0" @ ${instance.name}`)
    if(!instance.limitrate.matches.length) throw new Error(`limitrate.matches must be an array containing hostnames @ ${instance.name}`)
    const goodMatches = instance.limitrate.matches.every(m => {
      try {
        const url = new URL('http://'+m)
        console.log(url)
        return url.pathname === "/" && url.search === ""
      } catch {
        return false
      }
    })
    if(!goodMatches) throw new Error(`limitrate.matches must contains hostnames without protocol / path / params, eg: [some.website.com, website.com] @ ${instance.name}`)
    if(typeof instance.search !== 'function') throw new Error(`Source "${instance.name}" is missing function "search"`)

  }
})

test('public settings', () => {
  for(const src of instances) {
    const { publicSettings, instance } = src
    if(typeof publicSettings === 'undefined') throw Error(`${instance.name} has no 'publicSetting' export`)
    if(!publicSettings.name || publicSettings.name.length === 0) throw Error(`file "${instance.name}.ts" is missing property "publicSettings.id"`)
    if(!publicSettings.displayName || publicSettings.displayName.length === 0) throw Error(`file "${instance.name}.ts" is missing property "publicSettings.displayName"`)
    if(typeof publicSettings.version !== 'number') throw Error(`file "${instance.name}.ts" is missing property "publicSettings.version"`)
    if(typeof publicSettings.localSource !== 'boolean') throw Error(`file "${instance.name}.ts" is missing property "publicSettings.localSource"`)
    if(typeof publicSettings.puppeteer !== 'boolean') throw Error(`file "${instance.name}.ts" is missing property "publicSettings.puppeteer"`)
    if(typeof publicSettings.login !== 'boolean') throw Error(`file "${instance.name}.ts" is missing property "publicSettings.login"`)
    if(!Array.isArray(publicSettings.langs)) throw Error(`file "${instance.name}.ts" is missing property "publicSettings.langs"`)
    if(!publicSettings.langs.every(l => mirrorsLang.includes(l))) throw Error(`file "${instance.name}.ts" has unexpected language(s) in "publicSettings.langs"`)
    if(!Array.isArray(publicSettings.hostnames)) throw Error(`file "${instance.name}.ts" is missing property "publicSettings.hostnames"`)
    const goodMatches = instance.limitrate.matches.every(m => {
      try {
        const url = new URL('http://'+m)
        return url.pathname === "/" && url.search === ""
      } catch {
        return false
      }
    })
    if(!goodMatches) throw new Error(`limitrate.matches must contains hostnames without protocol / path / params, eg: [some.website.com, website.com] @ ${instance.name}`)
  }
})

test('compare public settings vs source definition', () => {
  for(const src of instances) {
    const { publicSettings, instance, path } = src
    if(publicSettings.name !== instance.name) throw Error(`publicSettings and Source "name" aren't the same: @ ${path}`)
    if(publicSettings.displayName !== instance.displayName) throw Error(`publicSettings and Source "displayName" aren't the same: @ ${path}`)
    if(!publicSettings.langs.every(l => instance.langs.includes(l)) || !instance.langs.every(l => publicSettings.langs.includes(l))) throw Error(`publicSettings and Source "langs" aren't the same: @ ${instance.name}`)
  }
})

test('print options', () => {
  for(const src of instances) {

    const { instance } = src
    console.log(instance.limitrate)
  }
})