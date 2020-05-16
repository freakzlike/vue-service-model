import AsyncComputed from 'vue-async-computed'
import Vue, { CreateElement, VNode, Component } from 'vue'
import mixins from '../utils/mixins'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'

Vue.use(AsyncComputed)

interface ComponentData {
  // AsyncComputed
  inputComponent?: Component | null
}

/**
 * Main component to display value of a field
 */
export default mixins(LoadingSlotMixin, FieldPropsMixin).extend({
  name: 'InputField',
  inheritAttrs: false,

  data: (): ComponentData => ({}),

  asyncComputed: {
    async inputComponent () {
      if (this.fieldObj) {
        const componentModule = await this.fieldObj.inputComponent
        return componentModule.default
      } else {
        return null
      }
    }
  },

  render (h: CreateElement): VNode {
    if (this.inputComponent && this.fieldObj) {
      return h(this.inputComponent, {
        props: {
          field: this.fieldObj
        }
      })
    } else {
      return this.renderLoading(h)
    }
  }
})
