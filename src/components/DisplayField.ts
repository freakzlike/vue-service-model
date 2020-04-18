import AsyncComputed from 'vue-async-computed'
import Vue, { CreateElement, VNode, Component } from 'vue'
import FieldPropsMixin from './FieldPropsMixin'

Vue.use(AsyncComputed)

interface ComponentData {
  // AsyncComputed
  displayComponent?: Component | null
}

/**
 * Main component to display value of a field
 */
export default FieldPropsMixin.extend({
  name: 'DisplayField',
  inheritAttrs: false,

  data: (): ComponentData => ({}),

  asyncComputed: {
    async displayComponent () {
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
      return undefined as any
    }
  }
})
