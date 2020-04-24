import Vue, { mount, Wrapper } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import FieldLabel from '@/components/FieldLabel'
import { BaseModel } from '@/models/BaseModel'

describe('components/FieldLabel', () => {
  const fieldLabels = {
    name: 'Name',
    description: 'Description'
  }

  class TestModel extends BaseModel {
    static fieldsDef = {
      name: new Field({ label: fieldLabels.name }),
      description: new Field({ label: () => Promise.resolve(fieldLabels.description) })
    }
  }

  const model = new TestModel({})

  const renderFieldLabel = async (wrapper: Wrapper<Vue>) => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
  }

  it('should render correctly with model and fieldName', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })
    expect(wrapper.vm.label).toBeNull()
    expect(wrapper.html()).toBeUndefined()

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.name)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render correctly with field', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        field: model.getField('name')
      }
    })
    expect(wrapper.vm.label).toBeNull()
    expect(wrapper.html()).toBeUndefined()

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.name)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render correctly with other tag', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        model: model,
        fieldName: 'description',
        tag: 'div'
      }
    })
    expect(wrapper.vm.label).toBeNull()
    expect(wrapper.html()).toBeUndefined()

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.description)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render correctly with scoped slot', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        field: model.getField('description'),
        tag: 'div'
      },
      scopedSlots: {
        default: '<p>{{props.label}}</p>'
      }
    })
    expect(wrapper.vm.label).toBeNull()
    expect(wrapper.html()).toBeUndefined()

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.description)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should not render without model', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        model: null,
        fieldName: 'name'
      }
    })

    expect(wrapper.vm.label).toBeNull()

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBeNull()
    expect(wrapper.html()).toBeUndefined()
  })

  it('should not render when model reset', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.name)
    expect(wrapper.text()).toBe(fieldLabels.name)

    wrapper.setProps({ model: null })

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toBeUndefined()
    expect(wrapper.vm.label).toBeNull()
  })

  it('should render correct when field name changed', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.name)
    expect(wrapper.text()).toBe(fieldLabels.name)

    wrapper.setProps({ fieldName: 'description' })

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.description)
    expect(wrapper.text()).toBe(fieldLabels.description)
  })

  it('should render correct when field changed', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        field: model.getField('name')
      }
    })

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.name)
    expect(wrapper.text()).toBe(fieldLabels.name)

    wrapper.setProps({ field: model.getField('description') })

    await renderFieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.description)
    expect(wrapper.text()).toBe(fieldLabels.description)
  })
})
