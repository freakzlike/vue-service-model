import { VNode, CreateElement } from 'vue'
import cu from '../utils/common'
import { configHandler } from '../utils/ConfigHandler'
import DisplayComponentPropsMixin from '../mixins/DisplayComponentPropsMixin'

export interface ComponentData {
  renderData: any
}

export default DisplayComponentPropsMixin.extend({
  name: 'BaseDisplayFieldRender',
  inheritAttrs: false,

  data: (): ComponentData => ({
    renderData: cu.NO_VALUE
  }),

  computed: {
    hasResolvedRenderData () {
      return this.renderData !== cu.NO_VALUE
    }
  },

  asyncComputed: {
    renderData: {
      default: cu.NO_VALUE,
      get () {
        const _self = this as {resolveRenderData: () => Promise<any>}
        return _self.resolveRenderData()
      }
    }
  },

  watch: {
    field () {
      this.setResolveRenderData()
    },
    'field.data': {
      deep: true,
      handler () {
        this.setResolveRenderData()
      }
    },
    renderProps: {
      deep: true,
      handler () {
        this.setResolveRenderData()
      }
    }
  },

  created () {
    this.setResolveRenderData()
  },

  methods: {
    async setResolveRenderData () {
      if (!configHandler.useAsyncComputed()) {
        this.renderData = await this.resolveRenderData()
      }
    },

    async resolveRenderData (): Promise<any> {
      return this.field.prepareDisplayRender(this.renderProps)
    },

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
