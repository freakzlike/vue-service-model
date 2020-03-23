import {
  APIException,
  BadRequestAPIException,
  ForbiddenAPIException,
  InternalServerErrorAPIException,
  NotFoundAPIException,
  UnauthorizedAPIException
} from '@/exceptions/APIExceptions'
import { Response } from '@/types/models/ModelManager'

describe('exceptions/APIExceptions', () => {
  const getResponse = (status: number): Response => ({
    status,
    data: {},
    statusText: 'Test error',
    headers: null,
    config: {}
  })

  describe('APIException', () => {
    it('should return correct instance', async () => {
      const response = getResponse(0)
      expect(APIException.statusCode).toBeUndefined()

      const error = new APIException(response)
      expect(error).toBeInstanceOf(APIException)
      expect(error.message).toBe('Unhandled APIException')
      expect(error.response).toBe(response)
    })
  })

  describe('BadRequestAPIException', () => {
    it('should return correct instance', async () => {
      const response = getResponse(400)
      expect(BadRequestAPIException.statusCode).toBe(400)

      const error = new BadRequestAPIException(response)
      expect(error).toBeInstanceOf(APIException)
      expect(error).toBeInstanceOf(BadRequestAPIException)
      expect(error.message).toBe('Bad Request')
      expect(error.response).toBe(response)
    })
  })

  describe('UnauthorizedAPIException', () => {
    it('should return correct instance', async () => {
      const response = getResponse(401)
      expect(UnauthorizedAPIException.statusCode).toBe(401)

      const error = new UnauthorizedAPIException(response)
      expect(error).toBeInstanceOf(APIException)
      expect(error).toBeInstanceOf(UnauthorizedAPIException)
      expect(error.message).toBe('Unauthorized')
      expect(error.response).toBe(response)
    })
  })

  describe('ForbiddenAPIException', () => {
    it('should return correct instance', async () => {
      const response = getResponse(403)
      expect(ForbiddenAPIException.statusCode).toBe(403)

      const error = new ForbiddenAPIException(response)
      expect(error).toBeInstanceOf(APIException)
      expect(error).toBeInstanceOf(ForbiddenAPIException)
      expect(error.message).toBe('Forbidden')
      expect(error.response).toBe(response)
    })
  })

  describe('NotFoundAPIException', () => {
    it('should return correct instance', async () => {
      const response = getResponse(404)
      expect(NotFoundAPIException.statusCode).toBe(404)

      const error = new NotFoundAPIException(response)
      expect(error).toBeInstanceOf(APIException)
      expect(error).toBeInstanceOf(NotFoundAPIException)
      expect(error.message).toBe('Not Found')
      expect(error.response).toBe(response)
    })
  })

  describe('InternalServerErrorAPIException', () => {
    it('should return correct instance', async () => {
      const response = getResponse(500)
      expect(InternalServerErrorAPIException.statusCode).toBe(500)

      const error = new InternalServerErrorAPIException(response)
      expect(error).toBeInstanceOf(APIException)
      expect(error).toBeInstanceOf(InternalServerErrorAPIException)
      expect(error.message).toBe('Internal Server Error')
      expect(error.response).toBe(response)
    })
  })
})
