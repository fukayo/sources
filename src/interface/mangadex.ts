import { type mirrorsLangsType } from 'fukayo-langs'

export interface MangaAttributes {
  title: Record<string, string>
  altTitles: Record<string, string>
  description: {
    [key in mirrorsLangsType]: string | null | undefined
  }
  lastChapter: string | null
  lastVolume: string | null
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled' | null
  tags: Array<{
    id: string
    type: 'tag'
    attributes: {
      name: Record<string, string>
    }
  }>
  availableTranslatedLanguages: mirrorsLangsType[]
}

export interface ChapterAttributes {
  title: string
  volume: string | null
  chapter: string | null
  translatedLanguage: mirrorsLangsType
  externalUrl: string | null
  readableAt: string
}

export type ChapterRelationShips = Array<{
  id: string
  type: 'scanlation_group' | 'user'
}
|
{
  id: string
  type: 'manga'
  attributes: MangaAttributes
}>

export type MangaRelationShips =
  Array<{
    id: string
    type: 'author'
    attributes: {
      name: string
    }
  }
  |
  {
    id: string
    type: 'artist'
    attributes: {
      name: string
    }
  }
  |
  {
    id: string
    type: 'cover_art'
    attributes: {
      fileName: string
    }
  }>

export type chapterRelationShips =
  Array<{
    id: string
    type: 'scanlation_group'
    attributes: {
      name: string
    }
  }
  |
  {
    id: string
    type: 'user'
    attributes: {
      username: string
    }
  }
  |
  {
    id: string
    type: 'manga'
    attributes: MangaAttributes
  }>

export interface Routes {
  '/auth/login': {
    payload: { username: string, password: string }
    ok: {
      result: 'ok'
      token: {
        session: string
        refresh: string
      }
    }
    err: {
      result: 'error'
      errors: [
        {
          title: string
          detail: string
        }
      ]
    }
  }
  '/auth/refresh': {
    payload: { token: string }
    ok: Routes['/auth/login']['ok']
    err: Routes['/auth/login']['err']
  }
  '/chapter': {
    ok: {
      result: 'ok'
      reponse: 'collection'
      data: Array<{
        id: string
        type: string
        attributes: {
          title: string
          volume: null | string
          chapter: null | string
          translatedLanguage: string
          externalUrl: string | null
        }
        relationships: chapterRelationShips
      }>
    }
    err: Routes['/auth/login']['err']
  }
  '/chapter/{id}': {
    ok: {
      result: 'ok'
      reponse: 'entity'
      data: {
        id: string
        type: 'chapter'
        attributes: {
          title: string
          volume: null | string
          chapter: null | string
          translatedLanguage: string
          externalUrl: string | null
        }
        relationships: chapterRelationShips
      }
    }
    err: Routes['/auth/login']['err']
  }
  '/at-home/server/{id}': {
    ok: {
      result: 'ok'
      baseUrl: string
      chapter: {
        hash: string
        data: string[]
        dataSaver: string[]
      }
    }
    err: Routes['/auth/login']['err']
  }
  '/manga': {
    ok: {
      result: 'ok'
      response: 'collection'
      data: Array<Routes['/manga/{id}']['ok']['data']>
      limit: number
      offset: number
      total: number
    }
    err: Routes['/auth/login']['err']
  }
  '/manga/{id}': {
    ok: {
      result: 'ok'
      response: 'entity'
      data: {
        id: string
        type: string
        attributes: MangaAttributes
        relationships: MangaRelationShips
      }
    }
    err: Routes['/auth/login']['err']
  }
  '/manga/{search}': {
    ok: {
      result: 'ok'
      response: 'entity'
      data: Array<{
        id: string
        type: string
        attributes: MangaAttributes
        relationships: MangaRelationShips
      }>
    }
    err: Routes['/auth/login']['err']
  }
  '/manga/{id}/feed': {
    ok: {
      result: 'ok'
      response: 'collection'
      data: Array<{
        id: string
        type: 'chapter'
        attributes: ChapterAttributes
        relationships: ChapterRelationShips
      }>
      limit: number
      offset: number
      total: number
    }
    err: Routes['/auth/login']['err']
  }
  '/manga/{id}/read': {
    ok: {
      result: 'ok'
      data: string[]
    }
    err: Routes['/auth/login']['err']
  }
  '/group': {
    err: Routes['/auth/login']['err']
    ok: {
      result: 'ok'
      response: 'entity'
      data: Array<{
        id: string
        type: 'scanlation_group'
        attributes: {
          name: string
        }
      }>
    }
  }
  '/user/list': {
    err: Routes['/auth/login']['err']
    ok: {
      result: 'ok'
      response: 'collection'
      total: number
      data: Array<{
        id: string
        type: 'custom_list'
        attributes: {
          name: string
          visibility: 'private' | 'public'
        }
        relationships: Array<{
          id: string
          type: 'manga' | 'user'
        }>
      }>
    }
  }
  '/user/{id}/list': {
    err: Routes['/auth/login']['err']
    ok: {
      result: 'ok'
      response: 'collection'
      data: Array<{
        id: string
        type: 'custom_list'
        attributes: {
          name: string
          visibility: string
          version: number
        }
        relationships: Array<{
          id: string
          type: 'manga' | 'user'
        }>
      }>
    }
  }
}
