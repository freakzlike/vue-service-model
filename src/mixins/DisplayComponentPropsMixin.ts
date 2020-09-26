import Vue from 'vue'
import { RenderableField } from '../fields/RenderableField'

export default Vue.extend({
  props: {
    /**
     * Field instance
     */
    field: {
      type: RenderableField,
      required: true
    },

    /**
     * Additional render props
     */
    renderProps: {
      type: Object,
      default: null
    }
  }
})
