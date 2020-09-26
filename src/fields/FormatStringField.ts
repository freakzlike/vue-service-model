import { isNull } from '../utils/common'
import { RenderableField } from './RenderableField'

export class FormatStringField extends RenderableField {
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
    return !isNull(value) ? String(value) : null
  }
}
