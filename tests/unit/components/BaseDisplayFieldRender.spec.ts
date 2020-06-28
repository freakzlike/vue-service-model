import Vue, { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import BaseDisplayFieldRender from '@/components/BaseDisplayFieldRender'
import { BaseModel } from '@/models/BaseModel'
import { installAsyncComputed } from '../../testUtils'

const TestBaseDisplayFieldRender = (useAsyncComputed: boolean) => {
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

  it('should call and render correct displayRender', async () => {
    const spyPrepareDisplayRender = jest.spyOn(field, 'prepareDisplayRender')
    const spyDisplayRender = jest.spyOn(field, 'displayRender')

    const wrapper = shallowMount(BaseDisplayFieldRender, {
      localVue,
      propsData: { field: field }
    })
    expect(wrapper.text()).toBe('')

    expect(spyPrepareDisplayRender).toBeCalledTimes(1)
    expect(spyDisplayRender).toBeCalledTimes(0)

    await waitForRender(wrapper)

    expect(wrapper.text()).toBe(modelData.name)
    expect(spyPrepareDisplayRender).toBeCalledTimes(1)
    expect(spyDisplayRender).toBeCalledTimes(1)

    field.value = 'New Name'
    await waitForRender(wrapper)

    expect(wrapper.text()).toBe('New Name')
    expect(spyPrepareDisplayRender).toBeCalledTimes(2)
    expect(spyDisplayRender).toBeCalledTimes(2)

    spyPrepareDisplayRender.mockRestore()
    spyDisplayRender.mockRestore()
  })

  it('should render correctly', async () => {
    modelData.name = 'Name 1'
    const wrapper = shallowMount(BaseDisplayFieldRender, {
      localVue,
      propsData: { field: field }
    })
    await waitForRender(wrapper)
    expect(wrapper.html()).toBe('<span>Name 1</span>')
  })
}

describe('components/BaseDisplayFieldRender', () => TestBaseDisplayFieldRender(false))

describe('components/BaseDisplayFieldRender asyncComputed', () => TestBaseDisplayFieldRender(true))
