import { mount } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import FieldLabel from '@/components/FieldLabel'
import { BaseModel } from '@/models/BaseModel'
import { waitRender } from '../../testUtils'

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

  it('should render correctly with model and fieldName', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })
    expect(wrapper.vm.label).toBeNull()
    expect(wrapper.html()).toBe('')

    await waitRender.FieldLabel(wrapper)

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
    expect(wrapper.html()).toBe('')

    await waitRender.FieldLabel(wrapper)

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
    expect(wrapper.html()).toBe('')

    await waitRender.FieldLabel(wrapper)

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
    expect(wrapper.html()).toBe('')

    await waitRender.FieldLabel(wrapper)

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

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.vm.label).toBeNull()
    expect(wrapper.html()).toBe('')
  })

  it('should not render when model reset', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.name)
    expect(wrapper.text()).toBe(fieldLabels.name)

    wrapper.setProps({ model: null })

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.html()).toBe('')
    expect(wrapper.vm.label).toBeNull()
  })

  it('should render correct when field name changed', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        model: model,
        fieldName: 'name'
      }
    })

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.name)
    expect(wrapper.text()).toBe(fieldLabels.name)

    wrapper.setProps({ fieldName: 'description' })

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.description)
    expect(wrapper.text()).toBe(fieldLabels.description)
  })

  it('should render correct when field changed', async () => {
    const wrapper = mount(FieldLabel, {
      propsData: {
        field: model.getField('name')
      }
    })

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.name)
    expect(wrapper.text()).toBe(fieldLabels.name)

    wrapper.setProps({ field: model.getField('description') })

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.description)
    expect(wrapper.text()).toBe(fieldLabels.description)
  })
})
