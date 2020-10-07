import { BaseModel } from '@/models/BaseModel'
import { DecimalField, DecimalFieldOptions } from '@/fields/DecimalField'
import { FormatStringField } from '@/fields/FormatStringField'
import { mount } from '@vue/test-utils'
import InputField from '@/components/InputField'
import { waitRender } from '../../testUtils'
import { RenderableField } from '@/fields'

describe('fields/DecimalField', () => {
  class TestModel extends BaseModel {
    static fieldsDef = {
      amount: new DecimalField({
        options: {
          decimalPlaces: 2
        }
      })
    }
  }

  describe('constructor', () => {
    it('should inherit from FormatStringField', async () => {
      const field = new TestModel({}).getField('amount')

      expect(field).toBeInstanceOf(FormatStringField)
    })
  })

  describe('inputRender', () => {
    it('should render correct input field', async () => {
      const model = new TestModel({ amount: 17.02 })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('amount') as RenderableField
        }
      })

      await waitRender.InputField()
      await waitRender.InputField()

      expect(wrapper.html()).toMatchSnapshot()

      const inputElement = wrapper.get('input')
      expect(inputElement.element.value).toBe('17.02')

      model.val.amount = 19.1

      await waitRender.InputFieldUpdate()
      await waitRender.InputFieldUpdate()

      expect(wrapper.html()).toMatchSnapshot()
      expect(inputElement.element.value).toBe('19.1')
    })

    it('should set value correct on change', async () => {
      const model = new TestModel({ amount: 17 })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('amount') as RenderableField
        }
      })

      await waitRender.InputField()
      await waitRender.InputField()

      const inputElement = wrapper.get('input')
      expect(inputElement.element.value).toBe('17')

      inputElement.setValue(19.01)

      // Wait for value parser
      await wrapper.vm.$nextTick()

      expect(await model.val.amount).toBe(19.01)

      inputElement.setValue('20.45')

      // Wait for value parser
      await wrapper.vm.$nextTick()

      expect(await model.val.amount).toBe(20.45)
    })

    it('should render disabled input field', async () => {
      const model = new TestModel({ amount: 17.02 })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('amount') as RenderableField,
          disabled: true
        }
      })

      await waitRender.InputField()
      await waitRender.InputField()

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render readonly input field', async () => {
      const model = new TestModel({ amount: 17.02 })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('amount') as RenderableField,
          readonly: true
        }
      })

      await waitRender.InputField()
      await waitRender.InputField()

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('options', () => {
    it('should log error on missing options.decimalPlaces', async () => {
      class TestModel extends BaseModel {
        static fieldsDef = {
          amount: new DecimalField()
        }
      }

      const model = new TestModel({ amount: 17 })

      const mockValidateOptions = jest.spyOn(console, 'error').mockImplementation()

      const options = await model.getField('amount').options as DecimalFieldOptions
      expect(options).toHaveProperty('decimalPlaces')
      expect(options.decimalPlaces).toBe(0)

      expect(mockValidateOptions).toBeCalledTimes(1)
      mockValidateOptions.mockRestore()
    })
  })

  describe('valueParser', () => {
    const field = new TestModel({}).getField('amount')

    it('should return float value', async () => {
      expect(await field.valueParser(11.5)).toBe(11.5)
      expect(await field.valueParser('15.84')).toBe(15.84)
      expect(await field.valueParser(0)).toBe(0)
    })

    it('should return null', async () => {
      expect(await field.valueParser(null)).toBe(null)
      expect(await field.valueParser(undefined)).toBe(null)
    })
  })
})
