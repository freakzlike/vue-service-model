import { defineComponent, computed, ref, toRefs, watch } from 'vue'
import cu from '../utils/common'
import props from '../mixins/DisplayComponentPropsMixin'
import { Field } from '@/fields/Field'

export interface Props {
  field: Field
  renderProps: object | null
}

export const BaseDisplayFieldRender = (props: Props) => {
  const { field, renderProps } = toRefs(props)

  const renderData: { value: any } = ref(cu.NO_VALUE)
  const hasResolvedRenderData = computed(() => renderData.value !== cu.NO_VALUE)

  const resolveRenderData = async () => {
    return field.value.prepareDisplayRender(renderProps.value)
  }
  const setResolveRenderData = async () => {
    return renderData.value = await resolveRenderData()
  }

  const renderField = () => field.value.displayRender(renderData.value)

  const renderIfResolved = () => (hasResolvedRenderData ? renderField() : undefined)

  setResolveRenderData()

  watch(field, setResolveRenderData)
  watch(field.value.data, setResolveRenderData, {deep: true})
  watch(renderProps, setResolveRenderData)

  return {
    field,
    renderProps,
    renderData,
    hasResolvedRenderData,
    resolveRenderData,
    setResolveRenderData,
    renderField,
    renderIfResolved
  }
}

export default defineComponent({
  name: 'BaseDisplayFieldRender',
  inheritAttrs: false,
  props,

  setup (props) {
    return BaseDisplayFieldRender(<Props> props)
  },

  render () {
    return this.renderIfResolved()
  }
})
