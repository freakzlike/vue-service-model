import { defineComponent, computed, watch, toRefs } from 'vue'
import { BaseDisplayFieldRender } from './BaseDisplayFieldRender'
import props from '../mixins/InputComponentPropsMixin'
import { Field } from "@/fields";

export interface Props {
  field: Field
  renderProps: object | null
  disabled: boolean
  readonly: boolean
}

export const BaseInputFieldRender = (props: Props) => {
  const { disabled, readonly } = toRefs(props)

  const baseDisplayFieldRender = BaseDisplayFieldRender(props)
  const {
    field,
    renderProps,
    renderData,
    setResolveRenderData
  } = baseDisplayFieldRender

  const inputProps = computed(() => ({
    disabled: disabled.value,
    readonly: readonly.value
  }))

  const resolveRenderData = async () => field.value.prepareInputRender(inputProps.value, renderProps.value)

  const renderField = () => field.value.inputRender(renderData.value)

  watch(inputProps, setResolveRenderData)

  return {
    ...baseDisplayFieldRender,
    inputProps,
    resolveRenderData,
    renderField
  }
}

export default defineComponent({
  name: 'BaseInputFieldRender',
  props,

  setup (props) {
    const { hasResolvedRenderData, renderField } = BaseInputFieldRender(<Props> props)
    return () => (hasResolvedRenderData ? renderField() : undefined as any)
  }
})
