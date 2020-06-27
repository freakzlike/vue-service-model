import { CreateElement, VNode, Component } from 'vue'
import mixins from '../utils/mixins'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'

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

  watch: {
    fieldObj () {
      this.resolveInputComponent()
    }
  },

  created () {
    this.resolveInputComponent()
  },

  methods: {
    async resolveInputComponent () {
      if (this.fieldObj) {
        const componentModule = await this.fieldObj.inputComponent
        this.inputComponent = componentModule.default
      } else {
        this.inputComponent = null
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
