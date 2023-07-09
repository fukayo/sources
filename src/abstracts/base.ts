import { type EventEmitter } from 'events'
import { type mirrorsLangsType } from 'fukayo-langs'
import { type searchResponse } from '../interface/responses/search.js'
import { type Crawler, type CrawlerInstance, type Source, type SourceActions } from '../interface/sources/index.js'

export class Base implements Source {
  limitrate: { matches: string[], points: number, duration: number } = { matches: [], points: 1, duration: 1000 }
  settings: {
    arrays: Array<{ name: string, value: Array<string | number> }>
    booleans: Array<{ name: string, value: boolean }>
    credentials?: {
      login: string | null
      password: string | null
    }
  } = { arrays: [], booleans: [] }

  static instance: Base
  protected scrapper?: CrawlerInstance
  id = ''
  displayName = ''

  get options (): Base['settings'] {
    if (this.options.credentials) return { ...this.options, credentials: { login: this.options.credentials.login, password: 'HIDDEN' } }
    else return this.options
  }

  get wget (): CrawlerInstance {
    if (!this.scrapper) throw Error('source must be init via getInstance()')
    return this.scrapper
  }

  static async getInstance (
    crawler: Crawler
  ): Promise<Base> {
    if (!(this.instance instanceof Base)) {
      this.instance = new this()
      this.instance.scrapper = await crawler.getInstance(this.instance.limitrate)
    }
    return this.instance
  }

  success (event: EventEmitter, action: 'option', data: Base['options']): { success: boolean, action: 'option', actor: string, data: Base['options'] }
  success (event: EventEmitter, action: 'search', data: searchResponse): void
  success (event: EventEmitter, action: SourceActions, data: searchResponse | Base['options']): {
    success: boolean
    action: SourceActions
    actor: string
    data: Base['options'] | searchResponse
  } {
    const response = {
      success: true,
      action,
      actor: this.id,
      data
    }
    event.emit('data', response)
    return response
  }

  fail (event: EventEmitter, action: 'option', message: string): { success: false, action: 'option', actor: string, message: string }
  fail (event: EventEmitter, action: 'search', message: string): void
  fail (event: EventEmitter, action: SourceActions, message: string): { success: boolean, action: SourceActions, actor: string, message: string } {
    const response = {
      success: false,
      action,
      actor: this.id,
      message
    }
    event.emit('error', response)
    return response
  }

  static done (event: EventEmitter): void {
    event.emit('done')
  }

  setOption (event: EventEmitter, optionName: string, value: unknown): { success: false, action: 'option', actor: string, message: string } | { success: boolean, action: 'option', actor: string, data: Base['options'] } {
    if (optionName === 'credentials') {
      if (typeof value === 'undefined') this.options.credentials = value
      if (!(value instanceof Object)) return this.fail(event, 'option', 'bad_value')
      const hasLogin = Object.prototype.hasOwnProperty.call(value, 'login')
      const hasPassword = Object.prototype.hasOwnProperty.call(value, 'password')

      if (!hasLogin || !hasPassword) return this.fail(event, 'option', 'bad_value')

      const asserted = value as Partial<{ login: unknown, password: unknown }>
      const { login, password } = asserted

      const goodLogin = typeof login === 'string' || login === null
      const goodPwd = (typeof password === 'string' && password !== 'HIDDEN') || password === null

      if (goodLogin || goodPwd) {
        this.settings.credentials = {
          login: goodLogin ? login : this.settings.credentials?.login ?? null,
          password: goodPwd ? password : this.settings.credentials?.login ?? null
        }
        return this.success(event, 'option', this.options)
      }
      return this.fail(event, 'option', 'bad_value')
    }

    const findArray = this.options.arrays.find(f => f.name === optionName)
    const findBoolean = this.options.booleans.find(f => f.name === optionName)

    if (findArray) {
      if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
        findArray.value = value
        return this.success(event, 'option', this.options)
      } else return this.fail(event, 'option', 'bad_value')
    }

    if (findBoolean) {
      if (typeof value === 'boolean') findBoolean.value = value
      else return this.fail(event, 'option', 'bad_value')
    }

    return this.fail(event, 'option', 'bad_option')
  }

  async search (event: EventEmitter, query: string, requestedLangs: mirrorsLangsType[]): Promise<unknown> {
    throw Error('this is an abstract class')
  }
}