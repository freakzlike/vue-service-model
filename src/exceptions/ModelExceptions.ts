import { BaseModel } from '../models'

export class NotDeclaredFieldException extends Error {
  constructor (model: BaseModel, fieldName: string) {
    super('Field "' + fieldName + '" not declared on Model "' + model.cls.name + '"')
    this.constructor = NotDeclaredFieldException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = NotDeclaredFieldException.prototype
  }
}

export class MissingUrlException extends Error {
  constructor (modelName: string) {
    super('Missing url configuration in Model "' + modelName + '"')
    this.constructor = MissingUrlException
    // @ts-ignore
    // eslint-disable-next-line no-proto
    this.__proto__ = MissingUrlException.prototype
  }
}
