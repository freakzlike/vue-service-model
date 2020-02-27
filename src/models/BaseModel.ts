import Dictionary from '../types/Dictionary'
import { BaseClass } from '../utils/BaseClass'
import { Field } from '../fields/Field'

class NotDeclaredFieldException extends Error {
  constructor (model: BaseModel, fieldName: string) {
    super('Field "' + fieldName + '" not declared on Model "' + model.cls.name + '"')
    this.constructor = NotDeclaredFieldException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = NotDeclaredFieldException.prototype
  }
}

/**
 * BaseModel class
 */
class BaseModel extends BaseClass {
  /**
   * Name to use for unique model identification
   * Will be used for vuex store name
   */
  public static keyName: string

  // noinspection JSUnusedGlobalSymbols
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

    if (!this.cls.keyName) {
      console.warn('Missing keyName for Model', this.constructor.name)
    }

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
        const field = target.getField(name)
        return field.valueGetter(target.data)
      }
    })
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
   * Bind fields from fieldsDef to _fields
   */
  protected _bindFields (): void {
    this._fields = {}

    const fields = this.cls.fieldsDef
    for (const fieldName of Object.keys(fields)) {
      this._fields[fieldName] = fields[fieldName].bind(fieldName)
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

export { BaseModel, NotDeclaredFieldException }
