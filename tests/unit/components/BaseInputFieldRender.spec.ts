import Vue, { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import BaseInputFieldRender from '@/components/BaseInputFieldRender'
import { BaseModel } from '@/models/BaseModel'
import { installAsyncComputed } from '../../testUtils'

const TestBaseInputFieldRender = (useAsyncComputed: boolean) => {
  const localVue = createLocalVue()

  if (useAsyncComputed) {
    installAsyncComputed(localVue)
  }

  const modelData = { name: 'Name 1' }

  class TestModel extends BaseModel {
    static fieldsDef = {
      name: new Field()
    }
  }

  const model = new TestModel(modelData)
  const field = model.getField('name') as Field

  const waitForRender = async (wrapper: Wrapper<Vue>) => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
  }

  it('should call and render correct inputRender', async () => {
    const spyPrepareInputRender = jest.spyOn(field, 'prepareInputRender')
    const spyInputRender = jest.spyOn(field, 'inputRender')

    const wrapper = shallowMount(BaseInputFieldRender, {
      localVue,
      propsData: { field: field }
    })
    expect(wrapper.text()).toBe('')

    expect(spyPrepareInputRender).toBeCalledTimes(1)
    expect(spyInputRender).toBeCalledTimes(0)

    await waitForRender(wrapper)

    expect(spyPrepareInputRender).toBeCalledTimes(1)
    expect(spyInputRender).toBeCalledTimes(1)
    const inputElement = wrapper.get('input')

    expect(inputElement.attributes('type')).toBe('text')
    expect(inputElement.attributes('value')).toBe(modelData.name)

    field.value = 'New Name'
    await waitForRender(wrapper)

    expect(spyPrepareInputRender).toBeCalledTimes(2)
    expect(spyInputRender).toBeCalledTimes(2)
    expect(inputElement.attributes('value')).toBe('New Name')
  })

  it('should handle input event and set value', async () => {
    modelData.name = 'Name 1'
    const spyValueSetter = jest.spyOn(field, 'valueSetter')

    const wrapper = shallowMount(BaseInputFieldRender, {
      localVue,
      propsData: { field: field }
    })
    await waitForRender(wrapper)
    const inputElement = wrapper.get('input')

    expect(inputElement.attributes('type')).toBe('text')
    expect(inputElement.attributes('value')).toBe(modelData.name)

    inputElement.setValue('Name 2')

    expect(modelData.name).toBe('Name 2')
    expect(spyValueSetter).toBeCalledTimes(1)
  })

  it('should render correctly', async () => {
    modelData.name = 'Name 1'
    const wrapper = shallowMount(BaseInputFieldRender, {
      localVue,
      propsData: { field: field }
    })
    await waitForRender(wrapper)
    expect(wrapper.html()).toBe('<input type="text" value="Name 1">')
  })
}

describe('components/BaseInputFieldRender', () => TestBaseInputFieldRender(false))

describe('components/BaseInputFieldRender asyncComputed', () => TestBaseInputFieldRender(true))
