import { VNode, h, defineComponent, PropType } from 'vue'
import { Field } from '../fields/Field'
import FieldPropsMixin from './FieldPropsMixin'
import LoadingSlotMixin from './LoadingSlotMixin'
import { BaseModel } from '../models/BaseModel'
import { configHandler } from '../utils/ConfigHandler'

export interface ComponentData {
  label: string | null
}

/**
 * Main component to display label of a field
 */
export default defineComponent({
  name: 'FieldLabel',
  inheritAttrs: false,
  mixins: [FieldPropsMixin, LoadingSlotMixin],

  props: {
    model: {
      type: [Function, Object] as PropType<null | BaseModel | typeof BaseModel>,
      default: null,
      validator: (value: any) => value === null || value as any instanceof BaseModel ||
        // Allow static BaseModel class
        Boolean(value && (value as any).prototype instanceof BaseModel)
    },

    tag: {
      type: String,
      default: 'span'
    }
  },

  data: (): ComponentData => ({
    label: null
  }),

  // asyncComputed: {
  //   async label (): Promise<string | null> {
  //     configHandler.checkWarningUseAsyncComputed()
  //     return this.resolveLabel()
  //   }
  // },

  watch: {
    fieldObj () {
      this.setResolveLabel()
    }
  },

  created () {
    this.setResolveLabel()
  },

  methods: {
    async setResolveLabel () {
      if (!configHandler.useAsyncComputed()) {
        this.label = await this.resolveLabel()
      }
    },

    async resolveLabel () {
      if (this.fieldObj) {
        const field = this.fieldObj as Field
        return field.label
      } else {
        return null
      }
    },

    renderLabel (): VNode {
      if (this.$slots && this.$slots.default) {
        return h(this.tag, this.$slots.default({
          label: this.label
        }))
      }

      return h(this.tag, <string> this.label)
    }
  },

  render (): VNode {
    if (this.label) {
      return this.renderLabel()
    } else {
      return this.renderLoading()
    }
  }
})
