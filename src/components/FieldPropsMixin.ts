import Vue from 'vue'
import { BaseModel } from '../models/BaseModel'
import { Field } from '../fields/Field'

/**
 * Mixin to input field by props
 * Takes field instance or model and field name
 */
export default Vue.extend({
  name: 'DisplayField',
  inheritAttrs: false,

  props: {
    /**
     * Model instance
     * Use in combination with fieldName
     */
    model: {
      default: null,
      validator: value => value === null || value as any instanceof BaseModel
    },

    /**
     * Field name
     * Use in combination with model
     */
    fieldName: {
      type: String,
      default: null
    },

    /**
     * Field instance
     */
    field: {
      default: null,
      validator: value => value === null || value as any instanceof Field
    }
  },

  computed: {
    fieldObj (): Field | null {
      if (this.field) {
        return this.field
      } else if (this.model && this.fieldName) {
        const model = this.model as unknown as BaseModel
        return model.getField(this.fieldName) as Field
      } else {
        return null
      }
    }
  }
})
