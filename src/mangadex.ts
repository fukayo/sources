
import { type SourceResponse, type SourceError } from './interface/shared.js'
import type { Crawler, CrawlerInstance, Source } from './interface/abstract.js'

const settings = {
  version: 0,
  localSource: false,
  puppeteer: false
}

class Mangadex implements Source {
  static #instance: Mangadex
  #scrapper?: CrawlerInstance
  #baseURL = 'https://api.mangadex.org'

  static async getInstance (crawler: Crawler): Promise<Mangadex> {
    if (!(this.#instance instanceof Mangadex)) {
      this.#instance = new this()
      this.#instance.#scrapper = await crawler.getInstance({
        matches: [new URL(this.#instance.#baseURL).host],
        points: 5,
        duration: 1000
      })
    }
    return this.#instance
  }

  async search<T> (query: string): Promise<SourceResponse<T> | SourceError> {
    if (!this.#scrapper) return { success: false, message: 'init_error' }
    const resp = await this.#scrapper.getCrawler('https://api.mangadex.org/manga', 'json', { params: { title: query }, skipCache: { from: true, to: true } })
    return {
      success: true,
      data: resp as T
    }
  }
}

export const { version, localSource, puppeteer } = settings
export default Mangadex
