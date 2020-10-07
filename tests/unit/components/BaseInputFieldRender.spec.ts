import { mount } from '@vue/test-utils'
import { RenderableField } from '@/fields/RenderableField'
import BaseInputFieldRender from '@/components/BaseInputFieldRender'
import { BaseModel } from '@/models/BaseModel'
import { nextTick } from 'vue'

const TestBaseInputFieldRender = (useAsyncComputed: boolean) => {
  // TODO
  // if (useAsyncComputed) {
  //   installAsyncComputed(localVue)
  // }

  const modelData = { name: 'Name 1' }

  class TestModel extends BaseModel {
    static fieldsDef = {
      name: new RenderableField()
    }
  }

  const model = new TestModel(modelData)
  const field = model.getField('name') as RenderableField

  const waitForRender = async () => {
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
  }

  it('should call and render correct inputRender', async () => {
    const spyPrepareInputRender = jest.spyOn(field, 'prepareInputRender')
    const spyInputRender = jest.spyOn(field, 'inputRender')

    const wrapper = mount(BaseInputFieldRender, {
      props: { field: field }
    })
    expect(wrapper.text()).toBe('')

    expect(spyPrepareInputRender).toBeCalledTimes(1)
    expect(spyInputRender).toBeCalledTimes(0)

    await waitForRender()

    expect(spyPrepareInputRender).toBeCalledTimes(1)
    expect(spyInputRender).toBeCalledTimes(1)
    const inputElement = wrapper.get('input')

    expect(inputElement.attributes('type')).toBe('text')
    expect(inputElement.element.value).toBe(modelData.name)

    field.value = 'New Name'
    await waitForRender()

    expect(spyPrepareInputRender).toBeCalledTimes(2)
    expect(spyInputRender).toBeCalledTimes(2)
    expect(inputElement.element.value).toBe('New Name')
  })

  it('should handle input event and set value', async () => {
    const spyValueSetter = jest.spyOn(field, 'valueSetter')

    const wrapper = mount(BaseInputFieldRender, {
      props: { field: field }
    })
    await waitForRender()
    const inputElement = wrapper.get('input')

    expect(inputElement.attributes('type')).toBe('text')
    expect(inputElement.element.value).toBe(modelData.name)

    inputElement.setValue('Name 2')

    await nextTick()

    expect(modelData.name).toBe('Name 2')
    expect(spyValueSetter).toBeCalledTimes(1)
  })

  it('should render correctly', async () => {
    const wrapper = mount(BaseInputFieldRender, {
      props: { field: field }
    })
    await waitForRender()
    expect(wrapper.html()).toBe('<input type="text">')
  })

  it('should re-render on inputProps change', async () => {
    const wrapper = mount(BaseInputFieldRender, {
      props: {
        field: field,
        disabled: true
      }
    })

    await waitForRender()
    expect(wrapper.html()).toBe('<input type="text" disabled="">')

    wrapper.setProps({ disabled: false })

    await waitForRender()
    expect(wrapper.html()).toBe('<input type="text">')
  })
}

describe('components/BaseInputFieldRender', () => TestBaseInputFieldRender(false))

// describe('components/BaseInputFieldRender asyncComputed', () => TestBaseInputFieldRender(true))
