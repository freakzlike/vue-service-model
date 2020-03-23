import { Response } from '../types/models/ModelManager'

export class APIException extends Error {
  public static readonly statusCode: number

  private _response: Response

  constructor (response: Response, message: string = 'Unhandled APIException') {
    super(message)
    this.constructor = APIException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = APIException.prototype

    this._response = response
  }

  public get response () {
    return this._response
  }
}

/**
 * 400 Bad request
 */
export class BadRequestAPIException extends APIException {
  public static readonly statusCode: number = 400

  constructor (response: Response, message: string = 'Bad Request') {
    super(response, message)
    this.constructor = BadRequestAPIException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = BadRequestAPIException.prototype
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedAPIException extends APIException {
  public static readonly statusCode: number = 401

  constructor (response: Response, message: string = 'Unauthorized') {
    super(response, message)
    this.constructor = UnauthorizedAPIException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = UnauthorizedAPIException.prototype
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenAPIException extends APIException {
  public static readonly statusCode: number = 403

  constructor (response: Response, message: string = 'Forbidden') {
    super(response, message)
    this.constructor = ForbiddenAPIException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = ForbiddenAPIException.prototype
  }
}

/**
 * 404 Not found
 */
export class NotFoundAPIException extends APIException {
  public static readonly statusCode: number = 404

  constructor (response: Response, message: string = 'Not Found') {
    super(response, message)
    this.constructor = NotFoundAPIException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = NotFoundAPIException.prototype
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerErrorAPIException extends APIException {
  public static readonly statusCode: number = 500

  constructor (response: Response, message: string = 'Internal Server Error') {
    super(response, message)
    this.constructor = InternalServerErrorAPIException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = InternalServerErrorAPIException.prototype
  }
}
