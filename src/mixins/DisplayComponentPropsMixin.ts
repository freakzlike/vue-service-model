import { Field } from '../fields/Field'

export default {
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
