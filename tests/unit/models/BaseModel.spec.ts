import { BaseModel, NotDeclaredFieldException } from '@/models/BaseModel'
import { Field, FieldNotBoundException } from '@/fields/Field'

describe('models/BaseModel', () => {
  describe('constructor', () => {
    it('should create BaseModel with data', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation()

      class TestModel extends BaseModel {
        public static keyName = 'TestModel'
      }

      const data = { a: 1 }
      const model = new TestModel(data)
      expect(model).toBeInstanceOf(BaseModel)

      expect(console.warn).toHaveBeenCalledTimes(0)

      expect(model.data).toBe(data)
      spy.mockRestore()
    })

    it('should create BaseModel with default data', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation()

      class TestModel extends BaseModel {
        public static keyName = 'TestModel'
      }

      const model = new TestModel()
      expect(model).toBeInstanceOf(BaseModel)

      expect(console.warn).toHaveBeenCalledTimes(0)

      expect(model.data).toEqual({})
      spy.mockRestore()
    })

    it('should create BaseModel with warning for missing settings', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation()

      class TestModel extends BaseModel {
      }

      const data = { a: 1 }
      const model = new TestModel(data)
      expect(model).toBeInstanceOf(BaseModel)

      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['Missing keyName for Model', 'TestModel']
      ])

      spy.mockRestore()
    })

    it('should create BaseModel and bind fields', () => {
      const testField = new Field()
      expect(() => testField.name).toThrow(FieldNotBoundException)

      class Field1 extends Field {
      }

      class TestModel extends BaseModel {
        public static keyName = 'TestModel'
        protected static fieldsDef = {
          name: testField,
          description: testField,
          field1: new Field1()
        }
      }

      const model = new TestModel()

      expect(() => testField.name).toThrow(FieldNotBoundException)

      const fields = model.fields
      expect(fields).not.toBeNull()
      expect(Object.keys(fields).sort()).toEqual(['name', 'description', 'field1'].sort())

      Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName]
        expect(field).not.toBe(testField)
        expect(field.name).toBe(fieldName)
        expect(field).toBeInstanceOf(Field)
        if (fieldName === 'field1') {
          expect(field).toBeInstanceOf(Field1)
        } else {
          expect(field).not.toBeInstanceOf(Field1)
        }
      })
    })
  })

  describe('register', () => {
    it('should register only once', () => {
      class TestModel extends BaseModel {
        public static keyName = 'TestModel'
      }

      class OtherTestModel extends BaseModel {
        public static keyName = 'OtherTestModel'
      }

      class NestedTestModel extends TestModel {
        public static keyName = 'NestedTestModel'
      }

      expect(TestModel.register()).toBe(true)
      expect(TestModel.register()).toBe(false)

      expect(OtherTestModel.register()).toBe(true)
      expect(OtherTestModel.register()).toBe(false)

      expect(NestedTestModel.register()).toBe(true)
      expect(NestedTestModel.register()).toBe(false)
    })
  })

  describe('val', () => {
    it('should return correct values', () => {
      const data = {
        name: 'Name',
        obj: { a: 1 }
      }

      class TestModel extends BaseModel {
        public static keyName = 'TestModel'
        protected static fieldsDef = {
          name: new Field(),
          obj: new Field(),
          description: new Field()
        }
      }

      const model = new TestModel(data)
      expect(model.val.name).toBe(data.name)
      expect(model.val.obj).toBe(data.obj)
      expect(model.val.description).toBeNull()
      expect(() => model.val.no_field).toThrow(NotDeclaredFieldException)
    })
  })

  describe('getField', () => {
    class NameField extends Field {
    }

    class TestModel extends BaseModel {
      public static keyName = 'TestModel'
      protected static fieldsDef = {
        name: new NameField()
      }
    }

    const model = new TestModel()

    it('should return field', () => {
      const field = model.getField('name')
      expect(field).toBeInstanceOf(NameField)
      expect(field.name).toBe('name')
    })

    it('should throw NotDeclaredFieldException', () => {
      expect(() => model.getField('not_declared')).toThrow(NotDeclaredFieldException)
    })
  })
})
