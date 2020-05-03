import Dictionary from '../types/Dictionary'
import { ServiceModel } from './ServiceModel'
import { ServiceStoreOptions } from '../types/store/ServiceStore'
import axios, { AxiosRequestConfig } from 'axios'
import { configHandler } from '../utils/ConfigHandler'
import {
  ResponseData,
  RetrieveInterfaceParams,
  PrimaryKey,
  DeleteInterfaceParams,
  CreateInterfaceParams,
  UpdateInterfaceParams
} from '../types/models/ModelManager'
import {
  APIException,
  BadRequestAPIException,
  UnauthorizedAPIException,
  ForbiddenAPIException,
  NotFoundAPIException,
  InternalServerErrorAPIException
} from '../exceptions/APIExceptions'

/**
 * ModelManager
 * Provides interface for model to retrieve data from backend api
 */
export class ModelManager {
  public model: typeof ServiceModel

  constructor (model: typeof ServiceModel) {
    this.model = model
  }

  /**
   * Fill ServiceStoreOptions default options from params
   */
  protected getServiceStoreOptions (options: ServiceStoreOptions, params: RetrieveInterfaceParams | undefined): ServiceStoreOptions {
    return {
      noCache: Boolean(params && params.noCache),
      noRequestAggregation: Boolean(params && params.noRequestAggregation),
      refreshCache: Boolean(params && params.refreshCache),
      ...options
    }
  }

  /**
   * Retrieve specific model instance from service
   */
  public async detail (pk: PrimaryKey, params?: RetrieveInterfaceParams): Promise<ServiceModel> {
    const parents = params && params.parents
    const Model = this.model

    const data: Dictionary<any> = await this.retrieveDetailData(pk, params)
    return new Model(data, parents)
  }

  /**
   * Retrieve list of model instances from service
   */
  public async list (params?: RetrieveInterfaceParams): Promise<Array<ServiceModel>> {
    const _params = { ...(params || {}) }

    // Disable cache of list requests by default
    if (!Object.prototype.hasOwnProperty.call(_params, 'noCache')) {
      _params.noCache = true
    }

    const Model = this.model
    const url = await Model.getListUrl(_params.parents)

    // Build key for request by url and filter
    const keyBuilder = [url]
    if (_params.filter && Object.keys(_params.filter).length > 0) {
      keyBuilder.push(JSON.stringify(_params.filter))
    }

    // Retrieve ServiceStoreOptions
    const options = this.getServiceStoreOptions({
      key: keyBuilder.join('?'),
      sendRequest: this.sendListRequest.bind(this),
      args: [url, _params]
    }, _params)

    const dataList: Array<ResponseData> = await Model.store.getData(options)
    return dataList.map(data => new Model(data, _params.parents))
  }

  /**
   * Create single instance
   */
  public async create (data: any, params?: CreateInterfaceParams): Promise<any> {
    const parents = params && params.parents

    const Model = this.model
    const url = await Model.getListUrl(parents)
    return this.sendCreateRequest(url, data, params)
  }

  /**
   * Update single instance
   */
  public async update (pk: PrimaryKey, data: any, params?: UpdateInterfaceParams): Promise<any> {
    const parents = params && params.parents

    const Model = this.model
    const url = await Model.getDetailUrl(pk, parents)
    if (params && params.partial) {
      return this.sendPartialUpdateRequest(url, pk, data, params)
    } else {
      return this.sendUpdateRequest(url, pk, data, params)
    }
  }

  /**
   * Delete single instance
   */
  public async delete (pk: PrimaryKey, params?: DeleteInterfaceParams): Promise<null> {
    const parents = params && params.parents

    const Model = this.model
    const url = await Model.getDetailUrl(pk, parents)
    return this.sendDeleteRequest(url, pk, params)
  }

  /**
   * Build config for axios retrieve request
   */
  public async buildRetrieveRequestConfig (params?: RetrieveInterfaceParams): Promise<any> {
    if (!params) return {}

    const config: AxiosRequestConfig = {}
    if (params.filter && Object.keys(params.filter).length) {
      config.params = params.filter
    }
    return config
  }

  /**
   * Retrieve detail data from ServiceStore
   */
  public async retrieveDetailData (pk: PrimaryKey, params?: RetrieveInterfaceParams): Promise<Dictionary<any>> {
    const parents = params && params.parents
    const Model = this.model

    const url = await Model.getDetailUrl(pk, parents)
    const options = this.getServiceStoreOptions({
      key: url,
      sendRequest: this.sendDetailRequest.bind(this),
      args: [url, pk, params]
    }, params)
    return Model.store.getData(options)
  }

