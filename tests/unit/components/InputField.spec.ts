import { mount } from '@vue/test-utils'
import { RenderableField } from '@/fields/RenderableField'
import InputField from '@/components/InputField'
import { BaseModel } from '@/models/BaseModel'
import { waitRender } from '../../testUtils'
import { h, nextTick } from 'vue'

const TestInputField = (useAsyncComputed: boolean) => {
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
    const wrapper = mount(InputField, {
      props
    })

    expect(wrapper.vm.inputComponent).toBeNull()
    expect(wrapper.html()).toRenderNothing()

    await waitRender.InputField()

    expect(wrapper.vm.inputComponent).not.toBeNull()
    await nextTick()

    expect(wrapper.html()).toBe('<input type="text">')
    const inputElement = wrapper.get('input')
    expect(inputElement.element.value).toBe(modelData.name)

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
    const wrapper = mount(InputField, {
      props: {
        model: null,
        fieldName: 'name'
      }
    })

    await waitRender.InputField()

    expect(wrapper.vm.inputComponent).toBeNull()
    await nextTick()
    expect(wrapper.html()).toRenderNothing()
  })

  it('should not render when model reset', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    const inputElement = wrapper.get('input')
    expect(inputElement.element.value).toBe(modelData.name)

    wrapper.setProps({ model: null })

    await nextTick()
    expect(wrapper.html()).toRenderNothing()

    await nextTick()
    expect(wrapper.vm.inputComponent).toBeNull()
  })

  it('should render correct when field name changed', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    const inputElement = wrapper.get('input')
    expect(inputElement.element.value).toBe(modelData.name)

    wrapper.setProps({ fieldName: 'description' })

    await waitRender.InputField()
    expect(inputElement.element.value).toBe(modelData.description)
  })

  it('should render correct when field changed', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    const inputElement = wrapper.get('input')
    expect(inputElement.element.value).toBe(modelData.name)

    wrapper.setProps({ field: model.getField('description') })

    await waitRender.InputField()
    expect(inputElement.element.value).toBe(modelData.description)
  })

  it('should render correct loading slot', async () => {
    const wrapper = mount(InputField, {
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

describe('components/InputField', () => TestInputField(false))

// describe('components/InputField asyncComputed', () => TestInputField(true))
