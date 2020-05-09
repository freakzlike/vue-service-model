import { FormatStringField } from './FormatStringField'
import { CreateElement, VNode } from 'vue'
import { configHandler } from '../utils/ConfigHandler'

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
  public inputRender (h: CreateElement, renderData: any): VNode {
    return h('input', {
      attrs: {
        type: 'checkbox',
        checked: Boolean(renderData)
      },
      on: {
        change: (event: InputEvent) => {
          const target = event.target as { checked?: boolean }
          this.value = Boolean(target.checked)
        }
      }
    })
  }
}
