import Vue, { CreateElement, VNode } from 'vue'
import cu from '../utils/common'
import { BaseClass } from '../utils/BaseClass'
import { FieldNotBoundException } from '../exceptions/FieldExceptions'
import { FieldDef, FieldBind } from '../types/fields/Field'
import { BaseModel } from '../models'
import Dictionary from '../types/Dictionary'
import { ComponentModule } from '../types/components'

export class Field extends BaseClass {
  /**
   * Field name
   */
  protected _name: (string | null) = null

  /**
   * Field definition
   */
  protected _def: FieldDef

  /**
   * Model instance
   */
  protected _model: BaseModel | null = null

  constructor (def: FieldDef = {}, fieldBind?: FieldBind) {
    super()
    this._def = def
    if (fieldBind) {
      this._name = fieldBind.name
      this._model = fieldBind.model || null
    }
  }

  /**
   * Clone field instance
   */
  public clone (): Field {
    const FieldClass = this.cls as typeof Field

    if (this._name) {
      const fieldBind: FieldBind = {
        name: this._name
      }
      if (this._model) {
        fieldBind.model = this._model
      }

      return new FieldClass(this._def, fieldBind)
    } else {
      return new FieldClass(this._def)
    }
  }

  /**
   * Bind field with field name and return a new instance
   * @param fieldBind
   */
  public bind (fieldBind: FieldBind): Field {
    const FieldClass = this.cls as typeof Field
    return new FieldClass(this._def, fieldBind)
  }

  /**
   * Field name
   * Returns field name (Which has been set as key at fieldsDef
   * Will throw FieldNotBoundException in case field has not been bound to a model
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
    return this._def.attributeName || this.name
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
   * Field value
   * Returns async field value from data by calling valueGetter with data of assigned model
   */
  public get value (): any {
    return Promise.resolve(this.valueGetter(this.model.data))
  }

  /**
   * Field value setter
   * Sets field value to model data by calling valueSetter with data of assigned model
   */
  public set value (value: any) {
    this.valueSetter(value, this.model.data)
  }

  /**
   * Field label
   */
  public get label (): Promise<string> {
    return cu.promiseEval(this._def.label, this)
  }

  /**
   * Field hint
   */
  public get hint (): Promise<string> {
    return cu.promiseEval(this._def.hint, this)
  }

  /**
   * Retrieve value from data structure according to attributeName
   * Uses nested syntax from attributeName (e.g. "address.city" -> {address: {city: 'New York'}})
   * Will return null if value is not available
   */
  public valueGetter (data: any): any {
    if (!data || typeof data !== 'object') return null

    // No nested attribute name
    if (!this.attributeName.includes('.')) {
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
      Vue.set(data, this.attributeName, value)
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
      const setValue = subFields.splice(fieldIndex + 1).reduceRight((obj, subFieldName) => {
        const newObj: Dictionary<any> = {}
        newObj[subFieldName] = obj
        return newObj
      }, value)

      Vue.set(currentData, subFieldName, setValue)
    }
  }

  /**
   * Display component to render when displaying value with <display-field/>
   */
  get displayComponent (): Promise<ComponentModule> {
    return import('../components/BaseDisplayFieldRender')
  }

  /**
   * Simple Vue render function when using default displayComponent when displaying value with <display-field/>
   */
  displayRender (h: CreateElement, resolvedValue: any): VNode {
    return h('span', resolvedValue)
  }

  /**
   * Input component to render when showing input for field with <input-field/>
   */
  get inputComponent (): Promise<ComponentModule> {
    return import('../components/BaseInputFieldRender')
  }

  /**
   * Simple Vue render function when using default inputComponent for input of field value with <input-field/>
   */
  inputRender (h: CreateElement, resolvedValue: any): VNode {
    return h('input', {
      attrs: {
        type: 'text',
        value: resolvedValue
      },
      on: {
        input: (event: InputEvent) => {
          const target = event.target as { value?: any }
          this.value = target.value
        }
      }
    })
  }
}
