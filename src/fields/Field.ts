import { Field as jsField } from 'js-service-model/lib/fields/Field'
import { FieldMixin } from './FieldMixin'
import { FieldMixinInterface } from '../types/fields/Field'

export interface Field extends jsField, FieldMixinInterface {
}

export class Field extends FieldMixin(jsField) {
}
