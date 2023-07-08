import { type EventEmitter } from 'events'
import { type mirrorsLangsType } from 'fukayo-langs'
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

  success (event: EventEmitter, action: 'option', data: Base['options'], emit: false): { success: boolean, action: 'option', actor: string, data: Base['options'] }
  success (event: EventEmitter, action: 'search', data: searchResponse): void
  success (event: EventEmitter, action: SourceActions, data: searchResponse | Base['options'], emit?: boolean): {
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
    if (emit !== false) event.emit('data', response)
    return response
  }

  fail (event: EventEmitter, action: 'option', message: string, emit: true): { success: false, action: 'option', actor: string, message: string }
  fail (event: EventEmitter, action: 'search', message: string): void
  fail (event: EventEmitter, action: SourceActions, message: string, emit?: boolean): { success: boolean, action: SourceActions, actor: string, message: string } {
    const response = {
      success: false,
      action,
      actor: this.id,
      message
    }
    if (emit !== false) event.emit('error', response)
    return response
  }

  static done (event: EventEmitter): void {
    event.emit('done')
  }

  setOption (event: EventEmitter, optionName: string, value: unknown): { success: false, action: 'option', actor: string, message: string } | { success: boolean, action: 'option', actor: string, data: Base['options'] } {
    if (optionName === 'credentials') {
      if (typeof value === 'undefined') this.options.credentials = value
      if (!(value instanceof Object)) return this.fail(event, 'option', 'bad_value', true)
      const hasLogin = Object.prototype.hasOwnProperty.call(value, 'login')
      const hasPassword = Object.prototype.hasOwnProperty.call(value, 'password')
      if (!hasLogin || !hasPassword) return this.fail(event, 'option', 'missing_value', true)
      const asserted = value as Partial<{ login: unknown, password: unknown }>
      const { login, password } = asserted
      if (typeof login === 'string' && typeof password === 'string') this.options.credentials = { login, password }
      else return this.fail(event, 'option', 'bad_value', true)
      return this.success(event, 'option', this.options, false)
    }

    const findArray = this.options.arrays.find(f => f.name === optionName)
    const findBoolean = this.options.booleans.find(f => f.name === optionName)

    if (findArray) {
      if (Array.isArray(value) && value.every(v => typeof v === 'string')) findArray.value = value
      else return this.fail(event, 'option', 'bad_value', true)
    }

    if (findBoolean) {
      if (typeof value === 'boolean') findBoolean.value = value
      else return this.fail(event, 'option', 'bad_value', true)
    }

    return this.fail(event, 'option', 'bad_option', true)
  }

  async search (event: EventEmitter, query: string, requestedLangs: mirrorsLangsType[]): Promise<unknown> {
    throw Error('this is an abstract class')
  }
}
