import { VNode, CreateElement } from 'vue'
import BaseDisplayFieldRender from './BaseDisplayFieldRender'

export default BaseDisplayFieldRender.extend({
  name: 'BaseInputFieldRender',

  methods: {
    renderField (h: CreateElement): VNode {
      return this.field.inputRender(h, this.value)
    }
  }
})
