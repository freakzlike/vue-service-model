import { BaseModel } from './BaseModel'
import { ModelManager } from './ModelManager'
import cu from '../utils/common'
import store from '../store'
import { ServiceStoreFactory, ServiceStore } from '../store/ServiceStoreFactory'
import { ServiceParent } from '../types/models/ServiceModel'

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
   * Saved instance of ModelManager
   */
  private static __modelManager: any

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
    if (!Object.prototype.hasOwnProperty.call(this, '__modelManager')) {
      this.register()

      const ServiceClass = this.ModelManager
      this.__modelManager = new ServiceClass(this)
    }

    return this.__modelManager
  }

  /**
   * Manager class of model
   */
  public static ModelManager = ModelManager

  /**
   * Check whether all required parent values have been given
   * @param parents
   */
  public static checkServiceParents (parents?: ServiceParent): boolean {
    const _parents = parents || {}

    if (this.parents.length < Object.keys(_parents).length) {
      console.warn('Too much parents given', this.name, _parents)
      return false
    } else if (this.parents.length > 0) {
      const missingParents = this.parents.filter(name => !_parents[name])
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
