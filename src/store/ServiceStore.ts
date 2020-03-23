import Dictionary from '../types/Dictionary'
import { ServiceStoreStateData, ServiceStoreOptions } from '../types/store/ServiceStore'

export class ServiceStore {
  /**
   * Dictionary of cached data structure by options.key
   */
  protected _data: Dictionary<ServiceStoreStateData>
  /**
   * Dictionary of started requests by options.key
   */
  protected _requests: Dictionary<Promise<any>>
  /**
   * Default cache duration in seconds.
   * 0: no cache
   * null: Cache does not expire
   */
  protected cacheDuration: number | null

  constructor (cacheDuration: number | null) {
    this.cacheDuration = cacheDuration
    this._data = {}
    this._requests = {}
  }

  /**
   * Get data of options.key either from cache or by calling options.sendRequest
   * @param options
   */
  public async getData (options: ServiceStoreOptions): Promise<any> {
    const key = options.key

    const useCache = this.useCache(options)

    // Retrieve data from cache
    if (useCache && Object.prototype.hasOwnProperty.call(this._data, key)) {
      const data = this._data[key]
      // Cache expired
      if (!data.expires || data.expires > Date.now()) {
        return data.data
      }
    }

    return this.loadData(options)
  }

  /**
   * Loads data by calling options.sendRequest. If request of same key has already started return attach to this request
   * @param options
   */
  async loadData (options: ServiceStoreOptions): Promise<any> {
    const key = options.key

    // Request with key has already been started
    const aggregatedRequest = this.getRequestAggregation(options)
    if (aggregatedRequest) return aggregatedRequest

    // Actual request and save result in cache
    const request = options.sendRequest(options, ...(options.args || [])).then(data => {
      if (!options.noCache) {
        this._setData(key, data)
      }
      this.removeRequest(key)

      return data
    }, error => {
      this.removeRequest(key)
      throw error
    })

    if (!options.noRequestAggregation) {
      this._setRequest(key, request)
    }
    return request
  }

  /**
   * Save data in cache if required
   * @param key
   * @param data
   */
  protected _setData (key: string, data: Dictionary<any>) {
    if (this.cacheDuration !== 0) {
      const _data: ServiceStoreStateData = { data }

      if (this.cacheDuration !== null) {
        _data.expires = Date.now() + (this.cacheDuration * 1000)
      }

      this._data[key] = _data
    }
  }

  /**
   * Save started request promise
   * @param key
   * @param request
   */
  protected _setRequest (key: string, request: Promise<any>) {
    this._requests[key] = request
  }

  /**
   * Check whether data should be retrieved from cache or not
   * @param options
   */
  protected useCache (options: ServiceStoreOptions): boolean {
    return !options.noCache && !options.refreshCache
  }

  /**
   * Check whether request is already in queue and return request promise if so
   * @param options
   */
  protected getRequestAggregation (options: ServiceStoreOptions): Promise<any> | null {
    if (options.noRequestAggregation) return null

    const key = options.key
    if (Object.prototype.hasOwnProperty.call(this._requests, key)) {
      return this._requests[key]
    }

    return null
  }

  /**
   * Remove request promise
   * @param key
   */
  public removeRequest (key: string) {
    delete this._requests[key]
  }

  /**
   * Clean up data and remove expired cache
   */
  public clean () {
    let key
    const expiredTime = Date.now()
    for (key of Object.keys(this._data)) {
      const expires = this._data[key].expires
      if (expires && expires < expiredTime) {
        delete this._data[key]
      }
    }
  }

  /**
   * clear complete cache
   */
  public clear () {
    this._data = {}
    this._requests = {}
  }
}
