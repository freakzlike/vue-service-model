import { VNode, CreateElement } from 'vue'
import mixins from '../utils/mixins'
import { Field } from '../fields/Field'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'
import { BaseModel } from '../models/BaseModel'

export interface ComponentData {
  label: string | null
}

/**
 * Main component to display label of a field
 */
export default mixins(LoadingSlotMixin, FieldPropsMixin).extend({
  name: 'FieldLabel',
  inheritAttrs: false,

  props: {
    model: {
      default: null,
      validator: value => value === null || value as any instanceof BaseModel ||
        // Allow static BaseModel class
        Boolean(value && (value as any).prototype instanceof BaseModel)
    },

    tag: {
      type: String,
      default: 'span'
    }
  },

  data: (): ComponentData => ({
    label: null
  }),

  watch: {
    fieldObj () {
      this.resolveLabel()
    }
  },

  created () {
    this.resolveLabel()
  },

  methods: {
    async resolveLabel () {
      if (this.fieldObj) {
        const field = this.fieldObj as Field
        this.label = await field.label
      } else {
        this.label = null
      }
    },
    renderLabel (h: CreateElement): VNode {
      if (this.$scopedSlots && this.$scopedSlots.default) {
        return h(this.tag, this.$scopedSlots.default({
          label: this.label
        }))
      } else {
        return h(this.tag, this.label)
      }
    }
  },

  render (h: CreateElement): VNode {
    if (this.label) {
      return this.renderLabel(h)
    } else {
      return this.renderLoading(h)
    }
  }
})
