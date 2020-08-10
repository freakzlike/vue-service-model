import { VNode, CreateElement } from 'vue'
import BaseDisplayFieldRender from './BaseDisplayFieldRender'

export default BaseDisplayFieldRender.extend({
  name: 'BaseInputFieldRender',

  methods: {
    async resolveRenderData () {
      return this.field.prepareInputRender(this.renderProps)
    },

    renderField (h: CreateElement): VNode {
      return this.field.inputRender(h, this.renderData)
    }
  }
})
