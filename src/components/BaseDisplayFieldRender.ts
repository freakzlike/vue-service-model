import Vue, { VNode, CreateElement } from 'vue'
import { Field } from '../fields/Field'

export interface ComponentData {
  resolvedRenderData: boolean,
  renderData: any
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
    resolvedRenderData: false,
    renderData: null
  }),

  watch: {
    field () {
      this.resolveRenderData()
    },
    'field.data': {
      deep: true,
      handler () {
        this.resolveRenderData()
      }
    }
  },

  created () {
    this.resolveRenderData()
  },

  methods: {
    async resolveRenderData () {
      this.renderData = await this.field.prepareDisplayRender()
      this.resolvedRenderData = true
    },

    renderField (h: CreateElement): VNode {
      return this.field.displayRender(h, this.renderData)
    }
  },

  render (h: CreateElement): VNode {
    if (this.resolvedRenderData) {
      return this.renderField(h)
    } else {
      return undefined as any
    }
  }
})
