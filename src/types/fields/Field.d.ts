import LazyValue from '../LazyValue'
import { BaseModel } from '../../models'
import Dictionary from '../Dictionary'

export interface FieldTypeOptions {}

export interface FieldDef {
  // String which key should be used to retrieve value from.
  // See Attribute name for more information
  // Optional: default uses key from fieldsDef
  attributeName?: string

  // Label of field. See Field label and hint for more information
  // Optional: Can either be a string, function or promise
  label?: LazyValue<string>

  // Hint of field. See Field label and hint for more information
  // Optional: Can either be a string, function or promise
  hint?: LazyValue<string>

  // Boolean flag whether field is a primary key
  // Optional: default is false
  primaryKey?: boolean

  // Optional field type specific options.
  // Can either be an object, a function or a promise.
  // See field Types
  options?: LazyValue<FieldTypeOptions>
}

export interface FieldBind {
  // Field name which has been set as key at fieldsDef
  name?: string

  // Model to bind field to
  // Beware of manual bind your field to a model afterwards.
  // The field will not be available by model.fields or model.getField()
  model?: BaseModel

  // Data to retrieve field value from
  // If not set then model.data will be used
  data?: Dictionary<any>

  // Value which should be bound to field
  // When using value then model and data will be ignored
  // A custom data object will be created to keep the field reactive
  value?: any
}
