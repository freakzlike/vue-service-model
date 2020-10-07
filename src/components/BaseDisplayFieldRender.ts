import { defineComponent, reactive, toRefs, watch, VNode } from 'vue'
import props, { DisplayComponentProps } from '../mixins/DisplayComponentPropsMixin'
import { RenderableField } from '../fields/RenderableField'

export type RenderField = (field: RenderableField, renderData: any) => VNode
export type ResolveRenderData = (field: RenderableField, renderProps: object | null) => Promise<any>

export const BaseDisplayFieldRender = (
  props: DisplayComponentProps,
  renderField: RenderField,
  resolveRenderData: ResolveRenderData
) => {
  const { field, renderProps } = toRefs(props)

  const renderData: { data: any, resolved: boolean } = reactive({ data: null, resolved: false })

  const setResolveRenderData = async () => {
    renderData.data = await resolveRenderData(field.value, renderProps.value)
    renderData.resolved = true
  }

  const renderIfResolved = () => renderData.resolved ? renderField(field.value, renderData.data) : undefined

  setResolveRenderData()

  watch(field, setResolveRenderData)
  watch(field.value.data, setResolveRenderData, { deep: true })
  watch(renderProps, setResolveRenderData)

  return {
    field,
    renderProps,
    renderData,
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
    const renderField: RenderField = (field, renderData) => field.displayRender(renderData)
    const resolveRenderData: ResolveRenderData = (field, renderProps) =>
      field.prepareDisplayRender(renderProps)

    const { renderIfResolved } = BaseDisplayFieldRender(<DisplayComponentProps> props, renderField,
      resolveRenderData)
    return renderIfResolved
  }
})
