import { isNull } from '../utils/common'
import { FormatStringField } from './FormatStringField'

export class CharField extends FormatStringField {
  /**
   * Parse value and convert to null or String
   */
  public async valueParser (rawValue: any): Promise<string | null> {
    return (rawValue === '' || isNull(rawValue)) ? null : String(rawValue)
  }
}
