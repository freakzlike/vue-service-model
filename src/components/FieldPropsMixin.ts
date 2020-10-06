import { defineComponent, PropType } from 'vue'
import { BaseModel } from '../models/BaseModel'
import { Field } from '../fields/Field'

/**
 * Mixin to input field by props
 * Takes field instance or model and field name
 */
export default defineComponent({
  inheritAttrs: false,

  props: {
    /**
     * Model instance
     * Use in combination with fieldName
     */
    model: {
      type: Object as PropType<null | BaseModel>,
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
      type: Object as PropType<null | Field>,
      default: null,
      validator: value => value === null || value as any instanceof Field
    },

    /**
     * Additional render props
     */
    renderProps: {
      type: Object,
      default: null
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
