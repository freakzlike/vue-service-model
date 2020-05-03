/**
 * Internal cached data structure
 */
export interface ServiceStoreStateData {
  /**
   * Contains UNIX Timestamp when the cache will expire
   */
  expires?: number
  /**
   * Actual cached data
   */
  data: any
}

/**
 * Interface for input options
 */
export interface ServiceStoreOptions {
  /**
   * key to identify equal requests and data from cache
   */
  key: string
  /**
   * Callback to perform actual service request. Should return result data which will be cached
   */
  sendRequest: (options: ServiceStoreOptions, ...args: Array<any>) => Promise<any>
  /**
   * Additional arguments for the sendRequest callback
   */
  args?: Array<any>
  /**
   * Do not use and set response cache. Requests will still be aggregated
   */
  noCache?: boolean
  /**
   * Do not use request aggregation. Response will still be set and used from cache
   */
  noRequestAggregation?: boolean
  /**
   * Cache will not be used but set. Requests will still be aggregated
   */
  refreshCache?: boolean
}
