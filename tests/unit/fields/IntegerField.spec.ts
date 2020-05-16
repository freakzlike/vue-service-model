import { BaseModel } from '@/models/BaseModel'
import { IntegerField } from '@/fields/IntegerField'
import { FormatStringField } from '@/fields/FormatStringField'
import { mount } from '@vue/test-utils'
import InputField from '@/components/InputField'
import { waitRender } from '../../testUtils'

describe('fields/IntegerField', () => {
  class TestModel extends BaseModel {
    static fieldsDef = {
      amount: new IntegerField()
    }
  }

  describe('constructor', () => {
    it('should inherit from FormatStringField', async () => {
      const model = new TestModel({})
      const field = model.getField('amount')

      expect(field).toBeInstanceOf(FormatStringField)
    })
  })

  describe('inputRender', () => {
    it('should render correct input field', async () => {
      const model = new TestModel({ amount: 17 })
      const wrapper = mount(InputField, {
        propsData: {
          field: model.getField('amount')
        }
      })

      await waitRender.InputField(wrapper)

      expect(wrapper.html()).toMatchSnapshot()

      const inputElement = wrapper.get('input')
      expect(inputElement.attributes('value')).toBe('17')

      model.val.amount = 19

      await waitRender.InputFieldUpdate(wrapper)

      expect(wrapper.html()).toMatchSnapshot()
      expect(inputElement.attributes('value')).toBe('19')
    })

    it('should set value correct on change', async () => {
      const model = new TestModel({ amount: 17 })
      const wrapper = mount(InputField, {
        propsData: {
          field: model.getField('amount')
        }
      })

      await waitRender.InputField(wrapper)

      const inputElement = wrapper.get('input')
      expect(inputElement.attributes('value')).toBe('17')

      inputElement.setValue(19)

      expect(await model.val.amount).toBe(19)

      inputElement.setValue('20')

      expect(await model.val.amount).toBe(20)
    })
  })
})
