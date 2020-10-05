import DisplayComponentPropsMixin, { DisplayComponentProps } from './DisplayComponentPropsMixin'

export interface InputComponentProps extends DisplayComponentProps {
  disabled: boolean
  readonly: boolean
}

export default {
  ...DisplayComponentPropsMixin,
  disabled: {
    type: Boolean,
    default: false
  },

  readonly: {
    type: Boolean,
    default: false
  }
}
