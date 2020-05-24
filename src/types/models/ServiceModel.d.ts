import Dictionary from '../Dictionary'

export type ServiceParent = Dictionary<string | number>

export interface ServiceModelUpdateOptions {
  /**
   * List of field that should be send on update
   * If given then a partial update (PATCH) will be send
   */
  updateFields?: string[]
}
