import { defineComponent, h, VNode } from 'vue'

/**
 * Mixin to add render of loading with loading slot
 */
export default defineComponent({
  methods: {
    renderDefaultLoading (): VNode {
      return undefined as any
    },
    renderLoading (): VNode {
      if (this.$slots && this.$slots.loading) {
        return h('div', this.$slots.loading())
      } else {
        return this.renderDefaultLoading()
      }
    }
  }
})
