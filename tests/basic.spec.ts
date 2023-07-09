/// <reference types="vite/client" />

import { test, beforeAll } from 'vitest'
import { type PublicSettings } from '../src/interface/sources/index'
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
    if(!load.publicSettings) throw Error(`${instance.id} has no 'publicSetting' export`)
    instances.push({instance, publicSettings: load.publicSettings, path});
  }
})

test('definitions', () => {
  for(const src of instances) {
    const { instance, path } = src
    if(!instance.id || instance.id.length === 0) throw new Error(`Source is missing attribute "id" @ ${path}`)
    if(!instance.displayName || instance.id.length === 0) throw new Error(`Source "${instance.id}" is missing attribute "displayName"`)
    if(typeof instance.search !== 'function') throw new Error(`Source "${instance.id}" is missing function "search"`)
  }
})

test('public settings', () => {
  for(const src of instances) {
    const { publicSettings, instance } = src
    if(typeof publicSettings === 'undefined') throw Error(`${instance.id} has no 'publicSetting' export`)
    if(!publicSettings.id || publicSettings.id.length === 0) throw Error(`file "${instance.id}.ts" is missing property "publicSettings.id"`)
    if(!publicSettings.displayName || publicSettings.displayName.length === 0) throw Error(`file "${instance.id}.ts" is missing property "publicSettings.displayName"`)
    if(typeof publicSettings.version !== 'number') throw Error(`file "${instance.id}.ts" is missing property "publicSettings.version"`)
    if(typeof publicSettings.localSource !== 'boolean') throw Error(`file "${instance.id}.ts" is missing property "publicSettings.localSource"`)
    if(typeof publicSettings.puppeteer !== 'boolean') throw Error(`file "${instance.id}.ts" is missing property "publicSettings.puppeteer"`)
    if(typeof publicSettings.login !== 'boolean') throw Error(`file "${instance.id}.ts" is missing property "publicSettings.login"`)
    if(!Array.isArray(publicSettings.langs)) throw Error(`file "${instance.id}.ts" is missing property "publicSettings.langs"`)
    if(!publicSettings.langs.every(l => mirrorsLang.includes(l))) throw Error(`file "${instance.id}.ts" has unexpected language(s) in "publicSettings.langs"`)
    if(!Array.isArray(publicSettings.hostnames)) throw Error(`file "${instance.id}.ts" is missing property "publicSettings.hostnames"`)
    const correctURL = publicSettings.hostnames.filter(h => {
      try {
        new URL('https://'+h)
        return true
      } catch {
        return false
      }
    })
    if(!correctURL.length) throw Error(`file "${instance.id}.ts" has unexpected hostname(s) in "publicSettings.hostnames"`)
  }
})

test('compare public settings vs source definition', () => {
  for(const src of instances) {
    const { publicSettings, instance, path } = src
    if(publicSettings.id !== instance.id) throw Error(`publicSettings and Source "id" aren't the same: @ ${path}`)
    if(publicSettings.displayName !== instance.displayName) throw Error(`publicSettings and Source "displayName" aren't the same: @ ${path}`)
  }
})