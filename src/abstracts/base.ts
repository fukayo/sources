import { type EventEmitter } from 'events'
import { type mirrorsLangsType } from 'fukayo-langs'
import { type optionResponse } from '../interface/responses/options.js'
import { type searchResponse } from '../interface/responses/search.js'
import { type Crawler, type CrawlerInstance, type Source, type SourceActions } from '../interface/sources/index.js'

export class Base implements Source {
  limitrate: { matches: string[], points: number, duration: number } = { matches: [], points: 1, duration: 1000 }
  options: {
    arrays: Array<{ name: string, value: Array<string | number> }>
    booleans: Array<{ name: string, value: boolean }>
    credentials?: {
      login?: string
      password?: string
    }
  } = { arrays: [], booleans: [] }

  static instance: Base
  protected scrapper?: CrawlerInstance
  id = ''
  displayName = ''

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

  static success (event: EventEmitter, action: 'option', data: optionResponse, emit: false): { success: boolean, action: 'option', actor: string, data: optionResponse }
  static success (event: EventEmitter, action: 'search', data: searchResponse): void
  static success (event: EventEmitter, action: SourceActions, data: searchResponse | optionResponse, emit?: boolean): {
    success: boolean
    action: SourceActions
    actor: string
    data: optionResponse | searchResponse
  } {
    const response = {
      success: true,
      action,
      actor: this.instance.id,
      data
    }
    if (emit !== false) event.emit('data', response)
    return response
  }

  static fail (event: EventEmitter, action: 'option', message: string, emit: false): { success: false, action: 'option', actor: string, message: string }
  static fail (event: EventEmitter, action: 'search', message: string): void
  static fail (event: EventEmitter, action: SourceActions, message: string, emit?: boolean): { success: boolean, action: SourceActions, actor: string, message: string } {
    const response = {
      success: false,
      action,
      actor: this.instance.id,
      message
    }
    if (emit !== false) event.emit('error', response)
    return response
  }

  static done (event: EventEmitter): void {
    event.emit('done')
  }

  setOption (event: EventEmitter, optionName: string, value: unknown): { success: false, action: 'option', actor: string, message: string } | { success: boolean, action: 'option', actor: string, data: optionResponse } {
    if (optionName === 'credentials') {
      if (typeof value === 'undefined') this.options.credentials = value
      if (!(value instanceof Object)) return Base.fail(event, 'option', 'bad_value', false)
      const hasLogin = Object.prototype.hasOwnProperty.call(value, 'login')
      const hasPassword = Object.prototype.hasOwnProperty.call(value, 'password')
      if (!hasLogin || !hasPassword) return Base.fail(event, 'option', 'missing_value', false)
      const asserted = value as Partial<{ login: unknown, password: unknown }>
      const { login, password } = asserted
      if (typeof login === 'string' && typeof password === 'string') this.options.credentials = { login, password }
      else return Base.fail(event, 'option', 'bad_value', false)
      return Base.success(event, 'option', { optionName, newValue: value }, false)
    }

    const findArray = this.options.arrays.find(f => f.name === optionName)
    const findBoolean = this.options.booleans.find(f => f.name === optionName)

    if (findArray) {
      if (Array.isArray(value) && value.every(v => typeof v === 'string')) findArray.value = value
      else return Base.fail(event, 'option', 'bad_value', false)
    }

    if (findBoolean) {
      if (typeof value === 'boolean') findBoolean.value = value
      else return Base.fail(event, 'option', 'bad_value', false)
    }

    return Base.fail(event, 'option', 'bad_option', false)
  }

  async search (event: EventEmitter, query: string, requestedLangs: mirrorsLangsType[]): Promise<unknown> {
    throw Error('this is an abstract class')
  }
}
