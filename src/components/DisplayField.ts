import { VNode, DefineComponent, defineComponent, h, toRaw } from 'vue'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'
import { configHandler } from '../utils/ConfigHandler'

export interface ComponentData {
  displayComponent: DefineComponent | null
}

/**
 * Main component to display value of a field
 */
export default defineComponent({
  name: 'DisplayField',
  inheritAttrs: false,
  mixins: [FieldPropsMixin, LoadingSlotMixin],

  data: (): ComponentData => ({
    displayComponent: null
  }),

  // TODO: vue-async-computed
  // asyncComputed: {
  //   async displayComponent (): Promise<DefineComponent | null> {
  //     configHandler.checkWarningUseAsyncComputed()
  //     return this.resolveDisplayComponent()
  //   }
  // },

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

  render (): VNode {
    if (this.displayComponent && this.fieldObj) {
      return h(toRaw(this.displayComponent), {
        field: this.fieldObj,
        renderProps: this.renderProps
      })
    } else {
      return this.renderLoading()
    }
  }
})
