import Vue, { VNode } from 'vue'
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

  render (h): VNode {
    const field = this.field
    return field.displayRender(h)
  }
})
