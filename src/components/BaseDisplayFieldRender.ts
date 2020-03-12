import Vue, { VNode, CreateElement } from 'vue'
import { Field } from '../fields/Field'

export default Vue.extend({
  name: 'BaseDisplayFieldRender',
  inheritAttrs: false,

  props: {
    field: {
      type: Field,
      required: true
    }
  },

  render (h: CreateElement): VNode {
    return this.field.displayRender(h)
  }
})
