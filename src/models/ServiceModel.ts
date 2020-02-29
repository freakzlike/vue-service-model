import Dictionary from '../types/Dictionary'
import { BaseModel } from './BaseModel'
import cu from '../utils/common'
import store from '../store'
import { ServiceStoreFactory, ServiceStore, ServiceStoreOptions } from '../store/ServiceStoreFactory'
import axios from 'axios'

type ServiceParent = Dictionary<string | number>

class MissingUrlException extends Error {
  constructor (modelName: string) {
    super('Missing url configuration in Model "' + modelName + '"')
    this.constructor = MissingUrlException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = MissingUrlException.prototype
  }
}

/**
 * ServiceModel
 * Model with service interface to retrieve data from backend api
 */
class ServiceModel extends BaseModel {
  /**
   * Default URL definition for backend APIs
   * Fill either LIST/DETAIL or BASE url or use other urls by overwriting getListUrl/getDetailUrl
   */
  protected static urls: {
    BASE?: string | null;
    LIST?: string | null;
    DETAIL?: string | null;
  } = {}

  /**
   * List of parent names to be used in url
   */
  protected static parents: Array<string> = []

  /**
   * Duration to cache requested data in seconds. 0: no cache. null: Cache forever
   */
  protected static cacheDuration: number | null = 30

  /**
   * Vuex store module factory to use
   */
  protected static storeFactory: typeof ServiceStoreFactory = ServiceStoreFactory

  /**
   * Function to return list url of model according to parents
   * @param parents
   */
  public static async getListUrl (parents?: ServiceParent): Promise<string> {
    this.checkServiceParents(parents)

    const url: string = (() => {
      if (this.urls.LIST) {
        return this.urls.LIST
      } else if (this.urls.BASE) {
        return this.urls.BASE
      } else {
        throw new MissingUrlException(this.name)
      }
    })()

    if (parents) {
      return cu.format(url, parents)
    } else {
      return url
    }
  }

  /**
   * Function to return detail url of model according to parents
   * @param pk
   * @param parents
   */
  public static async getDetailUrl (pk: string | number, parents?: ServiceParent): Promise<string> {
    this.checkServiceParents(parents)

    const url: string = (() => {
      if (this.urls.DETAIL) {
        return this.urls.DETAIL
      } else if (this.urls.BASE) {
        return this.urls.BASE + '{pk}/'
      } else {
        throw new MissingUrlException(this.name)
      }
    })()

    return cu.format(url, {
      pk,
      ...parents || {}
    })
  }

  /**
   * Retrieve instance of ModelManager
   */
  public static get objects () {
    this.register()

    const ServiceClass = this.ModelManager
    return new ServiceClass(this)
  }

  /**
   * Manager class of model
   */
  public static ModelManager = class {
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

      const keyBuilder = ['detail', pk.toString()]
      if (parents && Object.keys(parents).length > 0) {
        keyBuilder.push(JSON.stringify(parents))
      }

      const options: ServiceStoreOptions = {
        key: keyBuilder.join('#'),
        sendRequest: async (options: ServiceStoreOptions): Promise<Array<Dictionary<any>>> => {
          const url = await this.model.getDetailUrl(pk, parents)
          const response = await axios.get(url)

          return response.data
        }
      }

      const data: Dictionary<any> = await Model.storeDispatch('getData', options)
      return new Model(data)
    }

    /**
     * Retrieve filtered list of all model instances
     * @param filterParams
     * @param parents
     */
    public async filter (filterParams: Dictionary<any>, parents?: ServiceParent): Promise<Array<ServiceModel>> {
      const Model = this.model
      Model.checkServiceParents(parents)

      const keyBuilder = ['list']
      if (filterParams && Object.keys(filterParams).length > 0) {
        keyBuilder.push(JSON.stringify(filterParams))
      }
      if (parents && Object.keys(parents).length > 0) {
        keyBuilder.push(JSON.stringify(parents))
      }

      const options: ServiceStoreOptions = {
        key: keyBuilder.join('#'),
        sendRequest: async (options: ServiceStoreOptions): Promise<Array<Dictionary<any>>> => {
          const url = await this.model.getListUrl(parents)
          const config = Object.keys(filterParams).length ? { params: filterParams } : {}
          const response = await axios.get(url, config)

          return response.data
        }
      }

      const dataList: Array<Dictionary<any>> = await Model.storeDispatch('getData', options)
      return dataList.map(data => new Model(data))
    }
  }

  /**
   * Check whether all required parent values have been given
   * @param parents
   */
  public static checkServiceParents (parents: ServiceParent = {}): boolean {
    if (this.parents.length < Object.keys(parents).length) {
      console.warn('Too much parents given', this.name, parents)
      return false
    } else if (this.parents.length > 0) {
      const missingParents = this.parents.filter(name => !parents[name])
      if (missingParents.length) {
        console.warn('Missing parents', this.name, missingParents)
        return false
      }
    }

    return true
  }

  /**
   * Return name of vuex store
   */
  public static get storeName (): string {
    if (!this.keyName) {
      console.warn('Missing keyName for Model', this.name)
    }
    const keyName = this.keyName || this.name
    return 'service/' + keyName
  }

  /**
   * Dispatch vuex store action
   * @param action
   * @param payload
   */
  public static storeDispatch (action: string, payload?: any): Promise<any> {
    this.register()

    const actionName = this.storeName + '/' + action
    return store.dispatch(actionName, payload)
  }

  /**
   * Register model and vuex store
   */
  public static register (): boolean {
    if (!super.register()) return false

    store.registerModule(this.storeName, this.createStoreModule())
    return true
  }

  /**
   * Create vuex store module from storeFactory
   */
  protected static createStoreModule (): ServiceStore {
    return this.storeFactory(this.cacheDuration)
  }
}

export { ServiceModel, ServiceParent, MissingUrlException }
