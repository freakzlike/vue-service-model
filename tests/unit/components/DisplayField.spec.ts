import { mount } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import DisplayField from '@/components/DisplayField'
import { BaseModel } from '@/models/BaseModel'
import { waitRender } from '../../testUtils'

describe('components/DisplayField', () => {
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

  it('should render correctly with model and fieldName', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })
    expect(wrapper.vm.displayComponent).toBeNull()
    expect(wrapper.html()).toBe('')

    await waitRender.DisplayField(wrapper)

    expect(wrapper.vm.displayComponent).not.toBeNull()
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render correctly with field', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        field: model.getField('name')
      }
    })
    expect(wrapper.vm.displayComponent).toBeNull()
    expect(wrapper.html()).toBe('')

    await waitRender.DisplayField(wrapper)

    expect(wrapper.vm.displayComponent).not.toBeNull()
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should not render without model', async () => {
    const wrapper = mount(DisplayField, {
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
    const wrapper = mount(DisplayField, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })

    await waitRender.DisplayField(wrapper)

    expect(wrapper.vm.displayComponent).not.toBeNull()
    expect(wrapper.text()).toBe(modelData.name)

    wrapper.setProps({ model: null })

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toBe('')

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.displayComponent).toBeNull()
  })

  it('should render correct when field name changed', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })

    await waitRender.DisplayField(wrapper)

    expect(wrapper.vm.displayComponent).not.toBeNull()

    expect(wrapper.text()).toBe(modelData.name)

    wrapper.setProps({ fieldName: 'description' })

    await waitRender.DisplayFieldUpdate(wrapper)

    expect(wrapper.text()).toBe(modelData.description)
  })

  it('should render correct when field changed', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        field: model.getField('name')
      }
    })

    await waitRender.DisplayField(wrapper)

    expect(wrapper.vm.displayComponent).not.toBeNull()

    expect(wrapper.text()).toBe(modelData.name)

    wrapper.setProps({ field: model.getField('description') })

    await waitRender.DisplayFieldUpdate(wrapper)

    expect(wrapper.text()).toBe(modelData.description)
  })
})
