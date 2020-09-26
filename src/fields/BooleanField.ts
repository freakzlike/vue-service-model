import { FormatStringField } from './FormatStringField'
import { CreateElement, VNode } from 'vue'
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
   * Parse value and convert to boolean
   */
  public async valueParser (rawValue: any): Promise<boolean> {
    return Boolean(rawValue)
  }

  /**
   * Simple Vue render function when using default inputComponent for input of field value with <input-field/>
   */
  public inputRender (h: CreateElement, { value, inputProps }: InputRenderData): VNode {
    const { disabled, readonly } = inputProps

    return h('input', {
      attrs: {
        type: 'checkbox',
        checked: Boolean(value),
        disabled
      },
      on: {
        click: (event: InputEvent) => {
          if (readonly) {
            event.preventDefault()
          }
        },
        change: (event: InputEvent) => {
          const target = event.target as { checked?: boolean }
          this.setParseValue(target.checked)
        }
      }
    })
  }
}
