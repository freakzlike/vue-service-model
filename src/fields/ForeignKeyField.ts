import { CreateElement, VNode } from 'vue'
import cu from '../utils/common'
import { Field } from './Field'
import { FieldTypeOptions } from '../types/fields/Field'
import { ServiceModel } from '../models/ServiceModel'
import { InvalidFieldOptionsException, RequiredFieldOptionsException } from '../exceptions/FieldExceptions'

export interface ForeignKeyFieldOptions extends FieldTypeOptions {
  model: typeof ServiceModel
  fieldName: string
}

export interface DisplayRenderData {
  field: Field | null
  displayField: any
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

  public displayRender (h: CreateElement, { field, displayField }: DisplayRenderData): VNode {
    return h(displayField, { props: { field } })
  }
}
