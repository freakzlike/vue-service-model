import Vue, { CreateElement, VNode } from 'vue'
import { BaseModel } from '../models/BaseModel'
import { Field } from '../fields/Field'
import { FieldMixinInterface } from '../types/fields/Field'

interface ComponentData {
  lazyLoadDisplayComponent: boolean,
  displayComponent: object | null
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
      type: BaseModel,
      required: true
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
    lazyLoadDisplayComponent: false,
    displayComponent: null
  }),

  computed: {
    field (): Field {
      return this.model.getField(this.fieldName) as Field
    }
  },

  watch: {
    field () {
      this.displayComponent = null
      this.lazyLoadDisplayComponent = false
    }
  },

  methods: {
    getDisplayComponent (): object | null {
      if (!this.lazyLoadDisplayComponent) {
        this.lazyLoadDisplayComponent = true
        const field = this.field as unknown as FieldMixinInterface
        field.displayComponent.then(module => {
          this.displayComponent = module.default
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
