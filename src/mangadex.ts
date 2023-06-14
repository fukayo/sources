import type EventEmitter from 'events'
import { mirrorsLang, type mirrorsLangsType } from 'fukayo-langs'
import type { Crawler, CrawlerInstance, Source, searchResponse } from './interface/abstract.js'
import { type Routes } from './interface/mangadex.js'

export const publicSettings = {
  id: 'mangadex',
  displayName: 'Mangadex',
  version: 0,
  localSource: false,
  puppeteer: false,
  langs: mirrorsLang,
  hostnames: ['mangadex.org']
}

export default class Mangadex implements Source {
  static #instance: Mangadex
  #scrapper?: CrawlerInstance
  #baseURL = 'https://api.mangadex.org'
  id = publicSettings.id
  displayName = publicSettings.displayName

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

  async search (event: EventEmitter, query: string, requestedLangs: mirrorsLangsType[]): Promise<unknown> {
    // check if src has been imported using .getInstance
    if (!this.#scrapper) throw Error('source must be initialized w/ getInstance()')
    // cancel signal
    let cancel = false
    event.once('cancel', () => {
      cancel = true
    })

    if (cancel) return

    const requestURL = `${this.#baseURL}/manga`
    const resp = await this.#scrapper.getCrawler<Routes['/manga/{search}']['ok'] | Routes['/manga/{search}']['err']>(requestURL, 'json', {
      params: {
        title: query,
        limit: 16,
        contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'],
        order: { relevance: 'desc' },
        availableTranslatedLanguage: requestedLangs,
        includes: ['cover_art']
      }
    })

    if (!resp) throw Error('no_data')
    if (resp.result !== 'ok') throw Error('api_response:' + resp.errors[0].detail)

    resp.data.forEach(result => {
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

      const langs = result.attributes.availableTranslatedLanguages.filter(l => requestedLangs.includes(l))

      const contentRating = result.attributes.contentRating
      const isNSFW = contentRating === 'erotica' || contentRating === 'pornographic'
      const data: searchResponse = {
        success: true,
        data: {
          name,
          url: `/manga/${result.id}`,
          covers: coverURL ? [coverURL] : [],
          langs: langs.length ? langs : ['xx'],
          descriptions,
          lastChapter: lastChapter?.chapter,
          nsfw: isNSFW
        }
      }
      event.emit('data', data)
    })
    event.emit('done')
  }
}
