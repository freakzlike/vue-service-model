import DisplayComponentPropsMixin from './DisplayComponentPropsMixin'

export default DisplayComponentPropsMixin.extend({
  props: {
    disabled: {
      type: Boolean,
      default: false
    },

    readonly: {
      type: Boolean,
      default: false
    }
  }
})
