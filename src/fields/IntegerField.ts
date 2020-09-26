import { isNull } from '../utils/common'
import { FormatStringField } from './FormatStringField'
import { CreateElement, VNode } from 'vue'
import { InputRenderData } from '../types/fields/Field'

export class IntegerField extends FormatStringField {
  /**
   * Simple Vue render function when using default inputComponent for input of field value with <input-field/>
   */
  public inputRender (h: CreateElement, { value, inputProps }: InputRenderData): VNode {
    const { disabled, readonly } = inputProps

    return h('input', {
      attrs: {
        type: 'number',
        value,
        disabled,
        readonly
      },
      on: {
        input: (event: InputEvent) => {
          const target = event.target as { value?: any }
          this.setParseValue(target.value)
        }
      }
    })
  }

  /**
   * Parse value and convert to number or null
   */
  public async valueParser (rawValue: any): Promise<number | null> {
    return isNull(rawValue) ? null : parseInt(rawValue)
  }
}
