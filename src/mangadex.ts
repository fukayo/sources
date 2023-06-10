
import { type SourceResponse, type SourceError } from './interface/shared.js'
import type { Crawler as ICrawler } from './interface/abstract.js'

class Mangadex {
  static #instance: Mangadex
  #scrapper?: ICrawler

  static async getInstance (crawler: ICrawler): Promise<Mangadex> {
    if (!(this.#instance instanceof Mangadex)) {
      this.#instance = new this()
      this.#instance.#scrapper = crawler
    }
    return this.#instance
  }

  async search<T> (query: string): Promise<SourceResponse<T> | SourceError> {
    if (!this.#scrapper) return { success: false, message: 'init_error' }
    const resp = await this.#scrapper?.getCrawler('https://api.mangadex.org', 'json')
    return {
      success: true,
      data: resp as T
    }
  }
}

export const version = 0
export default Mangadex
