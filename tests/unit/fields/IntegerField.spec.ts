import { BaseModel } from '@/models/BaseModel'
import { IntegerField } from '@/fields/IntegerField'
import { FormatStringField } from '@/fields/FormatStringField'
import { mount } from '@vue/test-utils'
import InputField from '@/components/InputField'
import { waitRender } from '../../testUtils'
import { RenderableField } from '@/fields'

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
        props: {
          field: model.getField('amount') as RenderableField
        }
      })

      await waitRender.InputField()

      expect(wrapper.html()).toMatchSnapshot()

      const inputElement = wrapper.get('input')
      expect(inputElement.element.value).toBe('17')

      model.val.amount = 19

      await waitRender.InputFieldUpdate()

      expect(wrapper.html()).toMatchSnapshot()
      expect(inputElement.element.value).toBe('19')
    })

    it('should set value correct on change', async () => {
      const model = new TestModel({ amount: 17 })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('amount') as RenderableField
        }
      })

      await waitRender.InputField()

      const inputElement = wrapper.get('input')
      expect(inputElement.element.value).toBe('17')

      inputElement.setValue(19)

      // Wait for value parser
      await wrapper.vm.$nextTick()

      expect(await model.val.amount).toBe(19)

      inputElement.setValue('20')

      // Wait for value parser
      await wrapper.vm.$nextTick()

      expect(await model.val.amount).toBe(20)
    })

    it('should render disabled input field', async () => {
      const model = new TestModel({ amount: 17 })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('amount') as RenderableField,
          disabled: true
        }
      })

      await waitRender.InputField()

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render readonly input field', async () => {
      const model = new TestModel({ amount: 17 })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('amount') as RenderableField,
          readonly: true
        }
      })

      await waitRender.InputField()

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('valueParser', () => {
    const field = new TestModel({}).getField('amount')

    it('should return integer value', async () => {
      expect(await field.valueParser(7)).toBe(7)
      expect(await field.valueParser('8')).toBe(8)
      expect(await field.valueParser(0)).toBe(0)
      expect(await field.valueParser(9.2)).toBe(9)
    })

    it('should return null', async () => {
      expect(await field.valueParser(null)).toBe(null)
      expect(await field.valueParser(undefined)).toBe(null)
    })
  })
})
