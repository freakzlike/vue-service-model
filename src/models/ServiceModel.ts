import { BaseModel } from './BaseModel'
import { ModelManager } from './ModelManager'
import cu from '../utils/common'
import { ServiceStore } from '../store/ServiceStore'
import { ServiceParent } from '../types/models/ServiceModel'
import { MissingUrlException } from '../exceptions/ModelExceptions'
import { PrimaryKey } from '../types/models/ModelManager'
import Dictionary from '../types/Dictionary'

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
    BASE?: string | null
    LIST?: string | null
    DETAIL?: string | null
  } | string = {}

  /**
   * List of parent names to be used in url
   */
  protected static parentNames: string[] = []

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
   * Parents of current model instance
   */
  protected _parents: ServiceParent

  /**
   * Manager class of model
   */
  public static ModelManager = ModelManager

  /**
   * Constructor
   */
  constructor (data: Dictionary<any> = {}, parents: ServiceParent = {}) {
    super(data)
    this._parents = cu.clone(parents)
  }

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
   */
  public static async getListUrl (parents?: ServiceParent): Promise<string> {
    this.checkServiceParents(parents)

    const url: string = (() => {
      if (typeof this.urls === 'string') {
        return this.urls
      } else if (this.urls.LIST) {
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
   */
  public static async getDetailUrl (pk: PrimaryKey, parents?: ServiceParent): Promise<string> {
    this.checkServiceParents(parents)

    const url: string = (() => {
      if (typeof this.urls === 'string') {
        return this.urls + '{pk}/'
      } else if (this.urls.DETAIL) {
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
  public static get objects (): ModelManager {
    if (!Object.prototype.hasOwnProperty.call(this, '__modelManager')) {
      this.register()

      const ServiceClass = this.ModelManager
      this.__modelManager = new ServiceClass(this)
    }

    return this.__modelManager
  }

  /**
   * Return model parents
   */
  public get parents (): ServiceParent {
    return this._parents
  }

  /**
   * Set deep copy of model parents to avoid unwanted mutations
   */
  public set parents (parents: ServiceParent) {
    this._parents = cu.clone(parents)
  }

  /**
   * Check whether all required parent values have been given
   * @param parents
   */
  public static checkServiceParents (parents?: ServiceParent): boolean {
    const _parents = parents || {}

    if (this.parentNames.length < Object.keys(_parents).length) {
      console.error('[vue-service-model] Too much parents given', this.name, _parents)
      return false
    } else if (this.parentNames.length > 0) {
      const missingParents = this.parentNames.filter(name => !_parents[name])
      if (missingParents.length) {
        console.error('[vue-service-model] Missing parents', this.name, missingParents)
        return false
      }
    }

    return true
  }

  /**
   * Reload model data from service. Overwrites changes made to model data
   * Returns true if successful
   */
  public async reload (): Promise<boolean> {
    const pk = this.pk
    if (pk === null) return false

    const cls = this.constructor as typeof ServiceModel
    this.data = await cls.objects.retrieveDetailData(pk, {
      refreshCache: true,
      parents: this.parents
    })

    return true
  }

  /**
   * Call either .create() or .update() by checking whether primary key is set or not
   * Returns true if create has been called
   */
  public async save (): Promise<boolean> {
    if (this.pk === null) {
      await this.create()
      return true
    } else {
      await this.update()
      return false
    }
  }

  /**
   * Create current model instance by calling objects.create()
   * Updates model data from response if set
   * Returns true if successful
   */
  public async create (): Promise<boolean> {
    const cls = this.constructor as typeof ServiceModel
    const data = await cls.objects.create(this.data, {
      parents: this.parents
    })

    if (data && Object.keys(data).length) {
      this.data = data
    }

    return true
  }

  /**
   * Update current model instance by calling objects.update()
   * Updates model data from response if set
   * Returns true if successful
   */
  public async update (): Promise<boolean> {
    const pk = this.pk
    if (pk === null) return false

    const cls = this.constructor as typeof ServiceModel
    const data = await cls.objects.update(pk, this.data, {
      parents: this.parents
    })

    if (data && Object.keys(data).length) {
      this.data = data
    }

    return true
  }

  /**
   * Delete current model instance by calling objects.delete()
   * Returns true if successful
   */
  public async delete (): Promise<boolean> {
    const pk = this.pk
    if (pk === null) return false

    const cls = this.constructor as typeof ServiceModel
    await cls.objects.delete(pk, {
      parents: this.parents
    })

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
