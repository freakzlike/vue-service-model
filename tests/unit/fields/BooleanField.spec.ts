import { BaseModel } from '@/models/BaseModel'
import { BooleanField } from '@/fields/BooleanField'
import { FormatStringField } from '@/fields/FormatStringField'
import { mount } from '@vue/test-utils'
import InputField from '@/components/InputField'
import { waitRender } from '../../testUtils'
import { RenderableField } from '@/fields'

describe('fields/BooleanField', () => {
  class TestModel extends BaseModel {
    static fieldsDef = {
      active: new BooleanField()
    }
  }

  describe('constructor', () => {
    it('should inherit from FormatStringField', async () => {
      const model = new TestModel({})
      const field = model.getField('active')

      expect(field).toBeInstanceOf(FormatStringField)
    })
  })

  describe('valueFormatter', () => {
    it('should return Yes string value', async () => {
      const data = { active: true } as { active: any }
      const model = new TestModel(data)
      const field = model.getField('active') as BooleanField

      expect(await field.valueFormatter()).toBe('Yes')

      data.active = 1
      expect(await field.valueFormatter()).toBe('Yes')

      data.active = 'string'
      expect(await field.valueFormatter()).toBe('Yes')

      data.active = []
      expect(await field.valueFormatter()).toBe('Yes')
    })

    it('should return No string value', async () => {
      const data = {} as { active?: any }
      const model = new TestModel(data)
      const field = model.getField('active') as BooleanField

      expect(await field.valueFormatter()).toBe('No')

      data.active = false
      expect(await field.valueFormatter()).toBe('No')

      data.active = null
      expect(await field.valueFormatter()).toBe('No')

      data.active = 0
      expect(await field.valueFormatter()).toBe('No')
    })
  })

  describe('valueParser', () => {
    it('should return true boolean value', async () => {
      const field = new TestModel({}).getField('active') as BooleanField

      expect(await field.valueParser(true)).toBe(true)
      expect(await field.valueParser(1)).toBe(true)
      expect(await field.valueParser('string')).toBe(true)
      expect(await field.valueParser([])).toBe(true)
      expect(await field.valueParser({})).toBe(true)
    })

    it('should return false boolean value', async () => {
      const field = new TestModel({}).getField('active') as BooleanField

      expect(await field.valueParser(false)).toBe(false)
      expect(await field.valueParser(null)).toBe(false)
      expect(await field.valueParser('')).toBe(false)
      expect(await field.valueParser(undefined)).toBe(false)
      expect(await field.valueParser(0)).toBe(false)
    })
  })

  describe('inputRender', () => {
    it('should render correct input field', async () => {
      const model = new TestModel({ active: true })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('active') as RenderableField
        }
      })

      await waitRender.InputField()

      expect(wrapper.html()).toMatchSnapshot()

      const inputElement = wrapper.get('input')
      expect(inputElement.element.checked).toBe(true)

      model.val.active = false

      await waitRender.InputFieldUpdate()

      expect(wrapper.html()).toMatchSnapshot()
      expect(inputElement.element.checked).toBe(false)
    })

    it('should set value correct on change', async () => {
      const model = new TestModel({ active: true })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('active') as RenderableField
        }
      })

      await waitRender.InputField()

      const inputElement = wrapper.get('input')
      expect(inputElement.element.checked).toBe(true)

      inputElement.setValue(false)

      // Wait for value parser
      await wrapper.vm.$nextTick()

      expect(await model.val.active).toBe(false)

      await waitRender.InputFieldUpdate()
      expect(inputElement.element.checked).toBe(false)
    })

    it('should set value correct on click', async () => {
      const model = new TestModel({ active: true })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('active') as RenderableField
        }
      })

      await waitRender.InputField()

      const inputElement = wrapper.get('input')
      expect(inputElement.element.checked).toBe(true)

      inputElement.trigger('click')

      // Wait for value parser
      await wrapper.vm.$nextTick()

      expect(await model.val.active).toBe(false)

      await waitRender.InputFieldUpdate()
      expect(inputElement.element.checked).toBe(false)
    })

    it('should render disabled input field', async () => {
      const model = new TestModel({ active: true })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('active') as RenderableField,
          disabled: true
        }
      })

      await waitRender.InputField()

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render readonly input field', async () => {
      const model = new TestModel({ active: true })
      const wrapper = mount(InputField, {
        props: {
          field: model.getField('active') as RenderableField,
          readonly: true
        }
      })

      await waitRender.InputField()

      expect(wrapper.html()).toMatchSnapshot()

      const inputElement = wrapper.get('input')
      expect(inputElement.element.checked).toBe(true)

      inputElement.trigger('click')

      await waitRender.InputFieldUpdate()

      expect(await model.val.active).toBe(false)
    })
  })
})
