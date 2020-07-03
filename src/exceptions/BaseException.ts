export class BaseException extends Error {
  constructor (message: string) {
    super(`[vue-service-model] ${message}`)
  }
}
