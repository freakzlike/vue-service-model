import { createLocalVue, mount } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import FieldLabel from '@/components/FieldLabel'
import { BaseModel } from '@/models/BaseModel'
import { installAsyncComputed, waitRender } from '../../testUtils'

const TestFieldLabel = (useAsyncComputed: boolean) => {
  const localVue = createLocalVue()

  if (useAsyncComputed) {
    installAsyncComputed(localVue)
  }

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

  const checkCorrectRender = async (propsData: object, expectedLabel: string | null, options?: object) => {
    const wrapper = mount(FieldLabel, {
      localVue,
      propsData,
      ...(options || {})
    })

    expect(wrapper.vm.label).toBeNull()
    expect(wrapper.html()).toBe('')

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(expectedLabel)

    return wrapper
  }

  it('should render correctly with static model and fieldName', async () => {
    const wrapper = await checkCorrectRender({
      model: TestModel,
      fieldName: 'name'
    }, fieldLabels.name)

    expect(wrapper.html()).toBe('<span>Name</span>')
  })

  it('should render correctly with model and fieldName', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    }, fieldLabels.name)

    expect(wrapper.html()).toBe('<span>Name</span>')
  })

  it('should render correctly with field', async () => {
    const wrapper = await checkCorrectRender({
      field: model.getField('name')
    }, fieldLabels.name)

    expect(wrapper.html()).toBe('<span>Name</span>')
  })

  it('should render correctly with unbound field', async () => {
    const wrapper = await checkCorrectRender({
      field: new Field({ label: 'New Field' })
    }, 'New Field')

    expect(wrapper.html()).toBe('<span>New Field</span>')
  })

  it('should render correctly with other tag', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'description',
      tag: 'div'
    }, fieldLabels.description)

    expect(wrapper.html()).toBe('<div>Description</div>')
  })

  it('should render correctly with scoped slot', async () => {
    const wrapper = await checkCorrectRender({
      field: model.getField('description'),
      tag: 'div'
    }, fieldLabels.description, {
      scopedSlots: {
        default: '<p>{{props.label}}</p>'
      }
    })

    expect(wrapper.html()).toBe('<div>\n  <p>Description</p>\n</div>')
  })

  it('should not render without model', async () => {
    const wrapper = await checkCorrectRender({
      model: null,
      fieldName: 'name'
    }, null)

    expect(wrapper.html()).toBe('')
  })

  it('should not render when model reset', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    }, fieldLabels.name)
    expect(wrapper.text()).toBe(fieldLabels.name)

    wrapper.setProps({ model: null })

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.html()).toBe('')
    expect(wrapper.vm.label).toBeNull()
  })

  it('should render correct when field name changed', async () => {
    const wrapper = await checkCorrectRender({
      model: model,
      fieldName: 'name'
    }, fieldLabels.name)
    expect(wrapper.text()).toBe(fieldLabels.name)

    wrapper.setProps({ fieldName: 'description' })

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.description)
    expect(wrapper.text()).toBe(fieldLabels.description)
  })

  it('should render correct when field changed', async () => {
    const wrapper = await checkCorrectRender({
      field: model.getField('name')
    }, fieldLabels.name)
    expect(wrapper.text()).toBe(fieldLabels.name)

    wrapper.setProps({ field: model.getField('description') })

    await waitRender.FieldLabel(wrapper)

    expect(wrapper.vm.label).toBe(fieldLabels.description)
    expect(wrapper.text()).toBe(fieldLabels.description)
  })

  it('should render correct loading slot', async () => {
    const wrapper = mount(FieldLabel, {
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
    const wrapper = mount(FieldLabel, {
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

describe('components/FieldLabel', () => TestFieldLabel(false))

describe('components/FieldLabel asyncComputed', () => TestFieldLabel(true))
