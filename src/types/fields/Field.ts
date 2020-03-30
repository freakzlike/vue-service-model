import LazyValue from '../LazyValue'
import { BaseModel } from '../../models'

export interface FieldDef {
  attributeName?: string
  label?: LazyValue<string>
  hint?: LazyValue<string>
  primaryKey?: boolean
}

export interface FieldBind {
  name: string
  model?: BaseModel
}
