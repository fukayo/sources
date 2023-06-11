import { type Protocol } from 'puppeteer-core'
import { type AxiosRequestConfig } from 'axios'
import type * as cheerio from 'cheerio'
import { type SourceError, type SourceResponse } from './shared.js'

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

export interface Source {
  search: <T>(query: string) => Promise<SourceResponse<T> | SourceError>
}

export type { Crawler }
