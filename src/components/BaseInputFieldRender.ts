import { defineComponent, computed, watch, toRefs } from 'vue'
import { BaseDisplayFieldRender, RenderField, ResolveRenderData } from './BaseDisplayFieldRender'
import props, { InputComponentProps } from '../mixins/InputComponentPropsMixin'

export const BaseInputFieldRender = (props: InputComponentProps) => {
  const { disabled, readonly } = toRefs(props)

  const inputProps = computed(() => ({
    disabled: disabled.value,
    readonly: readonly.value
  }))

  const renderField: RenderField = (field, renderData) => field.inputRender(renderData)
  const resolveRenderData: ResolveRenderData = (field, renderProps) =>
    field.prepareInputRender(inputProps.value, renderProps)

  const baseDisplayFieldRender = BaseDisplayFieldRender(props, renderField, resolveRenderData)
  const { setResolveRenderData } = baseDisplayFieldRender

  watch(inputProps, setResolveRenderData)

  return {
    ...baseDisplayFieldRender,
    inputProps
  }
}

export default defineComponent({
  name: 'BaseInputFieldRender',
  props,

  setup (props) {
    const { renderIfResolved } = BaseInputFieldRender(<InputComponentProps> props)
    return renderIfResolved
  }
})
