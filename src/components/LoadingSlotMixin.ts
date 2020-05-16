import Vue, { CreateElement, VNode } from 'vue'

/**
 * Mixin to add render of loading with loading slot
 */
export default Vue.extend({
  methods: {
    renderDefaultLoading (h: CreateElement): VNode {
      return undefined as any
    },
    renderLoading (h: CreateElement): VNode {
      if (this.$slots && this.$slots.loading) {
        return h('div', this.$slots.loading)
      } else if (this.$scopedSlots && this.$scopedSlots.loading) {
        return h('div', this.$scopedSlots.loading({}))
      } else {
        return this.renderDefaultLoading(h)
      }
    }
  }
})
