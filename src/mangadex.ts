
import { type SourceResponse, type SourceError } from './interface/shared.js'
import type { CrawlerInstance, Source } from './interface/abstract.js'

const settings = {
  version: 0,
  localSource: false,
  puppeteer: false
}

class Mangadex implements Source {
  static #instance: Mangadex
  #scrapper?: CrawlerInstance

  static async getInstance (crawler: CrawlerInstance): Promise<Mangadex> {
    if (!(this.#instance instanceof Mangadex)) {
      this.#instance = new this()
      this.#instance.#scrapper = crawler
    }
    return this.#instance
  }

  async search<T> (query: string): Promise<SourceResponse<T> | SourceError> {
    if (!this.#scrapper) return { success: false, message: 'init_error' }
    const resp = await this.#scrapper?.getCrawler('https://api.mangadex.org/manga', 'json', { params: { title: query }, skipCache: { from: true, to: true } })
    return {
      success: true,
      data: resp as T
    }
  }
}

export const { version, localSource, puppeteer } = settings
export default Mangadex
