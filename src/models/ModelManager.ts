import Dictionary from '../types/Dictionary'
import { ServiceModel, ServiceParent } from './ServiceModel'
import { ServiceStoreOptions } from '../store/ServiceStoreFactory'
import axios from 'axios'

type FilterParams = Dictionary<any>
type ResponseData = Dictionary<any>

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
   * Retrieve list of all model instances
   * @param parents
   */
  public async all (parents?: ServiceParent): Promise<Array<ServiceModel>> {
    return this.filter({}, parents)
  }

  /**
   * Retrieve specific model instance
   * @param pk
   * @param parents
   */
  public async get (pk: string | number, parents?: ServiceParent): Promise<ServiceModel> {
    const Model = this.model
    Model.checkServiceParents(parents)

    const url = await this.model.getDetailUrl(pk, parents)

    const options: ServiceStoreOptions = {
      key: url,
      sendRequest: this.sendDetailRequest.bind(this),
      args: [url]
    }

    const data: Dictionary<any> = await Model.storeDispatch('getData', options)
    return new Model(data)
  }

  /**
   * Retrieve filtered list of all model instances
   * @param filterParams
   * @param parents
   */
  public async filter (filterParams: FilterParams, parents?: ServiceParent): Promise<Array<ServiceModel>> {
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
      args: [url, filterParams]
    }

    const dataList: Array<ResponseData> = await Model.storeDispatch('getData', options)
    return dataList.map(data => new Model(data))
  }

  /**
   * Send actual detail service request and map data before caching
   * @param options
   * @param url
   */
  public async sendDetailRequest (options: ServiceStoreOptions, url: string): Promise<ResponseData> {
    const response = await axios.get(url)

    return this.mapDetailResponseBeforeCache(options, response.data, url)
  }

  /**
   * Map raw response data from detail service request before cache
   * @param options
   * @param data
   * @param url
   */
  public async mapDetailResponseBeforeCache (
    options: ServiceStoreOptions,
    data: Array<ResponseData>,
    url: string
  ): Promise<ResponseData> {
    return data
  }

  /**
   * Send actual list service request and map data before caching
   * @param options
   * @param url
   * @param filterParams
   */
  public async sendListRequest (
    options: ServiceStoreOptions,
    url: string,
    filterParams: FilterParams
  ): Promise<Array<ResponseData>> {
    const config = Object.keys(filterParams).length ? { params: filterParams } : {}
    const response = await axios.get(url, config)

    return this.mapListResponseBeforeCache(options, response.data, url, filterParams)
  }

  /**
   * Map raw response data from list service request before cache
   * @param options
   * @param data
   * @param url
   * @param filterParams
   */
  public async mapListResponseBeforeCache (
    options: ServiceStoreOptions,
    data: Array<ResponseData>,
    url: string,
    filterParams: FilterParams): Promise<Array<ResponseData>> {
    return data
  }
}

export { ModelManager, FilterParams, ResponseData }
