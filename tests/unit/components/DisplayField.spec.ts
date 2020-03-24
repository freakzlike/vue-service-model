import Vue, { mount, Wrapper } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import DisplayField from '@/components/DisplayField'
import { BaseModel } from '@/models/BaseModel'

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

  const renderDisplayField = async (wrapper: Wrapper<Vue>) => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
  }

  it('should render correctly', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })
    expect(wrapper.vm.displayComponent).toBeNull()
    expect(wrapper.html()).toBeUndefined()

    await renderDisplayField(wrapper)

    expect(wrapper.vm.displayComponent).not.toBeNull()
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should not render without model', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        model: null,
        fieldName: 'name'
      }
    })

    await renderDisplayField(wrapper)

    expect(wrapper.vm.displayComponent).toBeNull()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toBeUndefined()
  })

  it('should not render when model reset', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })

    await renderDisplayField(wrapper)

    expect(wrapper.vm.displayComponent).not.toBeNull()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe(modelData.name)

    wrapper.setProps({ model: null })

    expect(wrapper.html()).toBeUndefined()

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

    await renderDisplayField(wrapper)

    expect(wrapper.vm.displayComponent).not.toBeNull()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toBe(modelData.name)

    wrapper.setProps({ fieldName: 'description' })

    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe(modelData.description)
  })
})
