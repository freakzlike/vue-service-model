import AsyncComputed from 'vue-async-computed'
import Vue, { CreateElement, VNode, Component } from 'vue'
import mixins from '../utils/mixins'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'

Vue.use(AsyncComputed)

interface ComponentData {
  // AsyncComputed
  displayComponent?: Component | null
}

/**
 * Main component to display value of a field
 */
export default mixins(LoadingSlotMixin, FieldPropsMixin).extend({
  name: 'DisplayField',
  inheritAttrs: false,

  data: (): ComponentData => ({}),

  asyncComputed: {
    async displayComponent (): Promise<Component | null> {
      if (this.fieldObj) {
        const componentModule = await this.fieldObj.displayComponent
        return componentModule.default
      } else {
        return null
      }
    }
  },

  render (h: CreateElement): VNode {
    if (this.displayComponent && this.fieldObj) {
      return h(this.displayComponent, {
        props: {
          field: this.fieldObj
        }
      })
    } else {
      return this.renderLoading(h)
    }
  }
})
