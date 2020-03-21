import { mount } from '@vue/test-utils'
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

  it('should render correctly', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })
    expect(wrapper.vm.displayComponent).toBeNull()
    expect(wrapper.vm.displayComponentPromise).not.toBeNull()

    expect(wrapper.html()).toBeUndefined()

    await wrapper.vm.displayComponentPromise

    expect(wrapper.vm.displayComponent).not.toBeNull()

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should reset displayComponent when field changes', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })

    expect(wrapper.vm.displayComponentPromise).not.toBeNull()
    await wrapper.vm.displayComponentPromise

    expect(wrapper.vm.displayComponent).not.toBeNull()

    wrapper.setProps({ fieldName: 'description' })

    expect(wrapper.vm.displayComponent).toBeNull()
  })

  it('should not render without model', async () => {
    const wrapper = mount(DisplayField, {
      propsData: {
        model: null,
        fieldName: 'name'
      }
    })
    expect(wrapper.vm.displayComponent).toBeNull()
    expect(wrapper.vm.displayComponentPromise).toBeNull()
    expect(wrapper.html()).toBeUndefined()
  })
})
