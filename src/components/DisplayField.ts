import { CreateElement, VNode, Component } from 'vue'
import mixins from '../utils/mixins'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'
import { configHandler } from '../utils/ConfigHandler'

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

  asyncComputed: {
    async displayComponent (): Promise<Component | null> {
      configHandler.checkWarningUseAsyncComputed()
      return this.resolveDisplayComponent()
    }
  },

  watch: {
    fieldObj () {
      this.setResolveDisplayComponent()
    }
  },

  created () {
    this.setResolveDisplayComponent()
  },

  methods: {
    async setResolveDisplayComponent () {
      if (!configHandler.useAsyncComputed()) {
        this.displayComponent = await this.resolveDisplayComponent()
      }
    },

    async resolveDisplayComponent () {
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
