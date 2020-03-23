import AsyncComputed from 'vue-async-computed'
import Vue, { CreateElement, VNode, Component } from 'vue'
import { BaseModel } from '../models/BaseModel'
import { Field } from '../fields/Field'

Vue.use(AsyncComputed)

interface ComponentData {
  // AsyncComputed
  displayComponent?: Component | null
}

/**
 * Main component to display value of a field
 */
export default Vue.extend({
  name: 'DisplayField',
  inheritAttrs: false,

  props: {
    /**
     * Model instance
     */
    model: {
      required: true,
      validator: prop => prop instanceof BaseModel || prop === null
    },

    /**
     * Field name
     */
    fieldName: {
      type: String,
      required: true
    }
  },

  data: (): ComponentData => ({}),

  computed: {
    field (): Field | null {
      if (this.model) {
        const model = this.model as BaseModel
        return model.getField(this.fieldName) as Field
      } else {
        return null
      }
    }
  },

  asyncComputed: {
    async displayComponent () {
      if (this.field) {
        const field = this.field as Field
        const componentModule = await field.displayComponent
        return componentModule.default
      } else {
        return null
      }
    }
  },

  render (h: CreateElement): VNode {
    if (this.displayComponent) {
      return h(this.displayComponent, {
        props: {
          field: this.field
        }
      })
    } else {
      return undefined as any
    }
  }
})
