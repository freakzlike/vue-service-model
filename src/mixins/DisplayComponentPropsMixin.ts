import { RenderableField } from '../fields/RenderableField'

export interface DisplayComponentProps {
  field: RenderableField
  renderProps: object | null
}

export default {
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
