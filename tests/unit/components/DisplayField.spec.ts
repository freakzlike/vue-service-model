import { mount } from '@vue/test-utils'
import { RenderableField } from '@/fields/RenderableField'
import DisplayField from '@/components/DisplayField'
import { BaseModel } from '@/models/BaseModel'
import { waitRender } from '../../testUtils'
import { h, nextTick } from 'vue'

const TestDisplayField = (useAsyncComputed: boolean) => {
  // TODO: vue-async-computed
  // if (useAsyncComputed) {
  //   installAsyncComputed(localVue)
  // }

  const modelData = {
    name: 'Name 1',
    description: 'Description'
  }

  class TestModel extends BaseModel {
    static fieldsDef = {
      name: new RenderableField(),
      description: new RenderableField()
    }
  }

  const model = new TestModel(modelData)

  const checkCorrectRender = async (props: object) => {
    const wrapper = mount(DisplayField, {
      props
    })

    expect(wrapper.vm.displayComponent).toBeNull()
    expect(wrapper.html()).toRenderNothing()

    await waitRender.InputField()

    expect(wrapper.vm.displayComponent).not.toBeNull()
    await nextTick()

    expect(wrapper.html()).toBe('<span>Name 1</span>')

    return wrapper
  }

  it('should render correctly with model and fieldName', async () => {
    await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })
  })

  it('should render correctly with field', async () => {
    await checkCorrectRender({
      field: model.getField('name')
    })
  })

  it('should not render without model', async () => {
    const wrapper = mount(DisplayField, {
      props: {
        model: null,
        fieldName: 'name'
      }
    })

    await waitRender.DisplayField()

    expect(wrapper.vm.displayComponent).toBeNull()
    expect(wrapper.html()).toRenderNothing()
  })

  it('should not render when model reset', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    wrapper.setProps({ model: null })

    await nextTick()

    expect(wrapper.html()).toRenderNothing()

    await nextTick()
    expect(wrapper.vm.displayComponent).toBeNull()
  })

  it('should render correct when field name changed', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    wrapper.setProps({ fieldName: 'description' })

    await waitRender.DisplayFieldUpdate()

    expect(wrapper.text()).toBe(modelData.description)
  })

  it('should render correct when field changed', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    wrapper.setProps({ field: model.getField('description') })

    await waitRender.DisplayFieldUpdate()

    expect(wrapper.text()).toBe(modelData.description)
  })

  it('should render correct loading slot', async () => {
    const wrapper = mount(DisplayField, {
      props: {
        field: model.getField('name') as RenderableField
      },
      slots: {
        loading: () => h('span', 'Loading')
      }
    })
    expect(wrapper.html()).toBe('<div><span>Loading</span></div>')
  })
}

describe('components/DisplayField', () => TestDisplayField(false))

// describe('components/DisplayField asyncComputed', () => TestDisplayField(true))
