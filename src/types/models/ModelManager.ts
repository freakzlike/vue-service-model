import Dictionary from '../Dictionary'
import { ServiceParent } from '../models/ServiceModel'
import { AxiosResponse } from 'axios'

export type FilterParams = Dictionary<any>
export type ResponseData = Dictionary<any>
export type PrimaryKey = string | number

/**
 * Interface params for ModelManager detail and list
 */
export interface RetrieveInterfaceParams {
  /**
   * Service parents to handle nested RESTful services
   */
  parents?: ServiceParent,
  /**
   * Filter params as plain object which will be converted to query parameters (params in axios)
   */
  filter?: FilterParams
  /**
   * Do not use and set response cache. Requests will still be aggregated. Already cached data will not be cleared
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

/**
 * Interface params for ModelManager create
 */
export interface CreateInterfaceParams {
  /**
   * Service parents to handle nested RESTful services
   */
  parents?: ServiceParent
}

/**
 * Interface params for ModelManager update
 */
export interface UpdateInterfaceParams {
  /**
   * Service parents to handle nested RESTful services
   */
  parents?: ServiceParent
}

/**
 * Interface params for ModelManager delete
 */
export interface DeleteInterfaceParams {
  /**
   * Service parents to handle nested RESTful services
   */
  parents?: ServiceParent
}

export interface Response extends AxiosResponse {
}
