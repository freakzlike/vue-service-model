import Dictionary from '../Dictionary'
import { ServiceParent } from '../models/ServiceModel'

type FilterParams = Dictionary<any>
type ResponseData = Dictionary<any>

interface RetrieveInterfaceParams {
  /**
   * Service parents to handle nested RESTful services
   */
  parents?: ServiceParent,
  /**
   * Filter params as plain object which will be converted to query parameters (params in axios)
   */
  filter?: FilterParams
}

export {
  FilterParams,
  ResponseData,
  RetrieveInterfaceParams
}
