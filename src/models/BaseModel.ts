import Vue from 'vue'
import Dictionary from '../types/Dictionary'
import cu from '../utils/common'
import { BaseClass } from '../utils/BaseClass'
import { Field } from '../fields/Field'
import { NotDeclaredFieldException } from '../exceptions/ModelExceptions'
import { PrimaryKey } from '../types/models/ModelManager'

/**
 * BaseModel class
 */
export class BaseModel extends BaseClass {
  /**
   * Field definitions for current model
   * e.g:
   * {id: new UUIDField(), name: new CharField()}
   */
  protected static fieldsDef: Dictionary<Field> = {}

  /**
   * Flag whether model has be registered or not
   */
  private static __modelRegistered = false

  /**
   * Getter to simulate static class property with fixed inheritance
   */
  protected static get _modelRegistered (): boolean {
    // Check whether model has property __modelRegistered and not inherited from super class
    return Object.prototype.hasOwnProperty.call(this, '__modelRegistered') ? this.__modelRegistered : false
  }

  /**
   * Setter to simulate static class property with fixed inheritance
   */
  protected static set _modelRegistered (v: boolean) {
    this.__modelRegistered = v
  }

  /**
   * Model data
   */
  protected _data: Dictionary<any>

  /**
   * Bound field objects of model
   */
  protected _fields: Dictionary<Field> = {}

  /**
   * Constructor
   * @param data Model data
   */
  constructor (data: Dictionary<any> = {}) {
    super()
    this._data = data
    Vue.observable(this._data)

    this.cls.register()

    this._bindFields()
  }

  /**
   * Data containing values
   */
  public get data (): Dictionary<any> {
    return this._data
  }

  /**
   * Bound dictionary of fields by field name
   */
  public get fields (): Dictionary<Field> {
    return this._fields
  }

  /**
   * Getter with values to return data of model
   * Can be accessed as object (e.g. for field name 'description': val.description)
   */
  public get val (): Dictionary<any> {
    return new Proxy(this, {
      get (target: BaseModel, name: string) {
        const field: Field = target.getField(name)
        return Promise.resolve(field.value)
      },

      set (target: BaseModel, name: string, value: any): boolean {
        const field: Field = target.getField(name)
        field.value = value
        return true
      }
    })
  }

  /**
   * Return primary key of model instance or null if not set
   */
  public get pk (): PrimaryKey | null {
    const primaryKeyField = this.getPrimaryKeyField()
    if (!primaryKeyField) return null

    const pk = primaryKeyField.valueGetter(this.data)
    return !cu.isNull(pk) ? pk : null
  }

  /**
   * Return field by name.
   * Throws NotDeclaredFieldException if field name is not in fields
   */
  public getField (fieldName: string): Field {
    if (Object.keys(this.fields).indexOf(fieldName) === -1) {
      throw new NotDeclaredFieldException(this, fieldName)
    }

    return this.fields[fieldName]
  }

  /**
   * Return primary key field or null of no primary key field exists
   */
  public getPrimaryKeyField (): Field | null {
    const pkFields = Object.values(this.fields).filter(field => field.isPrimaryKey)
    if (pkFields.length > 1) {
      console.warn('Multiple primary key fields found in model', this.constructor.name)
    }

    return pkFields.length ? pkFields[0] : null
  }

  /**
   * Bind fields from fieldsDef to _fields
   */
  protected _bindFields (): void {
    this._fields = {}

    const fields = this.cls.fieldsDef
    for (const fieldName of Object.keys(fields)) {
      const field = fields[fieldName] as Field
      this._fields[fieldName] = field.bind({ name: fieldName, model: this })
    }
  }

  /**
   * Register model to perform unique actions
   */
  public static register (): boolean {
    if (this._modelRegistered) return false

    this._modelRegistered = true
    return true
  }
}
