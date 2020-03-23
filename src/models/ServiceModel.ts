import { BaseModel } from './BaseModel'
import { ModelManager } from './ModelManager'
import cu from '../utils/common'
import { ServiceStore } from '../store/ServiceStore'
import { ServiceParent } from '../types/models/ServiceModel'
import { MissingUrlException } from '../exceptions/ModelExceptions'
import { PrimaryKey } from '../types/models/ModelManager'

/**
 * ServiceModel
 * Model with service interface to retrieve data from backend api
 */
export class ServiceModel extends BaseModel {
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
   * Cache store class to use
   */
  protected static storeClass: typeof ServiceStore = ServiceStore

  /**
   * Saved instance of ModelManager
   */
  private static __modelManager: any

  /**
   * Saved instance of ServiceStore cache
   */
  private static __store: ServiceStore

  /**
   * Getter to simulate static class property with fixed inheritance
   */
  public static get store (): ServiceStore {
    // Check whether model has property __modelRegistered and not inherited from super class
    if (!Object.prototype.hasOwnProperty.call(this, '__store')) {
      this.__store = this.createStoreModule()
    }

    return this.__store
  }

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
  public static async getDetailUrl (pk: PrimaryKey, parents?: ServiceParent): Promise<string> {
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
   * Create instance of store class
   */
  protected static createStoreModule (): ServiceStore {
    const ServiceStoreClass = this.storeClass
    return new ServiceStoreClass(this.cacheDuration)
  }
}
