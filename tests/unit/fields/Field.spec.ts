import { Field } from '@/fields/Field'
import { BaseModel } from '@/models/BaseModel'
import { FieldDef, FieldBind, FieldTypeOptions } from '@/types/fields/Field'
import { FieldNotBoundException } from '@/exceptions/FieldExceptions'
import { Dictionary } from '@/types/Dictionary'

describe('fields/Field', () => {
  class TestModel extends BaseModel {
  }

  const model = new TestModel()

  describe('constructor', () => {
    it('should create correct Field without field name', () => {
      const def = {}
      const field = new Field(def)
      expect(field).toBeInstanceOf(Field)
      expect(field.definition).toBe(def)
      expect(() => field.name).toThrow(FieldNotBoundException)
    })

    it('should create correct Field with field name', () => {
      const def = {}
      const field = new Field(def, { name: 'name', model })
      expect(field).toBeInstanceOf(Field)
      expect(field.definition).toBe(def)
      expect(field.name).toBe('name')
      expect(field.model).toBe(model)
    })

    it('should create correct Field with value', () => {
      const def = {}
      const value = {}
      const field = new Field(def, { value })
      expect(field).toBeInstanceOf(Field)
      expect(field.definition).toBe(def)
      expect(field.name).toBe('value')
      expect(field.data).toHaveProperty('value')
      expect(field.data.value).toBe(value)
    })

    it('should create correct Field with value and field name', () => {
      const value = {}
      const field = new Field(null, { name: 'name', value })
      expect(field).toBeInstanceOf(Field)
      expect(field.definition).toEqual({})
      expect(field.name).toBe('name')
      expect(field.data).toHaveProperty('name')
      expect(field.data.name).toBe(value)
    })

    it('should create correct Field with value and attribute name', () => {
      const def = { attributeName: 'nested.field' }
      const value = {}
      const field = new Field(def, { value })
      expect(field).toBeInstanceOf(Field)
      expect(field.definition).toBe(def)
      expect(field.name).toBe('value')
      expect(field.data).toEqual({ nested: { field: value } })
      expect(field.data.nested.field).toBe(value)
    })
  })

  describe('clone', () => {
    it('should clone field instance with model bind', () => {
      const fieldBind: FieldBind = { name: 'name', model }
      const field = new Field({}, fieldBind)

      const cloned = field.clone()
      expect(field).not.toBe(cloned)
      expect(cloned.definition).toBe(cloned.definition)
      expect(cloned.name).toBe(fieldBind.name)
      expect(cloned.model).toBe(fieldBind.model)
      expect(cloned.data).toBe(model.data)
    })

    it('should clone field instance with data bind', () => {
      const data = {}
      const fieldBind: FieldBind = { name: 'name', data }
      const field = new Field({}, fieldBind)

      const cloned = field.clone()
      expect(field).not.toBe(cloned)
      expect(cloned.definition).toBe(cloned.definition)
      expect(cloned.name).toBe(fieldBind.name)
      expect(cloned.data).toBe(data)
      expect(() => cloned.model).toThrow(FieldNotBoundException)
    })

    it('should clone field instance without bind', () => {
      const field = new Field({})

      const cloned = field.clone()
      expect(cloned).toBeInstanceOf(Field)
      expect(field).not.toBe(cloned)
      expect(field.definition).toBe(cloned.definition)
      expect(() => cloned.name).toThrow(FieldNotBoundException)
      expect(() => cloned.model).toThrow(FieldNotBoundException)
    })

    it('should clone field instance without model', () => {
      const fieldBind: FieldBind = { name: 'name' }
      const field = new Field({}, fieldBind)

      const cloned = field.clone()
      expect(cloned).toBeInstanceOf(Field)
      expect(field).not.toBe(cloned)
      expect(field.definition).toBe(cloned.definition)
      expect(cloned.name).toBe(fieldBind.name)
      expect(() => cloned.model).toThrow(FieldNotBoundException)
      expect(() => cloned.data).toThrow(FieldNotBoundException)
    })
  })

  describe('bind', () => {
    it('should bind model to field and return new instance', () => {
      const field = new Field({})
      const fieldName = 'name'

      const bound = field.bind({ name: fieldName, model })
      expect(bound).toBeInstanceOf(Field)
      expect(field).not.toBe(bound)
      expect(field.definition).toBe(bound.definition)
      expect(bound.name).toBe(fieldName)
      expect(bound.model).toBe(model)
    })

    it('should bind data to field and return new instance', () => {
      const field = new Field({})
      const fieldName = 'name'
      const data = {}

      const bound = field.bind({ name: fieldName, data })
      expect(bound).toBeInstanceOf(Field)
      expect(field).not.toBe(bound)
      expect(field.definition).toBe(bound.definition)
      expect(bound.name).toBe(fieldName)
      expect(bound.data).toBe(data)
      expect(() => bound.model).toThrow(FieldNotBoundException)
    })

    it('should bind value to field and return new instance', () => {
      const field = new Field({})
      const fieldName = 'name'
      const value = {}

      const bound = field.bind({ name: fieldName, value })
      expect(bound).toBeInstanceOf(Field)
      expect(field).not.toBe(bound)
      expect(field.definition).toBe(bound.definition)
      expect(bound.name).toBe(fieldName)
      expect(bound.data).toHaveProperty(fieldName)
      expect(bound.data[fieldName]).toBe(value)
      expect(() => bound.model).toThrow(FieldNotBoundException)
    })
  })

  describe('name', () => {
    it('should return field name', () => {
      const fieldName = 'description'
      const field = new Field({}, { name: fieldName, model })
      expect(field.name).toBe(fieldName)
    })

    it('should throw FieldNotBoundException', () => {
      const field = new Field()
      expect(() => field.name).toThrow(FieldNotBoundException)
    })
  })

  describe('attributeName', () => {
    it('should get attributeName', () => {
      const attributeName = 'field.attribute'

      const field = new Field({ attributeName })
      expect(field.attributeName).toBe(attributeName)
    })

    it('should get default attributeName', () => {
      const fieldName = 'description'
      const field = new Field({}, { name: fieldName })
      expect(field.attributeName).toBe(fieldName)
    })

    it('should throw FieldNotBoundException', () => {
      const field = new Field()
      expect(() => field.attributeName).toThrow(FieldNotBoundException)
    })
  })

  describe('definition', () => {
    it('should return definition', () => {
      const def = { attributeName: 'attr' }
      const field = new Field(def)
      expect(field.definition).toBe(def)
    })
  })

  describe('model', () => {
    it('should return field model', () => {
      const field = new Field({}, { name: 'description', model })
      expect(field.model).toBe(model)
    })

    it('should throw FieldNotBoundException', () => {
      const field = new Field()
      expect(() => field.model).toThrow(FieldNotBoundException)
    })
  })

  describe('data', () => {
    it('should return bound data', () => {
      const data = {}
      const field = new Field({}, { name: 'description', data })
      expect(field.data).toBe(data)
    })

    it('should return bound model data', () => {
      const field = new Field({}, { name: 'description', model })
      expect(field.data).toBe(model.data)
    })

    it('should return bound data before model data', () => {
      const data = {}
      const field = new Field({}, { name: 'description', data, model })
      expect(field.data).toBe(data)
      expect(field.data).not.toBe(model.data)
    })

    it('should return created data with value', () => {
      const value = {}
      const field = new Field({}, { value })
      expect(field.data).toHaveProperty('value')
      expect(field.data.value).toBe(value)
    })

    it('should return created data with value and field name', () => {
      const value = {}
      const field = new Field({}, { name: 'name', value })
      expect(field.data).toHaveProperty('name')
      expect(field.data.name).toBe(value)
    })

    it('should throw FieldNotBoundException', () => {
      const field = new Field()
      expect(() => field.model).toThrow(FieldNotBoundException)
    })
  })

  describe('get value', () => {
    it('should return field value from data', async () => {
      const data = { description: 'desc value' }
      const field = new Field({}, { name: 'description', data })
      const mockValueGetter = jest.spyOn(field, 'valueGetter')

      expect(await field.value).toBe(data.description)

      expect(mockValueGetter).toBeCalledTimes(1)
      expect(mockValueGetter.mock.calls[0]).toEqual([data])
    })

    it('should return field value from model data', async () => {
      const data = { description: 'desc value' }
      const model = new TestModel(data)

      const field = new Field({}, { name: 'description', model })
      const mockValueGetter = jest.spyOn(field, 'valueGetter')

      expect(await field.value).toBe(data.description)

      expect(mockValueGetter).toBeCalledTimes(1)
      expect(mockValueGetter.mock.calls[0]).toEqual([data])
    })

    it('should return field value from constructor value', async () => {
      const value = 'desc value'
      const field = new Field({}, { name: 'description', value })
      const mockValueGetter = jest.spyOn(field, 'valueGetter')

      expect(await field.value).toBe(value)

      expect(mockValueGetter).toBeCalledTimes(1)
      expect(mockValueGetter.mock.calls[0]).toEqual([{ description: value }])
    })

    it('should throw FieldNotBoundException', async () => {
      const field = new Field()
      await expect(new Promise(resolve => resolve(field.value))).rejects.toBeInstanceOf(FieldNotBoundException)
    })
  })

  describe('set value', () => {
    it('should set field value to data', async () => {
      const data = { description: 'desc value' }
      const value = 'new value'

      const field = new Field({}, { name: 'description', data })
      const mockValueSetter = jest.spyOn(field, 'valueSetter')

      await expect(() => {
        field.value = value
      }).toUseReactivity(() => data.description)

      expect(data.description).toBe(value)

      expect(mockValueSetter).toBeCalledTimes(1)
      expect(mockValueSetter.mock.calls[0]).toEqual([value, data])
    })

    it('should set field value to model data', async () => {
      const data = { description: 'desc value' }
      const model = new TestModel(data)
      const value = 'new value'

      const field = new Field({}, { name: 'description', model })
      const mockValueSetter = jest.spyOn(field, 'valueSetter')

      await expect(() => {
        field.value = value
      }).toUseReactivity(() => data.description)

      expect(data.description).toBe(value)

      expect(mockValueSetter).toBeCalledTimes(1)
      expect(mockValueSetter.mock.calls[0]).toEqual([value, data])
    })

    it('should set field value to data from value', async () => {
      const value = 'new value'

      const field = new Field(null, { value: 'desc value' })
      const mockValueSetter = jest.spyOn(field, 'valueSetter')
      const data = field.data

      await expect(() => {
        field.value = value
      }).toUseReactivity(() => data.value)

      expect(data.value).toBe(value)

      expect(mockValueSetter).toBeCalledTimes(1)
      expect(mockValueSetter.mock.calls[0]).toEqual([value, data])
    })

    it('should throw FieldNotBoundException', () => {
      const field = new Field()
      expect(() => (field.value = 1)).toThrow(FieldNotBoundException)
    })
  })

  describe('label', () => {
    it('should get label string', async () => {
      const def: FieldDef = { label: 'field label' }

      const field = new Field(def)
      expect(field.label).toBeInstanceOf(Promise)

      const result = await field.label
      expect(typeof result).toBe('string')
      expect(result).toBe(def.label)
    })

    it('should get label function', async () => {
      const label = 'field label 1'
      const def: FieldDef = {}
      const field = new Field(def)
      def.label = function (...args: Array<any>) {
        expect(args.length).toBe(0)
        expect(this).toBe(field)
        return label
      }

      expect(await field.label).toBe(label)
    })

    it('should get label Promise', async () => {
      const label = 'field label 2'
      const def: FieldDef = {
        label: () => new Promise(resolve => resolve(label))
      }

      const field = new Field(def)
      expect(await field.label).toBe(label)
    })
  })

  describe('options', () => {
    class TestField extends Field {
      public async validateOptions (options: FieldTypeOptions) {
        return super.validateOptions(options)
      }
    }

    it('should get options', async () => {
      const def: FieldDef = { options: {} }
      const field = new TestField(def)
      const mockValidateOptions = jest.spyOn(field, 'validateOptions')

      const result = await field.options
      expect(result).toBe(def.options)

      expect(mockValidateOptions).toBeCalledTimes(1)
      expect(mockValidateOptions.mock.calls[0]).toEqual([def.options])
      mockValidateOptions.mockRestore()
    })

    it('should get options function', async () => {
      const options: FieldTypeOptions = {}
      const def: FieldDef = {}
      const field = new TestField(def)
      def.options = function (...args: Array<any>) {
        expect(args.length).toBe(0)
        expect(this).toBe(field)
        return options
      }

      const mockValidateOptions = jest.spyOn(field, 'validateOptions')

      expect(await field.options).toBe(options)

      expect(mockValidateOptions).toBeCalledTimes(1)
      expect(mockValidateOptions.mock.calls[0]).toEqual([options])
      mockValidateOptions.mockRestore()
    })

    it('should get options Promise', async () => {
      const options: FieldTypeOptions = {}
      const def: FieldDef = {
        options: () => new Promise(resolve => resolve(options))
      }

      const field = new TestField(def)
      const mockValidateOptions = jest.spyOn(field, 'validateOptions')

      expect(await field.options).toBe(options)

      expect(mockValidateOptions).toBeCalledTimes(1)
      expect(mockValidateOptions.mock.calls[0]).toEqual([options])
      mockValidateOptions.mockRestore()
    })

    it('should get default options', async () => {
      const field = new TestField({})
      const mockValidateOptions = jest.spyOn(field, 'validateOptions')

      expect(await field.options).toEqual({})

      expect(mockValidateOptions).toBeCalledTimes(1)
      expect(mockValidateOptions.mock.calls[0]).toEqual([undefined])
      mockValidateOptions.mockRestore()
    })
  })

  describe('isPrimaryKey', () => {
    it('should be primary key', () => {
      const field = new Field({ primaryKey: true })
      expect(field.isPrimaryKey).toBe(true)
    })

    it('should not be primary key', () => {
      const field = new Field({})
      expect(field.isPrimaryKey).toBe(false)
    })
  })

  describe('isNestedAttribute', () => {
    it('should be nested attribute', () => {
      const field = new Field({ attributeName: 'obj.title' })
      expect(field.isNestedAttribute).toBe(true)
    })

    it('should not be nested attribute', () => {
      const field = new Field({ attributeName: 'title' })
      expect(field.isNestedAttribute).toBe(false)
    })
  })

  describe('valueGetter', () => {
    it('should return null data', () => {
      const field = new Field({}, { name: 'field' })
      expect(field.valueGetter(false)).toBe(null)
      expect(field.valueGetter(null)).toBe(null)
      expect(field.valueGetter(5)).toBe(null)
      expect(field.valueGetter({})).toBe(null)
      expect(field.valueGetter({ field2: 1 })).toBe(null)
    })

    it('should return null nested data', () => {
      const field = new Field({}, { name: 'struct.dir.field' })
      expect(field.valueGetter(null)).toBe(null)
      expect(field.valueGetter({})).toBe(null)
      expect(field.valueGetter({ field2: 1 })).toBe(null)
      expect(field.valueGetter({ struct: 1 })).toBe(null)
      expect(field.valueGetter({ struct: { dir: {} } })).toBe(null)
      expect(field.valueGetter({ struct: { dir: { field2: 1 } } })).toBe(null)
    })

    it('should return value', () => {
      const field = new Field({}, { name: 'field' })
      expect(field.valueGetter({ field: null })).toBe(null)
      expect(field.valueGetter({ field: false })).toBe(false)
      expect(field.valueGetter({ field: 1 })).toBe(1)
      expect(field.valueGetter({ field: 'string' })).toBe('string')
      const nestedData = { nested: 2 }
      expect(field.valueGetter({ field: nestedData })).toBe(nestedData)
      const valueFunc = () => 5
      expect(field.valueGetter({ field: valueFunc })).toBe(valueFunc)
    })

    it('should return value nested data', () => {
      const field = new Field({}, { name: 'struct.dir.field' })
      expect(field.valueGetter({ struct: { dir: { field: null } } })).toBe(null)
      expect(field.valueGetter({ struct: { dir: { field: false } } })).toBe(false)
      expect(field.valueGetter({ struct: { dir: { field: 'string' } } })).toBe('string')
      expect(field.valueGetter({ struct: { dir: { field: 0 } } })).toBe(0)
      const nestedData = { nested: 2 }
      expect(field.valueGetter({ struct: { dir: { field: nestedData } } })).toBe(nestedData)
      const valueFunc = () => 5
      expect(field.valueGetter({ struct: { dir: { field: valueFunc } } })).toBe(valueFunc)
    })
  })

  describe('valueSetter', () => {
    it('should set value', () => {
      const value = { value: 1 }
      const data: any = {}
      const field = new Field({}, { name: 'field' })
      field.valueSetter(value, data)
      expect(data).toEqual({ field: value })
      expect(data.field).toBe(value)

      const newValue = { value: 2 }
      field.valueSetter(newValue, data)
      expect(data).toEqual({ field: newValue })
      expect(data.field).toBe(newValue)
    })

    it('should set value nested attribute', () => {
      const value = { value: 1 }
      const data: any = {}
      const field = new Field({ attributeName: 'nested.obj.field' }, { name: 'field' })
      field.valueSetter(value, data)
      expect(data).toEqual({ nested: { obj: { field: value } } })
      expect(data.nested.obj.field).toBe(value)
    })

    it('should set value update nested attribute', () => {
      const value = { value: 1 }
      const data: any = { nested: { value: 2 }, value: 3 }
      const field = new Field({ attributeName: 'nested.obj.field' }, { name: 'field' })
      field.valueSetter(value, data)
      expect(data).toEqual({ nested: { value: 2, obj: { field: value } }, value: 3 })
      expect(data.nested.obj.field).toBe(value)
    })

    it('should set value update nested attribute null', () => {
      const value = { value: 1 }
      const data: any = { nested: { obj: null } }
      const field = new Field({ attributeName: 'nested.obj.field' }, { name: 'field' })
      field.valueSetter(value, data)
      expect(data).toEqual({ nested: { obj: { field: value } } })
      expect(data.nested.obj.field).toBe(value)
    })

    it('should set value update nested only attribute', () => {
      const value = { value: 1 }
      const data: any = { nested: { obj: { field: { value: 2 } } } }
      const field = new Field({ attributeName: 'nested.obj.field' }, { name: 'field' })
      field.valueSetter(value, data)
      expect(data).toEqual({ nested: { obj: { field: value } } })
      expect(data.nested.obj.field).toBe(value)
    })
  })

  describe('mapFieldValue', () => {
    it('should map value', () => {
      const field = new Field({}, { name: 'field' })
      const fromData = { field: {}, otherField: 2 }
      const toData: Dictionary<any> = { otherField: 1 }

      field.mapFieldValue(fromData, toData)

      expect(toData).toEqual({
        otherField: 1,
        field: fromData.field
      })
      expect(toData.field).toBe(fromData.field)
    })

    it('should map nested value', () => {
      const field = new Field({ attributeName: 'nested.field' }, { name: 'field' })
      const fromData = { nested: { field: {}, otherField: 1 } }
      const toData: Dictionary<any> = {}

      field.mapFieldValue(fromData, toData)

      expect(toData).toEqual({
        nested: { field: fromData.nested.field }
      })
      expect(toData.nested.field).toBe(fromData.nested.field)
    })

    it('should map null value', () => {
      const field = new Field({}, { name: 'field' })
      const fromData = { otherField: 2 }
      const toData = { otherField: 1 }

      field.mapFieldValue(fromData, toData)

      expect(toData).toEqual({
        otherField: 1,
        field: null
      })
    })
  })
})
