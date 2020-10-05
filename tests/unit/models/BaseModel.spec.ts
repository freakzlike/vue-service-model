import { BaseModel } from '@/models/BaseModel'
import { Field } from '@/fields/Field'
import { NotDeclaredFieldException } from '@/exceptions/ModelExceptions'
import { FieldNotBoundException } from '@/exceptions/FieldExceptions'
import { isReactive } from 'vue'

describe('models/BaseModel', () => {
  describe('constructor', () => {
    it('should create BaseModel with data', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()

      class TestModel extends BaseModel {
      }

      const data = { a: 1 }
      const model = new TestModel(data)
      expect(model).toBeInstanceOf(BaseModel)

      expect(console.error).toHaveBeenCalledTimes(0)

      expect(model.data).toEqual(data)
      expect(isReactive(model.data)).toBe(true)
      spy.mockRestore()
    })

    it('should create BaseModel with default data', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()

      class TestModel extends BaseModel {
      }

      const model = new TestModel()
      expect(model).toBeInstanceOf(BaseModel)

      expect(console.error).toHaveBeenCalledTimes(0)

      expect(model.data).toEqual({})
      expect(isReactive(model.data)).toBe(true)
      spy.mockRestore()
    })

    it('should create BaseModel and bind fields', () => {
      const testField = new Field()
      expect(() => testField.name).toThrow(FieldNotBoundException)

      class Field1 extends Field {
      }

      class TestModel extends BaseModel {
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
      }

      class OtherTestModel extends BaseModel {
      }

      class NestedTestModel extends TestModel {
      }

      expect(TestModel.register()).toBe(true)
      expect(TestModel.register()).toBe(false)

      expect(OtherTestModel.register()).toBe(true)
      expect(OtherTestModel.register()).toBe(false)

      expect(NestedTestModel.register()).toBe(true)
      expect(NestedTestModel.register()).toBe(false)
    })
  })

  describe('data', () => {
    class TestModel extends BaseModel {
    }

    it('should return correct data', () => {
      const modelData = { x: 1 }
      expect(new TestModel().data).toEqual({})
      expect(new TestModel(modelData).data).toEqual(modelData)
    })

    it('should set correct data', () => {
      const modelData = { x: 1 }
      const model = new TestModel()
      expect(model.data).toEqual({})
      model.data = modelData
      expect(model.data).toEqual(modelData)
      expect(isReactive(model.data)).toBe(true)
    })
  })

  describe('fields', () => {
    class NameField extends Field {
    }

    class TestModel extends BaseModel {
      protected static fieldsDef = {
        name: new NameField(),
        title: new Field()
      }
    }

    it('should return correct fields', () => {
      const model = new TestModel()
      const fields = model.fields
      expect(Object.keys(fields)).toEqual(['name', 'title'])
      expect(fields.name).toBeInstanceOf(NameField)
      expect(fields.title).toBeInstanceOf(Field)
      expect(fields.name.name).toBe('name')
      expect(fields.title.name).toBe('title')
    })
  })

  describe('val', () => {
    class TestModel extends BaseModel {
      protected static fieldsDef = {
        name: new Field(),
        obj: new Field(),
        description: new Field()
      }
    }

    const data = {
      name: 'Name',
      obj: { a: 1 }
    }

    const model = new TestModel(data)

    it('should return correct values', async () => {
      expect(await model.val.name).toBe(data.name)
      expect(await model.val.obj).toEqual(data.obj)
      expect(await model.val.description).toBeNull()
      expect(() => model.val.no_field).toThrow(NotDeclaredFieldException)
    })

    it('should set correct value', async () => {
      const newName = 'New Name'
      model.val.name = newName
      expect(await model.val.name).toBe(newName)
      expect(data.name).toBe(newName)
      expect(() => (model.val.no_field = 'new value')).toThrow(NotDeclaredFieldException)
      expect(data).toEqual({ name: newName, obj: data.obj })
    })
  })

  describe('getPrimaryKeyField', () => {
    it('should return primary key', () => {
      class TestModel extends BaseModel {
        protected static fieldsDef = {
          id: new Field({ primaryKey: true }),
          title: new Field({})
        }
      }

      const modelData = { id: 0 }
      expect(new TestModel(modelData).pk).toBe(0)
    })

    it('should return null if primary key is not set', () => {
      class TestModel extends BaseModel {
        protected static fieldsDef = {
          id: new Field({ primaryKey: true }),
          title: new Field()
        }
      }

      expect(new TestModel({ title: 'Title' }).pk).toBeNull()
    })

    it('should return no primary key with no primary key field', () => {
      class TestModel extends BaseModel {
        protected static fieldsDef = {
          id: new Field()
        }
      }

      expect(new TestModel({ id: 1 }).pk).toBeNull()
    })
  })

  describe('static getField', () => {
    class NameField extends Field {
    }

    class TestModel extends BaseModel {
      public static fieldsDef = {
        name: new NameField({ label: 'Name' })
      }
    }

    it('should return unbound field', () => {
      const field = TestModel.getField('name')
      expect(field).toBeInstanceOf(NameField)
      expect(field).toBe(TestModel.fieldsDef.name)
      expect(() => field.name).toThrow(FieldNotBoundException)
    })

    it('should throw NotDeclaredFieldException', () => {
      expect(() => TestModel.getField('not_declared')).toThrow(NotDeclaredFieldException)
    })
  })

  describe('getField', () => {
    class NameField extends Field {
    }

    class TestModel extends BaseModel {
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

  describe('getPrimaryKeyField', () => {
    it('should return primary key field', () => {
      const mockConsoleWarn = jest.spyOn(console, 'error').mockImplementation()

      class IDField extends Field {
      }

      class TestModel extends BaseModel {
        protected static fieldsDef = {
          id: new IDField({ primaryKey: true }),
          title: new Field({})
        }
      }

      const primaryKeyField = new TestModel().getPrimaryKeyField()
      expect(primaryKeyField).not.toBeNull()
      expect(primaryKeyField).toBeInstanceOf(IDField)
      if (!primaryKeyField) return
      expect(primaryKeyField.name).toBe('id')
      expect(primaryKeyField.isPrimaryKey).toBe(true)
      expect(mockConsoleWarn).not.toHaveBeenCalled()
      mockConsoleWarn.mockRestore()
    })

    it('should return warn for multiple primary key fields', () => {
      const mockConsoleWarn = jest.spyOn(console, 'error').mockImplementation()

      class TestModel extends BaseModel {
        protected static fieldsDef = {
          id: new Field({ primaryKey: true }),
          title: new Field({ primaryKey: true })
        }
      }

      const primaryKeyField = new TestModel().getPrimaryKeyField()
      expect(primaryKeyField).not.toBeNull()
      expect(primaryKeyField).toBeInstanceOf(Field)
      if (!primaryKeyField) return
      expect(primaryKeyField.isPrimaryKey).toBe(true)
      expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
      mockConsoleWarn.mockRestore()
    })

    it('should return no primary key field', () => {
      const mockConsoleWarn = jest.spyOn(console, 'error').mockImplementation()

      class TestModel extends BaseModel {
        protected static fieldsDef = {
          id: new Field(),
          title: new Field({})
        }
      }

      const primaryKeyField = new TestModel().getPrimaryKeyField()
      expect(primaryKeyField).toBeNull()
      expect(mockConsoleWarn).not.toHaveBeenCalled()
      mockConsoleWarn.mockRestore()
    })
  })
})
