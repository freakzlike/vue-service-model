import { createLocalVue, mount } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import DisplayField from '@/components/DisplayField'
import { BaseModel } from '@/models/BaseModel'
import { waitRender, installAsyncComputed } from '../../testUtils'

const TestDisplayField = (useAsyncComputed: boolean) => {
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
      name: new Field(),
      description: new Field()
    }
  }

  const model = new TestModel(modelData)

  const checkCorrectRender = async (propsData: object) => {
    const wrapper = mount(DisplayField, {
      localVue,
      propsData
    })

    expect(wrapper.vm.displayComponent).toBeNull()
    expect(wrapper.html()).toBe('')

    await waitRender.InputField(wrapper)

    expect(wrapper.vm.displayComponent).not.toBeNull()
    await wrapper.vm.$nextTick()

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
      localVue,
      propsData: {
        model: null,
        fieldName: 'name'
      }
    })

    await waitRender.DisplayField(wrapper)

    expect(wrapper.vm.displayComponent).toBeNull()
    expect(wrapper.html()).toBe('')
  })

  it('should not render when model reset', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    wrapper.setProps({ model: null })

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toBe('')

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.displayComponent).toBeNull()
  })

  it('should render correct when field name changed', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    wrapper.setProps({ fieldName: 'description' })

    await waitRender.DisplayFieldUpdate(wrapper)

    expect(wrapper.text()).toBe(modelData.description)
  })

  it('should render correct when field changed', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    })

    wrapper.setProps({ field: model.getField('description') })

    await waitRender.DisplayFieldUpdate(wrapper)

    expect(wrapper.text()).toBe(modelData.description)
  })

  it('should render correct loading slot', async () => {
    const wrapper = mount(DisplayField, {
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
    const wrapper = mount(DisplayField, {
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

describe('components/DisplayField', () => TestDisplayField(false))

describe('components/DisplayField asyncComputed', () => TestDisplayField(true))
