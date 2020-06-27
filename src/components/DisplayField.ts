import { CreateElement, VNode, Component } from 'vue'
import mixins from '../utils/mixins'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'

export interface ComponentData {
  displayComponent: Component | null
}

/**
 * Main component to display value of a field
 */
export default mixins(LoadingSlotMixin, FieldPropsMixin).extend({
  name: 'DisplayField',
  inheritAttrs: false,

  data: (): ComponentData => ({
    displayComponent: null
  }),

  watch: {
    fieldObj () {
      this.resolveDisplayComponent()
    }
  },

  created () {
    this.resolveDisplayComponent()
  },

  methods: {
    async resolveDisplayComponent () {
      if (this.fieldObj) {
        const componentModule = await this.fieldObj.displayComponent
        this.displayComponent = componentModule.default
      } else {
        this.displayComponent = null
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
