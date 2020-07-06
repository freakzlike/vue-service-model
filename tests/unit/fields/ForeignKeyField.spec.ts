import Vue, { CreateElement } from 'vue'
import { mount } from '@vue/test-utils'
import { BaseModel } from '@/models/BaseModel'
import { ServiceModel } from '@/models/ServiceModel'
import { Field } from '@/fields/Field'
import { CharField } from '@/fields/CharField'
import { ForeignKeyField, ForeignKeyFieldOptions } from '@/fields/ForeignKeyField'
import { InvalidFieldOptionsException, RequiredFieldOptionsException } from '@/exceptions/FieldExceptions'
import DisplayField from '@/components/DisplayField'
import { waitRender } from '../../testUtils'
import { ComponentModule } from '@/types/components'
import BaseDisplayFieldRender from '@/components/BaseDisplayFieldRender'
import InputField from "@/components/InputField";

describe('fields/ForeignKeyField', () => {
  class User extends ServiceModel {
    static fieldsDef = {
      id: new Field({ primaryKey: true }),
      name: new (class extends CharField {
        // Custom displayComponent to test DisplayField usage
        get displayComponent (): Promise<ComponentModule> {
          return Promise.resolve({
            default: Vue.extend({
              props: {
                field: {
                  type: Object,
                  required: true
                }
              },
              render (h: CreateElement) {
                return h('div', this.field.data.name)
              }
            })
          })
        }
      })()
    }
  }

  const userList = [
    new User({ id: 1, name: 'User 1' }),
    new User({ id: 2, name: 'User 2' }),
    new User({ id: 3, name: 'User 3' })
  ]
  const user = userList[0]

  class TestModel extends BaseModel {
    static fieldsDef = {
      user: new ForeignKeyField({
        options: {
          model: User,
          fieldName: 'name'
        }
      })
    }
  }

  const model = new TestModel({ user: user.pk })
  const field = model.getField('user') as ForeignKeyField

  describe('get value', () => {
    it('should fetch foreign instance', async () => {
      const mockObjectsDetail = jest.spyOn(User.objects, 'detail').mockImplementation(async () => user)

      const value = await model.val.user

      expect(value).toBe(user)

      expect(mockObjectsDetail).toBeCalledTimes(1)
      expect(mockObjectsDetail.mock.calls[0]).toEqual([user.pk])
      mockObjectsDetail.mockRestore()
    })

    it('should not fetch on null value', async () => {
      const mockObjectsDetail = jest.spyOn(User.objects, 'detail').mockImplementation()

      const model = new TestModel()
      const value = await model.val.user

      expect(value).toBeNull()

      expect(mockObjectsDetail).toBeCalledTimes(0)
      mockObjectsDetail.mockRestore()
    })
  })

  describe('options', () => {
    it('should return valid options', async () => {
      const field = TestModel.getField('user')
      const options = await field.options
      expect(options).toEqual({
        model: User,
        fieldName: 'name'
      })
    })

    it('should throw RequiredFieldOptionsException for missing options.model', async () => {
      const field = new ForeignKeyField({ options: {} })
      await expect(field.options).rejects.toBeInstanceOf(RequiredFieldOptionsException)
    })

    it('should throw RequiredFieldOptionsException for missing options.fieldName', async () => {
      const field = new ForeignKeyField({ options: { model: User } })
      await expect(field.options).rejects.toBeInstanceOf(RequiredFieldOptionsException)
    })

    it('should throw InvalidFieldOptionsException for missing options.fieldName', async () => {
      const field = new ForeignKeyField({ options: { model: {}, fieldName: 'name' } })
      await expect(field.options).rejects.toBeInstanceOf(InvalidFieldOptionsException)
    })
  })

  describe('prepareDisplayRender', () => {
    it('should return foreign field instance', async () => {
      const mockObjectsDetail = jest.spyOn(User.objects, 'detail').mockImplementation(async () => user)

      const renderData = await field.prepareDisplayRender()

      expect(Object.keys(renderData)).toHaveLength(2)

      expect(renderData.field).toBe(user.getField('name'))
      expect(renderData.displayField).toBe(DisplayField)

      expect(mockObjectsDetail).toBeCalledTimes(1)
      mockObjectsDetail.mockRestore()
    })

    it('should return no field data', async () => {
      const model = new TestModel()
      const field = model.getField('user')

      const renderData = await field.prepareDisplayRender()

      expect(renderData).toEqual({
        field: null,
        displayField: null
      })
    })
  })

  describe('displayRender', () => {
    it('should render correct value', async () => {
      const mockObjectsDetail = jest.spyOn(User.objects, 'detail').mockImplementation(
        async pk => pk === 1 ? userList[0] : userList[2])

      const wrapper = mount(BaseDisplayFieldRender, {
        propsData: { field: field }
      })

      await waitRender.DisplayField(wrapper)
      await waitRender.DisplayField(wrapper)
      expect(wrapper.html()).toBe('')

      expect(mockObjectsDetail).toBeCalledTimes(1)
      expect(mockObjectsDetail.mock.calls[0]).toEqual([1])

      await waitRender.DisplayField(wrapper)
      expect(wrapper.html()).toMatchSnapshot()

      model.val.user = 3
      expect(model.data).toEqual({ user: 3 })

      await waitRender.DisplayFieldUpdate(wrapper)
      await waitRender.DisplayFieldUpdate(wrapper)

      expect(mockObjectsDetail).toBeCalledTimes(2)
      expect(mockObjectsDetail.mock.calls[1]).toEqual([3])

      await waitRender.DisplayFieldUpdate(wrapper)

      expect(wrapper.html()).toMatchSnapshot()

      mockObjectsDetail.mockRestore()
    })
  })

  describe('mapInputSelectList', () => {
    it('should return mapped select list', async () => {
      const mockObjectsList = jest.spyOn(User.objects, 'list').mockImplementation(async () => userList)

      const options = await field.options as ForeignKeyFieldOptions
      const selectList = await field.mapInputSelectList(options)

      expect(selectList).toEqual([
        { value: '1', text: 'User 1' },
        { value: '2', text: 'User 2' },
        { value: '3', text: 'User 3' }
      ])

      expect(mockObjectsList).toBeCalledTimes(1)
      mockObjectsList.mockRestore()
    })

    it('should log warning if no primary key', async () => {
      const mockObjectsList = jest.spyOn(User.objects, 'list').mockImplementation(async () => [
        ...userList,
        new User({ name: 'New User' })
      ])
      const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation()

      const options = await field.options as ForeignKeyFieldOptions
      const selectList = await field.mapInputSelectList(options)

      expect(selectList).toEqual([
        { value: '1', text: 'User 1' },
        { value: '2', text: 'User 2' },
        { value: '3', text: 'User 3' },
        { value: 'null', text: 'New User' }
      ])

      expect(mockConsoleWarn).toBeCalledTimes(1)
      expect(mockConsoleWarn.mock.calls[0]).toEqual(['[vue-service-model] No primary key defined for model', 'User'])
      mockConsoleWarn.mockRestore()

      expect(mockObjectsList).toBeCalledTimes(1)
      mockObjectsList.mockRestore()
    })

    it('should log error when non string field is used for ForeignKeyField input', async () => {
      class TestModel extends BaseModel {
        static fieldsDef = {
          user: new ForeignKeyField({
            options: {
              model: User,
              fieldName: 'id'
            }
          })
        }
      }

      const model = new TestModel({ user: 1 })
      const field = model.getField('user') as ForeignKeyField

      const mockObjectsList = jest.spyOn(User.objects, 'list').mockImplementation(async () => userList)
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

      const options = await field.options as ForeignKeyFieldOptions
      const selectList = await field.mapInputSelectList(options)

      expect(selectList).toEqual([
        { value: '1', text: 'unknown' },
        { value: '2', text: 'unknown' },
        { value: '3', text: 'unknown' }
      ])

      expect(mockConsoleError).toBeCalledTimes(3)
      expect(mockConsoleError.mock.calls[0]).toEqual([
        '[vue-service-model] Cannot use non string field for ForeignKeyField input. Used field name:',
        'id'
      ])
      mockConsoleError.mockRestore()

      expect(mockObjectsList).toBeCalledTimes(1)
      mockObjectsList.mockRestore()
    })
  })

  describe('inputRender', () => {
    it('should render correct input field', async () => {
      const model = new TestModel({ user: user.pk })
      const field = model.getField('user') as ForeignKeyField
      const mockObjectsList = jest.spyOn(User.objects, 'list').mockImplementation(async () => userList)

      const wrapper = mount(InputField, { propsData: { field } })
      await waitRender.InputField(wrapper)

      expect(mockObjectsList).toBeCalledTimes(1)

      await waitRender.InputField(wrapper)
      await wrapper.vm.$nextTick()

      expect(wrapper.html()).toMatchSnapshot()

      const selectElement = wrapper.get('select')
      const options = selectElement.findAll('option')
      expect(options.at(0).attributes('selected')).toBe('selected')

      model.val.user = 3

      await waitRender.InputFieldUpdate(wrapper)

      expect(mockObjectsList).toBeCalledTimes(2)

      await waitRender.InputFieldUpdate(wrapper)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.html()).toMatchSnapshot()

      mockObjectsList.mockRestore()
    })

    it('should render correct input field without value', async () => {
      const model = new TestModel({})
      const field = model.getField('user') as ForeignKeyField
      const mockObjectsList = jest.spyOn(User.objects, 'list').mockImplementation(async () => userList)

      const wrapper = mount(InputField, { propsData: { field } })
      await waitRender.InputField(wrapper)

      expect(mockObjectsList).toBeCalledTimes(1)

      await waitRender.InputField(wrapper)
      await wrapper.vm.$nextTick()

      expect(wrapper.html()).toMatchSnapshot()

      mockObjectsList.mockRestore()
    })

    it('should set value correct on change', async () => {
      const model = new TestModel({ user: user.pk })
      const field = model.getField('user') as ForeignKeyField

      const mockObjectsList = jest.spyOn(User.objects, 'list').mockImplementation(async () => userList)
      const mockObjectsDetail = jest.spyOn(User.objects, 'detail').mockImplementation(async () => userList[2])

      const wrapper = mount(InputField, { propsData: { field } })
      await waitRender.InputField(wrapper)

      expect(mockObjectsList).toBeCalledTimes(1)

      await waitRender.InputField(wrapper)
      await wrapper.vm.$nextTick()

      const selectElement = wrapper.get('select')
      const options = selectElement.findAll('option')
      expect(options.at(0).attributes('selected')).toBe('selected')

      const newOption = options.at(2).element as HTMLOptionElement

      newOption.selected = true
      selectElement.trigger('input')

      await waitRender.InputFieldUpdate(wrapper)
      await waitRender.InputFieldUpdate(wrapper)
      await waitRender.InputFieldUpdate(wrapper)
      await waitRender.InputFieldUpdate(wrapper)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.html()).toMatchSnapshot()
      expect(options.at(2).attributes('selected')).toBe('selected')

      expect(mockObjectsDetail).toBeCalledTimes(0)

      const selectedUser = await model.val.user
      expect(selectedUser).toBe(userList[2])
      expect(model.data).toEqual({ user: '3' })

      expect(mockObjectsDetail).toBeCalledTimes(1)
      expect(mockObjectsDetail.mock.calls[0]).toEqual(['3'])

      expect(mockObjectsList).toBeCalledTimes(2)

      mockObjectsDetail.mockRestore()
      mockObjectsList.mockRestore()
    })
  })
})
