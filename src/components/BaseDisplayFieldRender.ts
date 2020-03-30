import AsyncComputed from 'vue-async-computed'
import Vue, { VNode, CreateElement } from 'vue'
import { Field } from '../fields/Field'
import cu from '../utils/common'

Vue.use(AsyncComputed)

export interface ComponentData {
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

  data: (): ComponentData => ({}),

  computed: {
    isValueLoaded () {
      return this.value !== cu.NO_VALUE
    }
  },

  asyncComputed: {
    value: {
      default: cu.NO_VALUE,
      get () {
        const field = this.field as Field
        return field.value
      }
    }
  },

  methods: {
    renderField (h: CreateElement): VNode {
      return this.field.displayRender(h, this.value)
    }
  },

  render (h: CreateElement): VNode {
    if (this.isValueLoaded) {
      return this.renderField(h)
    } else {
      return undefined as any
    }
  }
})
