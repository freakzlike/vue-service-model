import { VNode, CreateElement } from 'vue'
import mixins from '../utils/mixins'
import BaseDisplayFieldRender from './BaseDisplayFieldRender'
import InputComponentPropsMixin from '../mixins/InputComponentPropsMixin'

export default mixins(BaseDisplayFieldRender, InputComponentPropsMixin).extend({
  name: 'BaseInputFieldRender',

  computed: {
    inputProps () {
      return {
        disabled: this.disabled,
        readonly: this.readonly
      }
    }
  },

  watch: {
    inputProps () {
      this.setResolveRenderData()
    }
  },

  methods: {
    async resolveRenderData () {
      return this.field.prepareInputRender(this.inputProps, this.renderProps)
    },

    renderField (h: CreateElement): VNode {
      return this.field.inputRender(h, this.renderData)
    }
  }
})
