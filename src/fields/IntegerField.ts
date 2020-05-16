import { FormatStringField } from './FormatStringField'
import { CreateElement, VNode } from 'vue'

export class IntegerField extends FormatStringField {
  /**
   * Simple Vue render function when using default inputComponent for input of field value with <input-field/>
   */
  public inputRender (h: CreateElement, renderData: any): VNode {
    return h('input', {
      attrs: {
        type: 'number',
        value: renderData
      },
      on: {
        input: (event: InputEvent) => {
          const target = event.target as { value?: any }
          this.value = parseInt(target.value)
        }
      }
    })
  }
}
