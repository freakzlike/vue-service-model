import { CreateElement, VNode } from 'vue'
import { InputProps, InputRenderData } from '../types/fields/Field'
import { Field } from './Field'
import { ComponentModule } from '../types/components'

export class RenderableField extends Field {
  /**
   * Display component to render when displaying value with <display-field/>
   */
  public get displayComponent (): Promise<ComponentModule> {
    return import('../components/BaseDisplayFieldRender')
  }

  /**
   * Async function to prepare before displayRender gets called
   * Can return any data which needs to be resolved for displayRender
   */
  public async prepareDisplayRender (renderProps?: object | null): Promise<any> {
    return this.value
  }

  /**
   * Simple Vue render function when using default displayComponent when displaying value with <display-field/>
   */
  public displayRender (h: CreateElement, renderData: any): VNode {
    return h('span', renderData)
  }

  /**
   * Input component to render when showing input for field with <input-field/>
   */
  public get inputComponent (): Promise<ComponentModule> {
    return import('../components/BaseInputFieldRender')
  }

  /**
   * Async function to prepare before inputRender gets called
   * Can return any data which needs to be resolved for inputRender
   */
  public async prepareInputRender (inputProps: InputProps, renderProps?: object | null): Promise<InputRenderData> {
    return {
      value: await this.value,
      inputProps
    }
  }

  /**
   * Simple Vue render function when using default inputComponent for input of field value with <input-field/>
   */
  public inputRender (h: CreateElement, renderData: InputRenderData): VNode {
    const { disabled, readonly } = renderData.inputProps

    return h('input', {
      attrs: {
        type: 'text',
        value: renderData.value,
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
}
