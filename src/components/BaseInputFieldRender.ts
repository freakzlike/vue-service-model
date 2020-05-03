import { VNode, CreateElement } from 'vue'
import cu from '../utils/common'
import BaseDisplayFieldRender from './BaseDisplayFieldRender'
import { Field } from '../fields'

export default BaseDisplayFieldRender.extend({
  name: 'BaseInputFieldRender',

  asyncComputed: {
    renderData: {
      default: cu.NO_VALUE,
      get () {
        const field = this.field as Field
        return field.prepareInputRender()
      }
    }
  },

  methods: {
    renderField (h: CreateElement): VNode {
      return this.field.inputRender(h, this.renderData)
    }
  }
})
