import { FormatStringField } from './FormatStringField'
import { VNode, h } from 'vue'
import { InputRenderData } from '../types/fields/Field'

export class IntegerField extends FormatStringField {
  /**
   * Simple Vue render function when using default inputComponent for input of field value with <input-field/>
   */
  public inputRender ({ value, inputProps }: InputRenderData): VNode {
    const { disabled, readonly } = inputProps

    return h('input', {
      type: 'number',
      value,
      disabled,
      readonly,
      onInput: (event: InputEvent) => {
        const target = event.target as { value?: any }
        this.value = parseInt(target.value)
      }
    })
  }
}
