import Dictionary from '../types/Dictionary'
import { ServiceModel } from './ServiceModel'
import { ServiceStoreOptions } from '../store/ServiceStoreFactory'
import axios, { AxiosRequestConfig } from 'axios'
import { FilterParams, ResponseData, RetrieveInterfaceParams } from '../types/models/ModelManager'

/**
 * ModelManager
 * Provides interface for model to retrieve data from backend api
 */
class ModelManager {
  public model: typeof ServiceModel

  constructor (model: typeof ServiceModel) {
    this.model = model
  }

  /**
   * Retrieve specific model instance
   * @param pk
   * @param params
   */
  public async detail (pk: string | number, params?: RetrieveInterfaceParams): Promise<ServiceModel> {
    const parents = params && params.parents

    const Model = this.model
    Model.checkServiceParents(parents)

    const url = await Model.getDetailUrl(pk, parents)

    const options: ServiceStoreOptions = {
      key: url,
      sendRequest: this.sendDetailRequest.bind(this),
      args: [url, pk, params]
    }

    const data: Dictionary<any> = await Model.storeDispatch('getData', options)
    return new Model(data)
  }

  /**
   * Retrieve list of all model instances
   * @param params
   */
  public async list (params?: RetrieveInterfaceParams): Promise<Array<ServiceModel>> {
    const parents = params && params.parents
    const filterParams = params && params.filter

    const Model = this.model
    Model.checkServiceParents(parents)

    const url = await this.model.getListUrl(parents)
    const keyBuilder = [url]
    if (filterParams && Object.keys(filterParams).length > 0) {
      keyBuilder.push(JSON.stringify(filterParams))
    }

    const options: ServiceStoreOptions = {
      key: keyBuilder.join('?'),
      sendRequest: this.sendListRequest.bind(this),
      args: [url, params]
    }

    const dataList: Array<ResponseData> = await Model.storeDispatch('getData', options)
    return dataList.map(data => new Model(data))
  }

  /**
   * Build config for axios retrieve request
   * @param params
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
   * Send actual detail service request and map data before caching
   * @param options
   * @param url
   * @param pk
   * @param params
   */
  public async sendDetailRequest (
    options: ServiceStoreOptions,
    url: string,
    pk: string | number,
    params?: RetrieveInterfaceParams
  ): Promise<ResponseData> {
    const config = await this.buildRetrieveRequestConfig(params)
    const response = await axios.get(url, config)

    return this.mapDetailResponseBeforeCache(options, response.data, url, pk, params)
  }

  /**
   * Map raw response data from detail service request before cache
   * @param options
   * @param data
   * @param url
   * @param pk
   * @param params
   */
  public async mapDetailResponseBeforeCache (
    options: ServiceStoreOptions,
    data: Array<ResponseData>,
    url: string,
    pk: string | number,
    params?: RetrieveInterfaceParams
  ): Promise<ResponseData> {
    return data
  }

  /**
   * Send actual list service request and map data before caching
   * @param options
   * @param url
   * @param params
   */
  public async sendListRequest (
    options: ServiceStoreOptions,
    url: string,
    params?: RetrieveInterfaceParams
  ): Promise<Array<ResponseData>> {
    const config = await this.buildRetrieveRequestConfig(params)
    const response = await axios.get(url, config)

    return this.mapListResponseBeforeCache(options, response.data, url, params)
  }

  /**
   * Map raw response data from list service request before cache
   * @param options
   * @param data
   * @param url
   * @param params
   */
  public async mapListResponseBeforeCache (
    options: ServiceStoreOptions,
    data: Array<ResponseData>,
    url: string,
    params?: RetrieveInterfaceParams
  ): Promise<Array<ResponseData>> {
    return data
  }
}

export { ModelManager, FilterParams, ResponseData }
