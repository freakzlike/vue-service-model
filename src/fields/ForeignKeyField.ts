import { CreateElement, VNode } from 'vue'
import cu from '../utils/common'
import { Field } from './Field'
import { FieldTypeOptions } from '../types/fields/Field'
import { ServiceModel } from '../models/ServiceModel'
import { InvalidFieldOptionsException, RequiredFieldOptionsException } from '../exceptions/FieldExceptions'
import { FormatStringField } from './FormatStringField'

export interface ForeignKeyFieldOptions extends FieldTypeOptions {
  model: typeof ServiceModel
  fieldName: string
}

export interface DisplayRenderData {
  field: Field | null
  displayField: any
}

export interface InputSelectList {
  value: string
  text: string | null
}

export interface InputRenderData {
  value: any
  list: InputSelectList[]
}

export class ForeignKeyField extends Field {
  /**
   * Return instance of relation model as value
   */
  public async getValue (): Promise<any> {
    const value = await super.getValue()
    if (cu.isNull(value)) return null

    const options = await this.options as ForeignKeyFieldOptions
    const model = options.model
    return model.objects.detail(value)
  }

  /**
   * Validate field options
   */
  protected async validateOptions (options: ForeignKeyFieldOptions): Promise<ForeignKeyFieldOptions> {
    options = await super.validateOptions(options) as ForeignKeyFieldOptions

    if (!options.model) {
      throw new RequiredFieldOptionsException(this, 'options.model')
    }
    if (!options.fieldName) {
      throw new RequiredFieldOptionsException(this, 'options.fieldName')
    }

    if (!(options.model.prototype as any instanceof ServiceModel)) {
      throw new InvalidFieldOptionsException(this, 'options.model', 'Model does not inherit from ServiceModel')
    }

    return options
  }

  /**
   * Retrieve field from relation model
   */
  public async prepareDisplayRender (): Promise<DisplayRenderData> {
    const instance = await this.value
    if (instance === null) {
      return {
        field: null,
        displayField: null
      }
    }

    const options = await this.options as ForeignKeyFieldOptions
    return {
      displayField: await import('../components/DisplayField').then(mod => mod.default),
      field: instance.getField(options.fieldName)
    }
  }

  /**
   * Render DisplayField with foreign field
   */
  public displayRender (h: CreateElement, { field, displayField }: DisplayRenderData): VNode {
    return h(displayField, { props: { field } })
  }

  /**
   * Prepare value and list of entries for inputRender
   */
  public async prepareInputRender (): Promise<InputRenderData> {
    const [value, options] = await Promise.all([super.getValue(), this.options as Promise<ForeignKeyFieldOptions>])

    return {
      value: !cu.isNull(value) ? String(value) : null,
      list: await this.mapInputSelectList(options)
    }
  }

  /**
   * Retrieve and map input select list
   */
  public async mapInputSelectList (options: ForeignKeyFieldOptions): Promise<InputSelectList[]> {
    const data = await this.getInputSelectList(options)
    return Promise.all(data.map(async entry => {
      const pk = entry.pk
      if (cu.isNull(pk)) {
        console.warn('[vue-service-model] No primary key defined for model', entry.cls.name)
      }

      const field = entry.getField(options.fieldName)
      let text
      if (field instanceof FormatStringField) {
        text = await field.valueFormatter()
      } else {
        console.error('[vue-service-model] Cannot use non string field for ForeignKeyField input. Used field name:',
          field.name)
        text = 'unknown'
      }

      return {
        value: String(pk),
        text
      }
    }))
  }

  /**
   * Retrieve input select list
   */
  public async getInputSelectList (options: ForeignKeyFieldOptions): Promise<ServiceModel[]> {
    return options.model.objects.list()
  }

  /**
   * Render select input element and options
   */
  public inputRender (h: CreateElement, { value, list }: InputRenderData): VNode {
    return h('select', {
      on: {
        input: (event: InputEvent) => {
          const target = event.target as { value?: any }
          this.value = target.value
        }
      }
    }, list.map(entry => h('option', {
      attrs: {
        value: entry.value,
        selected: value !== null && value === entry.value
      }
    }, entry.text)))
  }
}
