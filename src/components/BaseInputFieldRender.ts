import { VNode, CreateElement } from 'vue'
import BaseDisplayFieldRender from './BaseDisplayFieldRender'

export default BaseDisplayFieldRender.extend({
  name: 'BaseInputFieldRender',

  methods: {
    async resolveRenderData () {
      this.renderData = await this.field.prepareInputRender()
      this.resolvedRenderData = true
    },

    renderField (h: CreateElement): VNode {
      return this.field.inputRender(h, this.renderData)
    }
  }
})
