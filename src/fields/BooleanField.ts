import { FormatStringField } from './FormatStringField'
import { VNode, h } from 'vue'
import { configHandler } from '../utils/ConfigHandler'
import { InputRenderData } from '../types/fields/Field'

export class BooleanField extends FormatStringField {
  /**
   * Format boolean value to string
   */
  public async valueFormatter (): Promise<string | null> {
    const value = await this.value
    return value ? configHandler.getTranslation('yes') : configHandler.getTranslation('no')
  }

  /**
   * Simple Vue render function when using default inputComponent for input of field value with <input-field/>
   */
  public inputRender ({ value, inputProps }: InputRenderData): VNode {
    const { disabled, readonly } = inputProps

    return h('input', {
      type: 'checkbox',
      checked: Boolean(value),
      disabled,
      onClick: (event: InputEvent) => {
        if (readonly) {
          event.preventDefault()
        }
      },
      onChange: (event: InputEvent) => {
        const target = event.target as { checked?: boolean }
        this.value = Boolean(target.checked)
      }
    })
  }
}
