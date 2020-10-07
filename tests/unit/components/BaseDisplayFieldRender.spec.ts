import { mount } from '@vue/test-utils'
import { RenderableField } from '@/fields/RenderableField'
import BaseDisplayFieldRender from '@/components/BaseDisplayFieldRender'
import { BaseModel } from '@/models/BaseModel'
import { nextTick } from 'vue'

const TestBaseDisplayFieldRender = (useAsyncComputed: boolean) => {
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
  }

  it('should call and render correct displayRender', async () => {
    const spyPrepareDisplayRender = jest.spyOn(field, 'prepareDisplayRender')
    const spyDisplayRender = jest.spyOn(field, 'displayRender')

    const wrapper = mount(BaseDisplayFieldRender, {
      props: { field }
    })
    expect(wrapper.text()).toBe('')

    expect(spyPrepareDisplayRender).toBeCalledTimes(1)
    expect(spyDisplayRender).toBeCalledTimes(0)

    await waitForRender()

    expect(wrapper.text()).toBe(modelData.name)
    expect(spyPrepareDisplayRender).toBeCalledTimes(1)
    expect(spyPrepareDisplayRender.mock.calls[0]).toEqual([null])
    expect(spyDisplayRender).toBeCalledTimes(1)

    field.value = 'New Name'
    await waitForRender()

    expect(wrapper.text()).toBe('New Name')
    expect(spyPrepareDisplayRender).toBeCalledTimes(2)
    expect(spyDisplayRender).toBeCalledTimes(2)

    spyPrepareDisplayRender.mockRestore()
    spyDisplayRender.mockRestore()
  })

  it('should render correctly', async () => {
    modelData.name = 'Name 1'
    const wrapper = mount(BaseDisplayFieldRender, {
      props: { field }
    })
    await waitForRender()
    expect(wrapper.html()).toBe('<span>Name 1</span>')
  })

  it('should pass render props to prepareDisplayRender', async () => {
    const spyPrepareDisplayRender = jest.spyOn(field, 'prepareDisplayRender')

    const wrapper = mount(BaseDisplayFieldRender, {
      props: {
        field,
        renderProps: {
          option: 5
        }
      }
    })
    expect(wrapper.text()).toBe('')

    expect(spyPrepareDisplayRender).toBeCalledTimes(1)
    expect(spyPrepareDisplayRender.mock.calls[0]).toEqual([{ option: 5 }])

    await waitForRender()

    wrapper.setProps({ renderProps: { option: 7, newOption: 6 } })
    await waitForRender()

    expect(spyPrepareDisplayRender).toBeCalledTimes(2)
    expect(spyPrepareDisplayRender.mock.calls[1]).toEqual([{ option: 7, newOption: 6 }])

    spyPrepareDisplayRender.mockRestore()
  })
}

describe('components/BaseDisplayFieldRender', () => TestBaseDisplayFieldRender(false))

// describe('components/BaseDisplayFieldRender asyncComputed', () => TestBaseDisplayFieldRender(true))
