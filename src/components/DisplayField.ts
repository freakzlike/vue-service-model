import Vue, { CreateElement, VNode } from 'vue'
import { BaseModel } from '../models/BaseModel'
import { Field } from '../fields/Field'

interface ComponentData {
  displayComponent: object | null,
  displayComponentPromise: Promise<object> | null
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

  data: (): ComponentData => ({
    displayComponent: null,
    displayComponentPromise: null
  }),

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

  watch: {
    field () {
      this.displayComponent = null
      this.displayComponentPromise = null
    }
  },

  methods: {
    getDisplayComponent (): object | null {
      if (!this.field) return null

      if (!this.displayComponentPromise) {
        const field = this.field
        this.displayComponentPromise = field.displayComponent.then(module => {
          this.displayComponent = module.default
          return this.displayComponent
        })
      }

      return this.displayComponent
    }
  },

  render (h: CreateElement): VNode {
    const displayComponent = this.getDisplayComponent()
    if (displayComponent) {
      return h(displayComponent, {
        props: {
          field: this.field
        }
      })
    } else {
      return undefined as any
    }
  }
})
