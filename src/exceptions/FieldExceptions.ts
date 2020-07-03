import { Field } from '../fields'
import { BaseException } from './BaseException'

export class FieldNotBoundException extends BaseException {
  constructor (field: Field) {
    super('Field "' + field.cls.name + '" not bound or fieldName not set on new')
    this.constructor = FieldNotBoundException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = FieldNotBoundException.prototype
  }
}

export class InvalidFieldOptionsException extends BaseException {
  constructor (field: Field, property: string, message: string) {
    super(`Invalid ${property} in field ${field.cls.name}: ${message}`)
    this.constructor = InvalidFieldOptionsException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = InvalidFieldOptionsException.prototype
  }
}

export class RequiredFieldOptionsException extends InvalidFieldOptionsException {
  constructor (field: Field, property: string) {
    super(field, property, `${property} is required`)
    this.constructor = RequiredFieldOptionsException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = RequiredFieldOptionsException.prototype
  }
}
