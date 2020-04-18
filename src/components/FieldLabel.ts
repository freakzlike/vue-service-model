import AsyncComputed from 'vue-async-computed'
import Vue, { VNode, CreateElement } from 'vue'
import { Field } from '../fields/Field'
import FieldPropsMixin from './FieldPropsMixin'

Vue.use(AsyncComputed)

export interface ComponentData {
  // AsyncComputed
  label?: string | null
}

export default FieldPropsMixin.extend({
  name: 'FieldLabel',
  inheritAttrs: false,

  props: {
    tag: {
      type: String,
      default: 'span'
    }
  },

  data: (): ComponentData => ({}),

  asyncComputed: {
    async label () {
      if (this.fieldObj) {
        const field = this.fieldObj as Field
        return field.label
      } else {
        return null as any
      }
    }
  },

  methods: {
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
      return undefined as any
    }
  }
})
