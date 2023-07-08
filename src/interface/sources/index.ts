import { type AxiosRequestConfig } from 'axios'
import type EventEmitter from 'events'
import { type mirrorsLangsType } from 'fukayo-langs'
import { type Protocol } from 'puppeteer-core'
import type cheerio from 'cheerio'

export interface puppeteerOpts {
  auth?: {
    username: string
    password: string
  }
  cookies?: Protocol.Network.CookieParam[]
  referer?: string
  waitForSelector?: string
  /** cache config
   *
   * **Default behavior**
   * - (tries to) get data from cache.
   * - save response to cache
   */
  skipCache?: {
    /** DO NOT get data from cache */
    from?: boolean
    /** DO NOT save data to cache */
    to?: boolean
  }
}

export interface CrawlerRequestConfig<D = any> extends AxiosRequestConfig<D> {
  /** cache config
   *
   * **Default behavior**
   * - (tries to) get data from cache.
   * - save response to cache
   */
  skipCache?: {
    /** DO NOT get data from cache */
    from?: boolean
    /** DO NOT save data to cache */
    to?: boolean
  }
}

export interface ThrottleItem {
  matches: string[]
  points: number
  duration: number
}

interface Crawler {
  getInstance: (/** throttle points, duration and array of hostnames */item?: ThrottleItem) => Promise<CrawlerInstance>
}

export type RecordOrArrayOfRecord = Record<string, any> | Array<Record<string, any>>

export interface CrawlerInstance {
  getCrawler: (<T = cheerio.CheerioAPI | undefined>(url: string, type: 'html', opts?: CrawlerRequestConfig) => Promise<T>) & (<S extends RecordOrArrayOfRecord, T = S | undefined>(url: string, type: 'json', opts?: CrawlerRequestConfig) => Promise<T>) & (<T = Buffer | undefined>(url: string, type: 'img', opts?: CrawlerRequestConfig) => Promise<T>) & ((url: string, type: 'img' | 'html' | 'json', opts?: CrawlerRequestConfig) => Promise<Buffer | cheerio.CheerioAPI | Record<string, string> | undefined>)
  getPuppeteer: (<T = cheerio.CheerioAPI | undefined>(url: string, type: 'html', opts?: puppeteerOpts) => Promise<T>) & (<S extends RecordOrArrayOfRecord, T = S | undefined>(url: string, type: 'json', opts?: Omit<puppeteerOpts, 'waitForSelector'>) => Promise<T>) & (<T = Buffer | undefined>(url: string, type: 'img', opts?: Omit<puppeteerOpts, 'waitForSelector'>) => Promise<T>) & ((
    url: string,
    type: 'img' | 'html' | 'json',
    opts?: puppeteerOpts
  ) => Promise<Buffer | cheerio.CheerioAPI | Record<string, unknown> | undefined>)
}

export interface PublicSettings {
  /** source's filename */
  id: string
  displayName: string
  /** source's version number: `int` / `float` */
  version: number
  /** is this a selfhosted source? */
  localSource: boolean
  /** does this source uses puppeteer? */
  puppeteer: boolean
  /** languages supported by the source */
  langs: mirrorsLangsType[]
  /**
   * Source's host names
   *
   * @example
   * ```ts
   * // single hostname
   * source.hostnames = ['mangadex.org']
   * // multi
   * source.hostnames = ['crappy-scan.com', 'www.crapy-scan.com']
   * // lazy aka "I don't know what i'm doing"
   * source.hostnames = [
   *   new URL('https://www.crappy-scan.com/manga/72/page2/').host,
   *   new URL('https://crapy-scan.net/search?q=crap').host
   * ]
   * ```
   */
  hostnames: string[]
  /** weither or not the source has login capabilities */
  login: boolean
}

export interface Source {
  options: {
    arrays: Array<{
      name: string
      value: Array<string | number>
    }>
    booleans: Array<{
      name: string
      value: boolean
    }>
    credentials?: {
      login?: string
      password?: string
    }
  }
  limitrate: {
    matches: string[]
    points: number
    duration: number
  }
  search: (event: EventEmitter, query: string, requestedLangs: mirrorsLangsType[]) => Promise<unknown>
}

export type SourceActions = 'search' | 'option'
export interface ErrorResponse {
  success: false
  action: 'search'
  actor: string
  message: string
}

export interface SuccessResponse<T> {
  success: true
  action: 'search'
  actor: string
  data: T
}

export interface searchResponse {
  name: string
  url: string
  covers: string[]
  langs: mirrorsLangsType[]
  descriptions: Array<{
    lang: mirrorsLangsType
    synopsis: string
  }>
  lastChapter?: number
  nsfw: boolean
}

export type { Crawler }