  /**
   * Send actual detail service request and map data before caching
   */
  public async sendDetailRequest (
    options: ServiceStoreOptions,
    url: string,
    pk: PrimaryKey,
    params?: RetrieveInterfaceParams
  ): Promise<ResponseData> {
    const requestConfig = await this.buildRetrieveRequestConfig(params)

    configHandler.emitEvent('onSendDetailRequest', [{ modelManager: this, url, pk, params }])

    let response
    try {
      response = await axios.get(url, requestConfig)
    } catch (error) {
      throw await this.handleResponseError(error)
    }

    return this.mapDetailResponseBeforeCache(options, response.data, url, pk, params)
  }

  /**
   * Map raw response data from detail service request before cache
   */
  public async mapDetailResponseBeforeCache (
    options: ServiceStoreOptions,
    data: Array<ResponseData>,
    url: string,
    pk: PrimaryKey,
    params?: RetrieveInterfaceParams
  ): Promise<ResponseData> {
    return data
  }

  /**
   * Send actual list service request and map data before caching
   */
  public async sendListRequest (
    options: ServiceStoreOptions,
    url: string,
    params?: RetrieveInterfaceParams
  ): Promise<Array<ResponseData>> {
    const requestConfig = await this.buildRetrieveRequestConfig(params)

    configHandler.emitEvent('onSendListRequest', [{ modelManager: this, url, params }])

    let response
    try {
      response = await axios.get(url, requestConfig)
    } catch (error) {
      throw await this.handleResponseError(error)
    }

    return this.mapListResponseBeforeCache(options, response.data, url, params)
  }

  /**
   * Map raw response data from list service request before cache
   */
  public async mapListResponseBeforeCache (
    options: ServiceStoreOptions,
    data: Array<ResponseData>,
    url: string,
    params?: RetrieveInterfaceParams
  ): Promise<Array<ResponseData>> {
    return data
  }

  /**
   * Send actual create (POST) service request
   */
  public async sendCreateRequest (url: string, data: any, params?: CreateInterfaceParams): Promise<any> {
    configHandler.emitEvent('onSendCreateRequest', [{ modelManager: this, url, data, params }])

    let response
    try {
      response = await axios.post(url, data)
    } catch (error) {
      throw await this.handleResponseError(error)
    }
    return response.data
  }

  /**
   * Send actual update (PUT) service request
   */
  public async sendUpdateRequest (url: string, pk: PrimaryKey, data: any, params?: UpdateInterfaceParams): Promise<any> {
    configHandler.emitEvent('onSendUpdateRequest', [{ modelManager: this, url, pk, data, params }])

    let response
    try {
      response = await axios.put(url, data)
    } catch (error) {
      throw await this.handleResponseError(error)
    }
    return response.data
  }

  /**
   * Send actual partial update (PATCH) service request
   */
  public async sendPartialUpdateRequest (url: string, pk: PrimaryKey, data: any, params?: UpdateInterfaceParams): Promise<any> {
    configHandler.emitEvent('onSendPartialUpdateRequest', [{ modelManager: this, url, pk, data, params }])

    let response
    try {
      response = await axios.patch(url, data)
    } catch (error) {
      throw await this.handleResponseError(error)
    }
    return response.data
  }

  /**
   * Send actual delete (DELETE) service request
   */
  public async sendDeleteRequest (url: string, pk: PrimaryKey, params?: DeleteInterfaceParams): Promise<null> {
    configHandler.emitEvent('onSendDeleteRequest', [{ modelManager: this, url, pk, params }])

    try {
      await axios.delete(url)
    } catch (error) {
      throw await this.handleResponseError(error)
    }
    return null
  }

  /**
   * Receive error from service and map to api exceptions
   */
  public async handleResponseError (error: any) {
    configHandler.emitEvent('onResponseError', [{ modelManager: this, error }])

    if (error.response) {
      switch (error.response.status) {
        case BadRequestAPIException.statusCode:
          return new BadRequestAPIException(error.response)
        case UnauthorizedAPIException.statusCode:
          return new UnauthorizedAPIException(error.response)
        case ForbiddenAPIException.statusCode:
          return new ForbiddenAPIException(error.response)
        case NotFoundAPIException.statusCode:
          return new NotFoundAPIException(error.response)
        case InternalServerErrorAPIException.statusCode:
          return new InternalServerErrorAPIException(error.response)
        default:
          return new APIException(error.response)
      }
    } else {
      return error
    }
  }
}
