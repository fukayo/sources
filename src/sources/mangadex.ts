import { Base } from '@abstracts/base.js'
import type { PublicSettings } from '@interfaces/sources/index.js'
import { type Routes } from '@interfaces/sources/mangadex.js'
import type EventEmitter from 'events'
import { mirrorsLang, type mirrorsLangsType } from 'fukayo-langs'

export const publicSettings: PublicSettings = {
  name: 'mangadex',
  displayName: 'Mangadex',
  login: true,
  version: 0,
  localSource: false,
  puppeteer: false,
  langs: mirrorsLang.map(x => x), // <= .map fixes typescript non-sense,
  hostnames: ['mangadex.org', 'api.mangadex.org']
}

export default class Mangadex extends Base {
  name = publicSettings.name
  displayName = publicSettings.displayName
  langs = publicSettings.langs
  limitrate = {
    matches: [new URL('https://api.mangadex.org').host],
    points: 5,
    duration: 1000
  }

  settings = {
    arrays: [
      {
        name: 'mangadex_block_scanlator',
        value: []
      },
      {
        name: 'mangadex_block_group',
        value: []
      }
    ],
    booleans: [
      {
        name: 'mangadex_enable_block_group',
        value: true
      },
      {
        name: 'mangadex_enable_block_scanlator',
        value: true
      },
      {
        name: 'mangadex_erotica',
        value: false
      },
      {
        name: 'mangadex_pornographic',
        value: false
      }
    ],
    credentials: {
      login: null,
      password: null
    }
  }

  #baseURL = 'https://api.mangadex.org'

  async search (event: EventEmitter, query: string, requestedLangs: mirrorsLangsType[]): Promise<unknown> {
    // cancel signal
    let cancel = false
    event.once('cancel', () => {
      cancel = true
    })

    if (cancel) return

    // preparing request parameters
    const requestURL = `${this.#baseURL}/manga`

    const contentRating = ['safe', 'suggestive']
    if (this.options?.booleans?.find(f => f.name === 'mangadex_erotica')?.value === true) contentRating.push('erotica')
    if (this.options?.booleans?.find(f => f.name === 'mangadex_pornographic')?.value === true) contentRating.push('pornographic')

    const params = { title: query, limit: 16, contentRating, order: { revelance: 'desc' }, availableTranslatedLanguage: requestedLangs, includes: ['cover_art'] }
    // this scrapper never fails, but returns undefined
    const resp = await this.wget<Routes['/manga/{search}']['ok'] | Routes['/manga/{search}']['err']>(
      requestURL, 'json', { params }
    )

    if (!resp) return this.fail(event, 'search', 'no_data')
    if (resp.result !== 'ok') return this.fail(event, 'search', resp.errors[0].detail)

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
      this.success(event, 'search', {
        name,
        url: `/manga/${result.id}`,
        covers: coverURL ? [coverURL] : [],
        langs: langs.length ? langs : ['xx'],
        descriptions,
        lastChapter: lastChapter?.chapter,
        nsfw: isNSFW
      })
    })
    event.emit('done')
  }
}
