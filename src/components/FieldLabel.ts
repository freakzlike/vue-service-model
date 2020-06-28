import { VNode, CreateElement } from 'vue'
import mixins from '../utils/mixins'
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
export default mixins(LoadingSlotMixin, FieldPropsMixin).extend({
  name: 'FieldLabel',
  inheritAttrs: false,

  props: {
    model: {
      default: null,
      validator: value => value === null || value as any instanceof BaseModel ||
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

  asyncComputed: {
    async label (): Promise<string | null> {
      configHandler.checkWarningUseAsyncComputed()
      return this.resolveLabel()
    }
  },

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

    renderLabel (h: CreateElement): VNode {
      if (this.$scopedSlots && this.$scopedSlots.default) {
        return h(this.tag, this.$scopedSlots.default({
          label: this.label
        }))
      } else {
        return h(this.tag, this.label)
      }
    }
  },

  render (h: CreateElement): VNode {
    if (this.label) {
      return this.renderLabel(h)
    } else {
      return this.renderLoading(h)
    }
  }
})
