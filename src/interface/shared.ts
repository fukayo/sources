export interface SourceResponse<T> { success: true, data: T }
export interface SourceError {
  success: false
  message: 'init_error'
}

export function isSourceError<T> (input: T | SourceError): input is SourceError {
  return typeof input !== 'undefined' &&
    typeof (input as SourceError).success !== 'undefined' &&
    (input as SourceError).success
}
