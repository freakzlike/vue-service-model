import { shallowMount } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import BaseInputFieldRender from '@/components/BaseInputFieldRender'
import { BaseModel } from '@/models/BaseModel'
import { installAsyncComputed } from '../../testUtils'
import { createApp, nextTick } from 'vue'

const TestBaseInputFieldRender = (useAsyncComputed: boolean) => {
  const localVue = createApp({})

  // TODO
  // if (useAsyncComputed) {
  //   installAsyncComputed(localVue)
  // }

  const modelData = { name: 'Name 1' }

  class TestModel extends BaseModel {
    static fieldsDef = {
      name: new Field()
    }
  }

  const model = new TestModel(modelData)
  const field = model.getField('name') as Field

  const waitForRender = async () => {
    await nextTick()
    await nextTick()
    await nextTick()
  }

  it('should call and render correct inputRender', async () => {
    const spyPrepareInputRender = jest.spyOn(field, 'prepareInputRender')
    const spyInputRender = jest.spyOn(field, 'inputRender')

    // @ts-ignore
    const wrapper = shallowMount(BaseInputFieldRender, {
      localVue,
      propsData: { field: field }
    })
    expect(wrapper.text()).toBe('')

    expect(spyPrepareInputRender).toBeCalledTimes(1)
    expect(spyInputRender).toBeCalledTimes(0)

    await waitForRender()

    expect(spyPrepareInputRender).toBeCalledTimes(1)
    expect(spyInputRender).toBeCalledTimes(1)
    const inputElement = wrapper.get('input')

    expect(inputElement.attributes('type')).toBe('text')
    expect(inputElement.attributes('value')).toBe(modelData.name)

    field.value = 'New Name'
    await waitForRender()

    expect(spyPrepareInputRender).toBeCalledTimes(2)
    expect(spyInputRender).toBeCalledTimes(2)
    expect(inputElement.attributes('value')).toBe('New Name')
  })

  it('should handle input event and set value', async () => {
    modelData.name = 'Name 1'
    const spyValueSetter = jest.spyOn(field, 'valueSetter')

    // @ts-ignore
    const wrapper = shallowMount(BaseInputFieldRender, {
      localVue,
      propsData: { field: field }
    })
    await waitForRender()
    const inputElement = wrapper.get('input')

    expect(inputElement.attributes('type')).toBe('text')
    expect(inputElement.attributes('value')).toBe(modelData.name)

    inputElement.setValue('Name 2')

    expect(modelData.name).toBe('Name 2')
    expect(spyValueSetter).toBeCalledTimes(1)
  })

  it('should render correctly', async () => {
    modelData.name = 'Name 1'
    // @ts-ignore
    const wrapper = shallowMount(BaseInputFieldRender, {
      localVue,
      propsData: { field: field }
    })
    await waitForRender()
    expect(wrapper.html()).toBe('<input type="text" value="Name 1">')
  })

  it('should re-render on inputProps change', async () => {
    modelData.name = 'Name 1'
    // @ts-ignore
    const wrapper = shallowMount(BaseInputFieldRender, {
      localVue,
      propsData: {
        field: field,
        disabled: true
      }
    })

    await waitForRender()
    expect(wrapper.html()).toBe('<input type="text" value="Name 1" disabled="disabled">')

    wrapper.setProps({ disabled: false })

    await waitForRender()
    expect(wrapper.html()).toBe('<input type="text" value="Name 1">')
  })
}

describe('components/BaseInputFieldRender', () => TestBaseInputFieldRender(false))

describe('components/BaseInputFieldRender asyncComputed', () => TestBaseInputFieldRender(true))
