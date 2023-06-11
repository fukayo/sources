
import { type SourceError, type searchResponse } from './interface/shared.js'
import type { Crawler, CrawlerInstance, Source } from './interface/abstract.js'
import { type Routes } from './interface/mangadex.js'
import type { mirrorsLangsType } from 'fukayo-langs'

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

  async search (query: string, requestedLangs: mirrorsLangsType[]): Promise<searchResponse | SourceError> {
    if (!this.#scrapper) return { success: false, message: 'init_error' }

    const language = requestedLangs.map(l => `availableTranslatedLanguage[]=${l}`).join('&')
    const rating = ['safe', 'suggestive', 'erotica', 'pornographic'].map(c => `contentRating[]=${c}`).join('&')
    const order = ['includes[]=cover_art', 'order[relevance]=desc'].join('&')
    const limit = 'limit=16'

    const requestURL = `${this.#baseURL}/manga?title=${query}&${language}&${rating}&${order}&${limit}`
    const resp = await this.#scrapper.getCrawler<Routes['/manga/{search}']['ok'] | Routes['/manga/{search}']['err']>(requestURL, 'json')

    if (!resp) return { success: false, message: 'unknown_error' }
    if (resp.result !== 'ok') return { success: false, message: resp.errors[0].detail }

    return {
      success: true,
      data: resp.data.map(result => {
        const name = result.attributes.title[Object.keys(result.attributes.title)[0]]
        let coverURL: undefined | string
        const coverData = result.relationships.find(x => x.type === 'cover_art')
        if (coverData && coverData.type === 'cover_art') coverURL = coverData.attributes.fileName
        // search for synopsis that matches requestedLangs
        const descriptions = requestedLangs.map(m => {
          return {
            lang: m,
            synopsis: result.attributes.description[m]
          }
        }).filter(f => f.synopsis) as Array<{ lang: mirrorsLangsType, synopsis: string }>

        const lastChapter =
          result.attributes.lastChapter && isNaN(parseFloat(result.attributes.lastChapter))
            ? { chapter: parseFloat(result.attributes.lastChapter) }
            : undefined

        const langs = result.attributes.availableTranslatedLanguages.filter(Boolean)

        const contentRating = result.attributes.contentRating
        const isNSFW = contentRating === 'erotica' || contentRating === 'pornographic'

        return {
          name,
          url: `/manga/${result.id}`,
          covers: coverURL ? [coverURL] : [],
          langs: langs.length ? langs : ['xx'],
          descriptions,
          lastChapter: lastChapter?.chapter,
          nsfw: isNSFW
        }
      })
    }
  }
}

export const { version, localSource, puppeteer } = settings
export default Mangadex
