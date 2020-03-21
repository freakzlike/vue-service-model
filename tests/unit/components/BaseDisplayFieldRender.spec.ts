import { shallowMount } from '@vue/test-utils'
import { Field } from '@/fields/Field'
import BaseDisplayFieldRender from '@/components/BaseDisplayFieldRender'
import { BaseModel } from '@/models/BaseModel'

describe('components/BaseDisplayFieldRender', () => {
  const modelData = { name: 'Name 1' }

  class TestModel extends BaseModel {
    static fieldsDef = {
      name: new Field()
    }
  }

  const model = new TestModel(modelData)
  const field = model.getField('name') as Field

  it('should call and render correct displayRender', async () => {
    const spyDisplayRender = jest.spyOn(field, 'displayRender')

    const wrapper = shallowMount(BaseDisplayFieldRender, {
      propsData: { field: field }
    })
    expect(wrapper.text()).toBe('')

    expect(spyDisplayRender).toBeCalledTimes(0)

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toBe(modelData.name)
    expect(spyDisplayRender).toBeCalledTimes(1)
  })

  it('should render correctly', async () => {
    const wrapper = shallowMount(BaseDisplayFieldRender, {
      propsData: { field: field }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})
