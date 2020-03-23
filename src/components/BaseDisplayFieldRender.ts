import AsyncComputed from 'vue-async-computed'
import Vue, { VNode, CreateElement } from 'vue'
import { Field } from '../fields/Field'
import cu from '../utils/common'

Vue.use(AsyncComputed)

interface ComponentData {
  resolved: boolean,
  resolvedValue: any,
  // AsyncComputed
  value?: Field
}

export default Vue.extend({
  name: 'BaseDisplayFieldRender',
  inheritAttrs: false,

  props: {
    field: {
      type: Field,
      required: true
    }
  },

  data: (): ComponentData => ({
    resolved: false,
    resolvedValue: null
  }),

  asyncComputed: {
    value: {
      default: cu.NO_VALUE,
      get () {
        const field = this.field as Field
        return field.value
      }
    }
  },

  render (h: CreateElement): VNode {
    if (this.value !== cu.NO_VALUE) {
      return this.field.displayRender(h, this.value)
    } else {
      return undefined as any
    }
  }
})
