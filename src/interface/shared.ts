import { type mirrorsLangsType } from 'fukayo-langs'

export interface SourceResponse<T> { success: true, data: T }
export interface SourceError {
  success: false
  message: 'init_error' | 'unknown_error' | string
}

export function isSourceError<T> (input: T | SourceError): input is SourceError {
  return typeof input !== 'undefined' &&
    typeof (input as SourceError).success !== 'undefined' &&
    (input as SourceError).success
}

export type searchResponse = SourceResponse<Array<{
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
}>>
