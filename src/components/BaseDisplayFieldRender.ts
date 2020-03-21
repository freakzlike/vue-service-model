import Vue, { VNode, CreateElement } from 'vue'
import { Field } from '../fields/Field'

interface ComponentData {
  resolved: boolean,
  resolvedValue: any
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

  methods: {
    async resolveValue () {
      this.resolvedValue = await this.field.value
      this.resolved = true
    }
  },

  render (h: CreateElement): VNode {
    this.resolveValue()
    if (this.resolved) {
      return this.field.displayRender(h, this.resolvedValue)
    } else {
      return undefined as any
    }
  }
})
