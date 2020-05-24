import { FormatStringField } from './FormatStringField'
import { FieldTypeOptions } from '../types/fields/Field'
import { CreateElement, VNode } from 'vue'

export interface DecimalFieldOptions extends FieldTypeOptions {
  // Set number of decimal places
  decimalPlaces: number
}

export interface InputRenderData {
  value: any
  decimalPlaces: number
}

export class DecimalField extends FormatStringField {
  /**
   * Validate field options
   */
  protected async validateOptions (options: DecimalFieldOptions): Promise<DecimalFieldOptions> {
    options = await super.validateOptions(options) as DecimalFieldOptions

    if (!Number.isInteger(options.decimalPlaces)) {
      console.error('[vue-service-model] Invalid options.decimalPlaces for DecimalField: ', options.decimalPlaces)
      options.decimalPlaces = 0
    }

    return options
  }

  /**
   * Prepare data for input render
   */
  public async prepareInputRender (): Promise<InputRenderData> {
    const [value, options] = await Promise.all([
      this.value,
      this.options as Promise<DecimalFieldOptions>
    ])

    return {
      value,
      decimalPlaces: options.decimalPlaces
    }
  }

  public inputRender (h: CreateElement, renderData: InputRenderData): VNode {
    const step = Math.pow(0.1, renderData.decimalPlaces).toPrecision(1)

    return h('input', {
      attrs: {
        type: 'number',
        value: renderData.value,
        step
      },
      on: {
        input: (event: InputEvent) => {
          const target = event.target as { value?: any }
          this.value = parseFloat(target.value)
        }
      }
    })
  }
}
