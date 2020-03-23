import { Field } from '../fields'

export class FieldNotBoundException extends Error {
  constructor (field: Field) {
    super('Field "' + field.cls.name + '" not bound or fieldName not set on new')
    this.constructor = FieldNotBoundException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = FieldNotBoundException.prototype
  }
}
