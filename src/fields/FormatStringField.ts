import cu from '../utils/common'
import { Field } from './Field'

export class FormatStringField extends Field {
  /**
   * Prepare formatted value for display render
   */
  public async prepareDisplayRender (): Promise<any> {
    return this.valueFormatter()
  }

  /**
   * Format the value to a string
   */
  public async valueFormatter (): Promise<string | null> {
    const value = await this.value
    return !cu.isNull(value) ? String(value) : null
  }
}
