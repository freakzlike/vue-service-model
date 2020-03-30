import { shallowMount } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import BaseInputFieldRender from '@/components/BaseInputFieldRender'
import { BaseModel } from '@/models/BaseModel'

describe('components/BaseInputFieldRender', () => {
  const modelData = { name: 'Name 1' }

  class TestModel extends BaseModel {
    static fieldsDef = {
      name: new Field()
    }
  }

  const model = new TestModel(modelData)
  const field = model.getField('name') as Field

  it('should call and render correct inputRender', async () => {
    const spyInputRender = jest.spyOn(field, 'inputRender')

    const wrapper = shallowMount(BaseInputFieldRender, {
      propsData: { field: field }
    })
    expect(wrapper.text()).toBe('')

    expect(spyInputRender).toBeCalledTimes(0)

    await wrapper.vm.$nextTick()

    expect(spyInputRender).toBeCalledTimes(1)
    const inputElement = wrapper.find('input')
    expect(inputElement.is('input')).toBe(true)

    expect(inputElement.attributes('type')).toBe('text')
    expect(inputElement.attributes('value')).toBe(modelData.name)

    field.value = 'New Name'
    await wrapper.vm.$nextTick()

    expect(spyInputRender).toBeCalledTimes(2)
    expect(inputElement.attributes('value')).toBe('New Name')
  })

  it('should handle input event and set value', async () => {
    modelData.name = 'Name 1'
    const spyValueSetter = jest.spyOn(field, 'valueSetter')

    const wrapper = shallowMount(BaseInputFieldRender, {
      propsData: { field: field }
    })
    await wrapper.vm.$nextTick()
    const inputElement = wrapper.find('input')
    expect(inputElement.is('input')).toBe(true)

    expect(inputElement.attributes('type')).toBe('text')
    expect(inputElement.attributes('value')).toBe(modelData.name)

    inputElement.setValue('Name 2')

    expect(modelData.name).toBe('Name 2')
    expect(spyValueSetter).toBeCalledTimes(1)
  })

  it('should render correctly', async () => {
    modelData.name = 'Name 1'
    const wrapper = shallowMount(BaseInputFieldRender, {
      propsData: { field: field }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})
