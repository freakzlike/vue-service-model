import { FormatStringField } from './FormatStringField'
import { FieldTypeOptions, InputProps } from '../types/fields/Field'
import { VNode, h } from 'vue'

export interface DecimalFieldOptions extends FieldTypeOptions {
  // Set number of decimal places
  decimalPlaces: number
}

export interface DecimalFieldInputRenderData {
  value: any
  decimalPlaces: number
  inputProps: InputProps
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
  public async prepareInputRender (inputProps: InputProps): Promise<DecimalFieldInputRenderData> {
    const [value, options] = await Promise.all([
      this.value,
      this.options as Promise<DecimalFieldOptions>
    ])

    return {
      value,
      decimalPlaces: options.decimalPlaces,
      inputProps
    }
  }

  public inputRender ({ value, decimalPlaces, inputProps }: DecimalFieldInputRenderData): VNode {
    const { disabled, readonly } = inputProps
    const step = Math.pow(0.1, decimalPlaces).toPrecision(1)

    return h('input', {
      type: 'number',
      value,
      step,
      disabled,
      readonly,
      onInput: (event: InputEvent) => {
        const target = event.target as { value?: any }
        this.value = parseFloat(target.value)
      }
    })
  }
}
