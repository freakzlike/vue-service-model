import DisplayComponentPropsMixin from './DisplayComponentPropsMixin'

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
