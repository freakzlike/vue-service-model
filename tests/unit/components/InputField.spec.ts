import { createLocalVue, mount } from '@vue/test-utils'
import { RenderableField } from '@/fields/RenderableField'
import InputField from '@/components/InputField'
import { BaseModel } from '@/models/BaseModel'
import { installAsyncComputed, waitRender } from '../../testUtils'

const TestInputField = (useAsyncComputed: boolean) => {
  const localVue = createLocalVue()

  if (useAsyncComputed) {
    installAsyncComputed(localVue)
  }

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

  const checkCorrectRender = async (propsData: object) => {
    const wrapper = mount(InputField, {
      localVue,
      propsData
    })

    expect(wrapper.vm.inputComponent).toBeNull()
    expect(wrapper.html()).toBe('')

    await waitRender.InputField(wrapper)

    expect(wrapper.vm.inputComponent).not.toBeNull()
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toBe('<input type="text" value="Name 1">')

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
      localVue,
      propsData: {
        model: null,
        fieldName: 'name'
      }
    })

    await waitRender.InputField(wrapper)

    expect(wrapper.vm.inputComponent).toBeNull()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toBe('')
  })

  it('should not render when model reset', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    const inputElement = wrapper.get('input')
    expect(inputElement.attributes('value')).toBe(modelData.name)

    wrapper.setProps({ model: null })

    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toBe('')

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.inputComponent).toBeNull()
  })

  it('should render correct when field name changed', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    const inputElement = wrapper.get('input')
    expect(inputElement.attributes('value')).toBe(modelData.name)

    wrapper.setProps({ fieldName: 'description' })

    await waitRender.InputField(wrapper)
    expect(inputElement.attributes('value')).toBe(modelData.description)
  })

  it('should render correct when field changed', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    const inputElement = wrapper.get('input')
    expect(inputElement.attributes('value')).toBe(modelData.name)

    wrapper.setProps({ field: model.getField('description') })

    await waitRender.InputField(wrapper)
    expect(inputElement.attributes('value')).toBe(modelData.description)
  })

  it('should render correct loading slot', async () => {
    const wrapper = mount(InputField, {
      localVue,
      propsData: {
        field: model.getField('name')
      },
      slots: {
        loading: '<span>Loading</span>'
      }
    })
    expect(wrapper.html()).toBe('<div><span>Loading</span></div>')
  })

  it('should render correct loading scoped slot', async () => {
    const wrapper = mount(InputField, {
      localVue,
      propsData: {
        field: model.getField('name')
      },
      scopedSlots: {
        loading: '<span>Loading</span>'
      }
    })
    expect(wrapper.html()).toBe('<div><span>Loading</span></div>')
  })
}

describe('components/InputField', () => TestInputField(false))

describe('components/InputField asyncComputed', () => TestInputField(true))
