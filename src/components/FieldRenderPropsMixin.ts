import Vue from 'vue'
import { Field } from '../fields/Field'

export default Vue.extend({
  props: {
    /**
     * Field instance
     */
    field: {
      type: Field,
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
