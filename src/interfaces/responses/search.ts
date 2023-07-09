import { type mirrorsLangsType } from 'fukayo-langs'

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
