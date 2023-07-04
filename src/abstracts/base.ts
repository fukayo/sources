import { type EventEmitter } from 'events'
import { type mirrorsLangsType } from 'fukayo-langs'
import { type optionResponse } from '../interface/responses/options.js'
import { type searchResponse } from '../interface/responses/search.js'
import { type Crawler, type CrawlerInstance, type Source, type SourceActions } from '../interface/sources/index.js'

export class Base implements Source {
  static #instance: Base
  #scrapper?: CrawlerInstance
  #baseURL = ''
  id = ''
  displayName = ''

  static async getInstance (crawler: Crawler): Promise<Base> {
    if (!(this.#instance instanceof Base)) {
      this.#instance = new this()
      this.#instance.#scrapper = await crawler.getInstance({
        matches: [new URL(this.#instance.#baseURL).host],
        points: 5,
        duration: 1000
      })
    }
    return this.#instance
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
      actor: this.#instance.id,
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
      actor: this.#instance.id,
      message
    }
    if (emit !== false) event.emit('error', response)
    return response
  }

  static done (event: EventEmitter): void {
    event.emit('done')
  }
  async search (event: EventEmitter, query: string, requestedLangs: mirrorsLangsType[]): Promise<unknown> {
    throw Error('this is an abstract class')
  }
}
