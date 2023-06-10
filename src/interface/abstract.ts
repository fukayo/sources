import { type Protocol } from 'puppeteer-core'
import { type AxiosRequestConfig } from 'axios'
import type * as cheerio from 'cheerio'

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

export class Crawler {
  async getCrawler<T = cheerio.CheerioAPI | undefined>(url: string, type: 'html', opts?: CrawlerRequestConfig): Promise<T>
  async getCrawler<S extends Record<string, string>, T = S | undefined>(url: string, type: 'json', opts?: CrawlerRequestConfig): Promise<T>
  async getCrawler<T = Buffer | undefined>(url: string, type: 'img', opts?: CrawlerRequestConfig): Promise<T>
  async getCrawler (url: string, type: 'img' | 'html' | 'json', opts?: CrawlerRequestConfig): Promise<Buffer | cheerio.CheerioAPI | Record<string, string> | undefined> {
    return undefined
  }

  async getPuppeteer<T = cheerio.CheerioAPI | undefined>(url: string, type: 'html', opts?: puppeteerOpts): Promise<T>
  async getPuppeteer<S extends Record<string, unknown>, T = S | undefined>(url: string, type: 'json', opts?: Omit<puppeteerOpts, 'waitForSelector'>): Promise<T>
  async getPuppeteer<T = Buffer | undefined>(url: string, type: 'img', opts?: Omit<puppeteerOpts, 'waitForSelector'>): Promise<T>
  async getPuppeteer (
    url: string,
    type: 'img' | 'html' | 'json',
    opts?: puppeteerOpts
  ): Promise<Buffer | cheerio.CheerioAPI | Record<string, unknown> | undefined> {
    return undefined
  }

  static async getInstance (/** throttle points, duration and array of hostnames */item?: ThrottleItem): Promise<Crawler> {
    return await Promise.resolve(new this())
  }
}
