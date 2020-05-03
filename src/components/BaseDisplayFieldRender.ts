import AsyncComputed from 'vue-async-computed'
import Vue, { VNode, CreateElement } from 'vue'
import { Field } from '../fields/Field'
import cu from '../utils/common'

Vue.use(AsyncComputed)

export interface ComponentData {
  // AsyncComputed
  renderData?: any
}

export default Vue.extend({
  name: 'BaseDisplayFieldRender',
  inheritAttrs: false,

  props: {
    field: {
      type: Field,
      required: true
    }
  },

  data: (): ComponentData => ({}),

  computed: {
    hasResolvedRenderData () {
      return this.renderData !== cu.NO_VALUE
    }
  },

  asyncComputed: {
    renderData: {
      default: cu.NO_VALUE,
      get () {
        const field = this.field as Field
        return field.prepareDisplayRender()
      }
    }
  },

  methods: {
    renderField (h: CreateElement): VNode {
      return this.field.displayRender(h, this.renderData)
    }
  },

  render (h: CreateElement): VNode {
    if (this.hasResolvedRenderData) {
      return this.renderField(h)
    } else {
      return undefined as any
    }
  }
})
