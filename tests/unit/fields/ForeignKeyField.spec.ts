import Vue, { CreateElement } from 'vue'
import { mount } from '@vue/test-utils'
import { BaseModel } from '@/models/BaseModel'
import { ServiceModel } from '@/models/ServiceModel'
import { CharField } from '@/fields/CharField'
import { ForeignKeyField } from '@/fields/ForeignKeyField'
import { InvalidFieldOptionsException, RequiredFieldOptionsException } from '@/exceptions/FieldExceptions'
import DisplayField from '@/components/DisplayField'
import { waitRender } from '../../testUtils'
import { ComponentModule } from '@/types/components'
import BaseDisplayFieldRender from '@/components/BaseDisplayFieldRender'

describe('fields/ForeignKeyField', () => {
  class User extends ServiceModel {
    static fieldsDef = {
      name: new (class extends CharField {
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

  const user = new User({ name: 'User name' })

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

  describe('get value', () => {
    it('should fetch foreign instance', async () => {
      const mockObjectsDetail = jest.spyOn(User.objects, 'detail').mockImplementation(async () => user)

      const userId = 0
      const model = new TestModel({ user: userId })
      const value = await model.val.user

      expect(value).toBe(user)

      expect(mockObjectsDetail).toBeCalledTimes(1)
      expect(mockObjectsDetail.mock.calls[0]).toEqual([userId])
      mockObjectsDetail.mockRestore()
    })

    it('should not fetch on null value', async () => {
      const mockObjectsDetail = jest.spyOn(User.objects, 'detail').mockImplementation(async () => user)

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
      const model = new TestModel({ user: 8 })
      const field = model.getField('user')
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
      const model = new TestModel({ user: 9 })
      const mockObjectsDetail = jest.spyOn(User.objects, 'detail').mockImplementation(
        async pk => pk === 9 ? user : new User({ name: 'User 10' }))
      const field = model.getField('user')

      const wrapper = mount(BaseDisplayFieldRender, {
        propsData: { field: field }
      })

      await waitRender.DisplayField(wrapper)
      await waitRender.DisplayField(wrapper)
      expect(wrapper.html()).toBe('')

      expect(mockObjectsDetail).toBeCalledTimes(1)
      expect(mockObjectsDetail.mock.calls[0]).toEqual([9])

      await waitRender.DisplayField(wrapper)
      expect(wrapper.html()).toMatchSnapshot()

      model.val.user = 10
      expect(model.data).toEqual({ user: 10 })

      await waitRender.DisplayFieldUpdate(wrapper)
      await waitRender.DisplayFieldUpdate(wrapper)

      expect(mockObjectsDetail).toBeCalledTimes(2)
      expect(mockObjectsDetail.mock.calls[1]).toEqual([10])

      await waitRender.DisplayFieldUpdate(wrapper)

      expect(wrapper.html()).toMatchSnapshot()

      mockObjectsDetail.mockRestore()
    })
  })
})
