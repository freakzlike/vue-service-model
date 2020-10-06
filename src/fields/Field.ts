import { h, VNode, reactive } from 'vue'
import cu from '../utils/common'
import { BaseClass } from '../utils/BaseClass'
import { FieldNotBoundException } from '../exceptions/FieldExceptions'
import {
  FieldDef,
  FieldBind,
  FieldTypeOptions,
  InputProps,
  InputRenderData
} from '../types/fields/Field'
import { BaseModel } from '../models'
import Dictionary from '../types/Dictionary'
import { ComponentModule } from '../types/components'

export class Field extends BaseClass {
  /**
   * Field definition
   */
  protected _def: FieldDef

  /**
   * Field name
   */
  protected _name: (string | null) = null

  /**
   * Model instance
   */
  protected _model: BaseModel | null = null

  /**
   * Data structure when using field without model
   */
  protected _data: Dictionary<any> | null = null

  constructor (def: FieldDef | null = {}, fieldBind?: FieldBind) {
    super()
    this._def = def || {}

    if (fieldBind) {
      this._name = fieldBind.name || null

      if (Object.prototype.hasOwnProperty.call(fieldBind, 'value')) {
        if (!this._name) {
          this._name = 'value'
        }

        this._model = null
        // Create private data structure to keep value reactive
        this._data = reactive({})
        this.value = fieldBind.value
      } else {
        this._model = fieldBind.model || null
        this._data = fieldBind.data ? reactive(fieldBind.data) : null
      }
    }
  }

  /**
   * Clone field instance
   */
  public clone (): Field {
    const FieldClass = this.cls as typeof Field

    const fieldBind: FieldBind = {}
    this._name && (fieldBind.name = this._name)
    this._model && (fieldBind.model = this._model)
    this._data && (fieldBind.data = this._data)

    return new FieldClass(this._def, fieldBind)
  }

  /**
   * Bind field with field name and return a new instance
   */
  public bind (fieldBind: FieldBind): Field {
    const FieldClass = this.cls as typeof Field
    return new FieldClass(this._def, fieldBind)
  }

  /**
   * Field name
   * Returns field name (Which has been set as key at fieldsDef)
   * Will throw FieldNotBoundException in case field has not been bound
   */
  public get name (): string {
    if (this._name === null) {
      throw new FieldNotBoundException(this)
    }

    return this._name
  }

  /**
   * Name of attribute in data
   */
  public get attributeName (): string {
    return this.definition.attributeName || this.name
  }

  /**
   * Field definition
   */
  public get definition (): FieldDef {
    return this._def
  }

  /**
   * Assigned model
   * Will throw FieldNotBoundException in case field has not been bound to a model
   */
  public get model (): BaseModel {
    if (this._model === null) {
      throw new FieldNotBoundException(this)
    }

    return this._model
  }

  /**
   * Return bound data or data from bound model
   * Will throw FieldNotBoundException if field is not bound to data or model
   */
  public get data (): Dictionary<any> {
    return this._data || this.model.data
  }

  /**
   * Property mapper for getValue
   */
  public get value (): any {
    return this.getValue()
  }

  /**
   * Field value
   * Returns async field value from data by calling valueGetter with data
   */
  public async getValue (): Promise<any> {
    return this.valueGetter(this.data)
  }

  /**
   * Property mapper for setValue
   */
  public set value (value: any) {
    this.setValue(value)
  }

  /**
   * Field value setter
   * Sets field value to model data by calling valueSetter with data
   */
  public setValue (value: any): void {
    this.valueSetter(value, this.data)
  }

  /**
   * Field label
   */
  public get label (): Promise<string> {
    return cu.promiseEval(this.definition.label, this)
  }

  /**
   * Field hint
   */
  public get hint (): Promise<string> {
    return cu.promiseEval(this.definition.hint, this)
  }

  /**
   * Returns async field options with validation and default values depending on field type
   */
  public get options (): Promise<FieldTypeOptions> {
    return cu.promiseEval(this.definition.options, this).then(options => this.validateOptions(options))
  }

  /**
   * Validate field options and set default values depending on field type
   */
  protected async validateOptions (options: FieldTypeOptions): Promise<FieldTypeOptions> {
    return options || {}
  }

  /**
   * Returns boolean whether field is a primary key
   */
  public get isPrimaryKey (): boolean {
    return Boolean(this.definition.primaryKey)
  }

  /**
   * Returns boolean whether attribute is an nested data structure
   */
  public get isNestedAttribute (): boolean {
    return this.attributeName.includes('.')
  }

  /**
   * Retrieve value from data structure according to attributeName
   * Uses nested syntax from attributeName (e.g. "address.city" -> {address: {city: 'New York'}})
   * Will return null if value is not available
   */
  public valueGetter (data: any): any {
    if (!data || typeof data !== 'object') return null

    // No nested attribute name
    if (!this.isNestedAttribute) {
      const value = data[this.attributeName]
      return !cu.isNull(value) ? value : null
    }

    // Attribute name contains nested attributes e.g. obj.nested.field
    const subFields = this.attributeName.split('.')
    let currentObject = data
    let subFieldName
    for (subFieldName of subFields) {
      currentObject = currentObject[subFieldName]
      if (cu.isNull(currentObject)) {
        return null
      }
    }

    /* istanbul ignore else */
    if (!cu.isNull(currentObject)) {
      return currentObject
    } else {
      return null
    }
  }

  /**
   * Set value of field to data by using attributeName
   * Will create nested structure from attributeName (e.g. "address.city" -> {address: {city: 'New York'}})
   */
  public valueSetter (value: any, data: Dictionary<any>): void {
    if (!this.attributeName.includes('.')) {
      data[this.attributeName] = value
    } else {
      const subFields = this.attributeName.split('.') as string[]

      // Retrieve start position for set
      let fieldIndex = 0
      let subFieldName = subFields[fieldIndex]
      let currentData = data
      while (true) {
        if (Object.prototype.hasOwnProperty.call(currentData, subFieldName) && !cu.isNull(currentData[subFieldName])) {
          currentData = currentData[subFieldName]
        } else {
          break
        }

        fieldIndex++
        subFieldName = subFields[fieldIndex]
        if (fieldIndex + 1 === subFields.length) {
          break
        }
      }

      // Build nested object which will be set as value
      currentData[subFieldName] = subFields.splice(fieldIndex + 1).reduceRight((obj, subFieldName) => {
        const newObj: Dictionary<any> = {}
        newObj[subFieldName] = obj
        return newObj
      }, value)
    }
  }

  /**
   * Map value from a data structure to another data structure
   */
  public mapFieldValue (fromData: Dictionary<any>, toData: Dictionary<any>): void {
    const value = this.valueGetter(fromData)
    this.valueSetter(value, toData)
  }

  /**
   * Display component to render when displaying value with <display-field/>
   */
  public get displayComponent (): Promise<ComponentModule> {
    return <Promise<ComponentModule>> import('../components/BaseDisplayFieldRender')
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
  public displayRender (renderData: any): VNode {
    return h('span', renderData)
  }

  /**
   * Input component to render when showing input for field with <input-field/>
   */
  public get inputComponent (): Promise<ComponentModule> {
    return <Promise<ComponentModule>> import('../components/BaseInputFieldRender')
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
  public inputRender (renderData: InputRenderData): VNode {
    const { disabled, readonly } = renderData.inputProps

    return h('input', {
      type: 'text',
      value: renderData.value,
      disabled,
      readonly,
      onInput: (event: InputEvent) => {
        const target = event.target as { value?: any }
        this.value = target.value
      }
    })
  }
}
