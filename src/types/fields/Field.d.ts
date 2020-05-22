import LazyValue from '../LazyValue'
import { BaseModel } from '../../models'

export interface FieldTypeOptions {}

export interface FieldDef {
  attributeName?: string
  label?: LazyValue<string>
  hint?: LazyValue<string>
  primaryKey?: boolean,
  options?: LazyValue<FieldTypeOptions>
}

export interface FieldBind {
  name: string
  model?: BaseModel
}
