import { CreateElement, VNode, Component } from 'vue'
import mixins from '../utils/mixins'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'
import { configHandler } from '../utils/ConfigHandler'

interface ComponentData {
  inputComponent: Component | null
}

/**
 * Main component to display value of a field
 */
export default mixins(LoadingSlotMixin, FieldPropsMixin).extend({
  name: 'InputField',
  inheritAttrs: false,

  data: (): ComponentData => ({
    inputComponent: null
  }),

  asyncComputed: {
    async inputComponent (): Promise<Component | null> {
      configHandler.checkWarningUseAsyncComputed()
      return this.resolveInputComponent()
    }
  },

  watch: {
    fieldObj () {
      this.setResolveInputComponent()
    }
  },

  created () {
    this.setResolveInputComponent()
  },

  methods: {
    async setResolveInputComponent () {
      if (!configHandler.useAsyncComputed()) {
        this.inputComponent = await this.resolveInputComponent()
      }
    },

    async resolveInputComponent () {
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
