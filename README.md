# Fukayo Sources

## How to add a source?

### WIP

In this example the source fictional name's is `Crappy Scan Dream`

1. Create a `src/crappyscandream.ts`
2. Define public settings
```ts
// src/crappyscandream.ts
import type { PublicSettings } from './interface/sources/index.js'

export const publicSettings: PublicSettings = {
  id: 'crappyscandream', // filename
  displayName: 'Crappy Scan Dream', // how it should be displayed
  version: 0, // integer or floats
  localSource: false, // is this a selfhosted source?
  puppeteer: false, // does this source requires puppeteer to bypass cloudfare?
  langs: ['en'], // languages code, read: https://api.mangadex.org/docs/static-data/ ,
  hostnames: ['crappy-scan-dream.org', 'www.crapy-scan-dream.org']
}

// You can also use URL constructor to set hostnames
publicSettings.hostnames.push(new URL('https://crappy-scan-dream.uk.pt.br/search?q=crap').host)
```
3. Déclare the source, since each source work independently **you cannot import externals**
```ts
// src/crappyscandream.ts
import type { PublicSettings, Source, CrawlerInstance } from './interface/sources/index.js'
// public settings here

class CrappyScanDream implements Source {
  static #instance: CrappyScanDream
  #scrapper?: CrawlerInstance
  id = publicSettings.id
  displayName = publicSettings.displayName
  #something_to_use_internally = 'whatever i need'
}
```
4. Due to the limitation mentionned in #3 we need to implement a set of function to our class that are needed by Fukayo main process
```ts
// src/crappyscandream.ts
import type { PublicSettings, Source, CrawlerInstance, SourceActions } from './interface/sources/index.js'
// public settings here
class CrappyScanDream implements Source {
  static #instance: CrappyScanDream
  #scrapper?: CrawlerInstance
  id = publicSettings.id
  displayName = publicSettings.displayName
  #something_to_use_internally = 'whatever i need'

    /** by calling Source.getInstance we make sure we always use the same instance */
    static async getInstance (crawler: Crawler): Promise<CrappyScanDream> {
    if (!(this.#instance instanceof Mangadex)) {
      this.#instance = new this()
      if(!public.Settings.puppeteer) return this.#instance; // <= if we don't need puppeteer don't bother intanciating it.
      this.#instance.#scrapper = await crawler.getInstance({
        matches: [new URL(this.#instance.#baseURL).host],
        points: 5,
        duration: 1000
      })
    }
    return this.#instance
  }

  static success (event: EventEmitter, action: SourceActions, data: searchResponse): void {
    event.emit('data', { success: true, action, actor: this.#instance.id, data })
  }

  static fail (event: EventEmitter, action: SourceActions, message: string): void {
    event.emit('error', { success: false, action, actor: this.#instance.id, message })
  }
}