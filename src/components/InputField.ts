import { VNode, defineComponent, DefineComponent, h, toRaw } from 'vue'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'

interface ComponentData {
  inputComponent: DefineComponent | null
}

/**
 * Main component to display value of a field
 */
export default defineComponent({
  name: 'InputField',
  inheritAttrs: false,
  mixins: [FieldPropsMixin, LoadingSlotMixin],

  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },

  data: (): ComponentData => ({
    inputComponent: null
  }),

  // TODO: vue-async-computed
  // asyncComputed: {
  //   async inputComponent (): Promise<DefineComponent | null> {
  //     configHandler.checkWarningUseAsyncComputed()
  //     return this.resolveInputComponent()
  //   }
  // },

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
      // if (!configHandler.useAsyncComputed()) {
      this.inputComponent = await this.resolveInputComponent()
      // }
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

  render (): VNode {
    if (this.inputComponent && this.fieldObj) {
      return h(toRaw(this.inputComponent), {
        field: this.fieldObj,
        renderProps: this.renderProps,
        disabled: this.disabled,
        readonly: this.readonly
      })
    } else {
      return this.renderLoading()
    }
  }
})
