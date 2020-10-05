import { ServiceModel } from '@/models/ServiceModel'
import { BaseModel } from '@/models/BaseModel'
import { ServiceParent } from '@/types/models/ServiceModel'
import { MissingUrlException, NotDeclaredFieldException } from '@/exceptions/ModelExceptions'
import { Field } from '@/fields/Field'
import { isReactive } from 'vue'

describe('models/ServiceModel', () => {
  describe('constructor', () => {
    class TestModel extends ServiceModel {
    }

    it('should create ServiceModel with default values', () => {
      const model = new TestModel()
      expect(model).toBeInstanceOf(TestModel)
      expect(model).toBeInstanceOf(ServiceModel)
      expect(model).toBeInstanceOf(BaseModel)

      expect(model.data).toEqual({})
      expect(model.parents).toEqual({})
    })

    it('should create ServiceModel with no parents', () => {
      const data = { x: 1 }
      const model = new TestModel(data)

      expect(model.data).toEqual(data)
      expect(isReactive(model.data)).toBe(true)
      expect(model.parents).toEqual({})
    })

    it('should create ServiceModel with only parents', () => {
      const parents = { x: 1 }
      const model = new TestModel(undefined, parents)

      expect(model.data).toEqual({})
      expect(isReactive(model.data)).toBe(true)
      expect(model.parents).not.toBe(parents)
      expect(model.parents).toEqual(parents)
    })
  })

  describe('getListUrl', () => {
    it('should return urls.LIST', async () => {
      const listUrl = 'list-url/'

      class TestModel extends ServiceModel {
        protected static urls = {
          BASE: 'base-url/',
          LIST: listUrl,
          DETAIL: 'detail-url/'
        }
      }

      const spy = jest.spyOn(TestModel, 'checkServiceParents').mockImplementation()
      expect(await TestModel.getListUrl()).toBe(listUrl)
      expect(spy).toBeCalledTimes(1)
      spy.mockRestore()
    })

    it('should format urls.LIST with parents', async () => {
      const parents: ServiceParent = {
        parent1: 'val',
        parent2: 15
      }

      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1', 'parent2']
        protected static urls = {
          LIST: 'list-url/{parent1}/text/{parent2}/'
        }
      }

      expect(await TestModel.getListUrl(parents)).toBe('list-url/val/text/15/')
    })

    it('should return urls', async () => {
      const baseUrl = 'base-url/'

      class TestModel extends ServiceModel {
        protected static urls = baseUrl
      }

      expect(await TestModel.getListUrl()).toBe(baseUrl)
    })

    it('should return urls.BASE', async () => {
      const baseUrl = 'base-url/'

      class TestModel extends ServiceModel {
        protected static urls = {
          BASE: baseUrl,
          DETAIL: 'detail-url/'
        }
      }

      expect(await TestModel.getListUrl()).toBe(baseUrl)
    })

    it('should throw MissingUrlException', async () => {
      class TestModel extends ServiceModel {
      }

      await expect(TestModel.getListUrl()).rejects.toBeInstanceOf(MissingUrlException)
    })
  })

  describe('getDetailUrl', () => {
    it('should return urls.DETAIL', async () => {
      class TestModel extends ServiceModel {
        protected static urls = {
          BASE: 'base-url/',
          LIST: 'list-url',
          DETAIL: 'detail-url/{pk}/'
        }

        public static checkServiceParents (): boolean {
          return true
        }
      }

      const spy = jest.spyOn(TestModel, 'checkServiceParents').mockImplementation()
      expect(await TestModel.getDetailUrl('123')).toBe('detail-url/123/')
      expect(spy).toBeCalledTimes(1)
      spy.mockRestore()
    })

    it('should format urls.DETAIL with parents', async () => {
      const parents: ServiceParent = {
        parent1: 'val',
        parent2: 15
      }

      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1', 'parent2']
        protected static urls = {
          DETAIL: 'detail-url/{parent1}/text/{parent2}/{pk}/'
        }
      }

      expect(await TestModel.getDetailUrl(11, parents)).toBe('detail-url/val/text/15/11/')
    })

    it('should return urls.BASE', async () => {
      class TestModel extends ServiceModel {
        protected static urls = 'base-url/'
      }

      expect(await TestModel.getDetailUrl('pk-value')).toBe('base-url/pk-value/')
    })

    it('should return urls.BASE', async () => {
      class TestModel extends ServiceModel {
        protected static urls = {
          BASE: 'base-url/'
        }
      }

      expect(await TestModel.getDetailUrl('pk-value')).toBe('base-url/pk-value/')
    })

    it('should throw MissingUrlException', async () => {
      class TestModel extends ServiceModel {
      }

      await expect(TestModel.getDetailUrl(11)).rejects.toBeInstanceOf(MissingUrlException)
    })
  })

  describe('checkServiceParents', () => {
    it('should check no parents', async () => {
      class TestModel extends ServiceModel {
      }

      const spy = jest.spyOn(console, 'error').mockImplementation()
      expect(TestModel.checkServiceParents()).toBe(true)
      expect(console.error).toHaveBeenCalledTimes(0)
      spy.mockRestore()
    })

    it('should check correct parents given', async () => {
      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1', 'parent2']
      }

      const spy = jest.spyOn(console, 'error').mockImplementation()
      expect(TestModel.checkServiceParents({ parent1: 'text', parent2: 15 })).toBe(true)
      expect(console.error).toHaveBeenCalledTimes(0)
      spy.mockRestore()
    })

    it('should check parents not given', async () => {
      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1', 'parent2']
      }

      const spy = jest.spyOn(console, 'error').mockImplementation()
      expect(TestModel.checkServiceParents({})).toBe(false)

      expect(console.error).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['[vue-service-model] Missing parents', 'TestModel', ['parent1', 'parent2']]
      ])
      spy.mockRestore()
    })

    it('should check missing parent', async () => {
      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1', 'parent2']
      }

      const parents: ServiceParent = { parent1: 10 }
      const spy = jest.spyOn(console, 'error').mockImplementation()
      expect(TestModel.checkServiceParents(parents)).toBe(false)

      expect(console.error).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['[vue-service-model] Missing parents', 'TestModel', ['parent2']]
      ])
      spy.mockRestore()
    })

    it('should check parents given no parents defined', async () => {
      class TestModel extends ServiceModel {
      }

      const parents: ServiceParent = { parent1: 10 }
      const spy = jest.spyOn(console, 'error').mockImplementation()
      expect(TestModel.checkServiceParents(parents)).toBe(false)

      expect(console.error).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['[vue-service-model] Too much parents given', 'TestModel', parents]
      ])
      spy.mockRestore()
    })

    it('should check parents too much parents given', async () => {
      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1']
      }

      const parents: ServiceParent = { parent1: 10, parent2: 'text' }
      const spy = jest.spyOn(console, 'error').mockImplementation()
      expect(TestModel.checkServiceParents(parents)).toBe(false)

      expect(console.error).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['[vue-service-model] Too much parents given', 'TestModel', parents]
      ])
      spy.mockRestore()
    })
  })

  describe('mapPartialUpdateFields', () => {
    class TestModel extends ServiceModel {
      protected static fieldsDef = {
        id: new Field({ primaryKey: true }),
        title: new Field(),
        description: new Field(),
        nestedField: new Field({ attributeName: 'nested.field' })
      }
    }

    const modelData = {
      id: 1,
      title: 'Title',
      nested: {
        field: 'value'
      }
    }
    const model = new TestModel(modelData)

    it('should map fields', async () => {
      const spyMapFieldValue = jest.spyOn(model.getField('title'), 'mapFieldValue')

      expect(await model.mapPartialUpdateFields(model.data, ['title', 'description', 'nestedField'])).toEqual({
        title: 'Title',
        description: null,
        nested: {
          field: 'value'
        }
      })

      expect(spyMapFieldValue).toHaveBeenCalledTimes(1)
      spyMapFieldValue.mockRestore()
    })

    it('should throw error on unknown field', async () => {
      await expect(model.mapPartialUpdateFields(model.data, ['unknown_field'])).rejects.toBeInstanceOf(NotDeclaredFieldException)
    })
  })

  describe('objects', () => {
    it('should return ModelManager instance', () => {
      class TestModel extends ServiceModel {
      }

      const modelManager = TestModel.objects
      expect(modelManager).toBeInstanceOf(TestModel.ModelManager)
      expect(TestModel.objects).toBe(modelManager)
    })

    it('should return custom ModelManager instance', () => {
      const CustomModelManager = class extends ServiceModel.ModelManager {
      }

      class TestModel extends ServiceModel {
        public static ModelManager = CustomModelManager
      }

      const modelManager = TestModel.objects
      expect(modelManager).toBeInstanceOf(TestModel.ModelManager)
      expect(modelManager).toBeInstanceOf(CustomModelManager)
      expect(TestModel.objects).toBe(modelManager)
    })
  })

  describe('parents', () => {
    class TestModel extends ServiceModel {
    }

    it('should return parents', () => {
      const parents = { a: 1 }
      const model = new TestModel(undefined, parents)
      expect(model.parents).toEqual(parents)
      expect(model.parents).not.toBe(parents)
    })

    it('should set copy of parents', () => {
      const model = new TestModel()
      const parents = { a: 1 }
      expect(model.parents).toEqual({})

      model.parents = parents
      expect(model.parents).toEqual(parents)
      expect(model.parents).not.toBe(parents)
    })
  })

  describe('reload', () => {
    class TestModel extends ServiceModel {
      protected static fieldsDef = {
        id: new Field({ primaryKey: true }),
        title: new Field()
      }
    }

    it('should reload from service', async () => {
      const modelData = { id: 1, title: 'Old title' }
      const responseData = { id: 1, title: 'New Title' }
      const mockServiceStoreGetData = jest.spyOn(TestModel.objects, 'retrieveDetailData').mockImplementation(async () => responseData)

      const model = new TestModel(modelData)
      expect(await model.reload()).toBe(true)

      expect(model.data).toEqual(responseData)

      expect(mockServiceStoreGetData).toBeCalledTimes(1)
      expect(mockServiceStoreGetData.mock.calls[0]).toEqual([modelData.id, { refreshCache: true, parents: {} }])
      mockServiceStoreGetData.mockRestore()
    })

    it('should reload from service with parents', async () => {
      class ParentTestModel extends TestModel {
        protected static parentNames: ['parent1', 'parent2']
      }

      const parents = { parent1: 8, parent2: 'key' }
      const modelData = { id: 1, title: 'Old title' }
      const responseData = { id: 1, title: 'New Title' }
      const mockServiceStoreGetData = jest.spyOn(ParentTestModel.objects, 'retrieveDetailData').mockImplementation(async () => responseData)

      const model = new ParentTestModel(modelData, parents)
      expect(await model.reload()).toBe(true)

      expect(model.data).toEqual(responseData)

      expect(mockServiceStoreGetData).toBeCalledTimes(1)
      expect(mockServiceStoreGetData.mock.calls[0]).toEqual([modelData.id, { refreshCache: true, parents }])
      mockServiceStoreGetData.mockRestore()
    })

    it('should not reload without primary key', async () => {
      const mockServiceStoreGetData = jest.spyOn(TestModel.objects, 'retrieveDetailData').mockImplementation()

      const model = new TestModel()
      expect(await model.reload()).toBe(false)

      expect(mockServiceStoreGetData).not.toBeCalled()
      mockServiceStoreGetData.mockRestore()
    })
  })

  describe('create', () => {
    class TestModel extends ServiceModel {
      protected static fieldsDef = {
        id: new Field({ primaryKey: true }),
        title: new Field()
      }
    }

    it('should call ModelManager create', async () => {
      const modelData = { title: 'Title' }
      const newModelData = { id: 1, title: 'Title' }
      const mockModelManagerCreate = jest.spyOn(TestModel.objects, 'create').mockImplementation(async () => newModelData)

      const model = new TestModel(modelData)
      expect(await model.create()).toBe(true)

      expect(model.data).toEqual(newModelData)
      expect(isReactive(model.data)).toBe(true)

      expect(mockModelManagerCreate).toBeCalledTimes(1)
      expect(mockModelManagerCreate.mock.calls[0]).toEqual([modelData, { parents: {} }])

      mockModelManagerCreate.mockRestore()
    })

    it('should call ModelManager create with parents', async () => {
      class ParentTestModel extends TestModel {
        protected static parentNames: ['parent1', 'parent2']
      }

      const parents = { parent1: 8, parent2: 'key' }
      const modelData = { title: 'Title' }
      const newModelData = { id: 1, title: 'Title' }
      const mockModelManagerCreate = jest.spyOn(ParentTestModel.objects, 'create').mockImplementation(async () => newModelData)

      const model = new ParentTestModel(modelData, parents)
      expect(await model.create()).toBe(true)

      expect(model.data).toEqual(newModelData)
      expect(isReactive(model.data)).toBe(true)

      expect(mockModelManagerCreate).toBeCalledTimes(1)
      expect(mockModelManagerCreate.mock.calls[0]).toEqual([modelData, { parents }])
      mockModelManagerCreate.mockRestore()
    })

    it('should call ModelManager create and not reset data when update returns nothing', async () => {
      const modelData = { title: 'Title' }
      const mockModelManagerCreate = jest.spyOn(TestModel.objects, 'create').mockImplementation(async () => null)

      const model = new TestModel(modelData)
      expect(await model.create()).toBe(true)

      expect(model.data).not.toBeNull()
      expect(model.data).toEqual(modelData)
      expect(isReactive(model.data)).toBe(true)

      expect(mockModelManagerCreate).toBeCalledTimes(1)
      expect(mockModelManagerCreate.mock.calls[0]).toEqual([modelData, { parents: {} }])

      mockModelManagerCreate.mockRestore()
    })
  })

  describe('update', () => {
    class TestModel extends ServiceModel {
      protected static fieldsDef = {
        id: new Field({ primaryKey: true }),
        title: new Field()
      }
    }

    it('should call ModelManager update', async () => {
      const modelData = { id: 1, title: 'Title' }
      const newModelData = { id: 1, title: 'Updated Title' }
      const mockModelManagerUpdate = jest.spyOn(TestModel.objects, 'update').mockImplementation(async () => newModelData)

      const model = new TestModel(modelData)
      expect(await model.update()).toBe(true)

      expect(model.data).toEqual(newModelData)
      expect(isReactive(model.data)).toBe(true)

      expect(mockModelManagerUpdate).toBeCalledTimes(1)
      expect(mockModelManagerUpdate.mock.calls[0]).toEqual([modelData.id, modelData, { parents: {}, partial: false }])

      mockModelManagerUpdate.mockRestore()
    })

    it('should call ModelManager update with parents', async () => {
      class ParentTestModel extends TestModel {
        protected static parentNames: ['parent1', 'parent2']
      }

      const parents = { parent1: 8, parent2: 'key' }
      const modelData = { id: 1, title: 'Title' }
      const newModelData = { id: 1, title: 'Updated Title' }
      const mockModelManagerUpdate = jest.spyOn(ParentTestModel.objects, 'update').mockImplementation(async () => newModelData)

      const model = new ParentTestModel(modelData, parents)
      expect(await model.update()).toBe(true)

      expect(model.data).toEqual(newModelData)
      expect(isReactive(model.data)).toBe(true)

      expect(mockModelManagerUpdate).toBeCalledTimes(1)
      expect(mockModelManagerUpdate.mock.calls[0]).toEqual([modelData.id, modelData, { parents, partial: false }])
      mockModelManagerUpdate.mockRestore()
    })

    it('should call ModelManager update and not reset data when update returns nothing', async () => {
      const modelData = { id: 1, title: 'Title' }
      const mockModelManagerUpdate = jest.spyOn(TestModel.objects, 'update').mockImplementation(async () => null)

      const model = new TestModel(modelData)
      expect(await model.update()).toBe(true)

      expect(model.data).not.toBeNull()
      expect(model.data).toEqual(modelData)
      expect(isReactive(model.data)).toBe(true)

      expect(mockModelManagerUpdate).toBeCalledTimes(1)
      expect(mockModelManagerUpdate.mock.calls[0]).toEqual([modelData.id, modelData, { parents: {}, partial: false }])

      mockModelManagerUpdate.mockRestore()
    })

    it('should call ModelManager update partial', async () => {
      const modelData = { id: 1, title: 'Title' }
      const mockModelManagerUpdate = jest.spyOn(TestModel.objects, 'update').mockImplementation(async () => null)
      const model = new TestModel(modelData)

      const mockMapPartialUpdateFields = jest.spyOn(model, 'mapPartialUpdateFields')

      expect(await model.update({ updateFields: ['title'] })).toBe(true)

      expect(mockMapPartialUpdateFields).toBeCalledTimes(1)
      expect(mockMapPartialUpdateFields.mock.calls[0]).toEqual([modelData, ['title']])

      expect(mockModelManagerUpdate).toBeCalledTimes(1)
      expect(mockModelManagerUpdate.mock.calls[0]).toEqual([
        modelData.id,
        { title: modelData.title },
        { parents: {}, partial: true }
      ])

      mockModelManagerUpdate.mockRestore()
      mockMapPartialUpdateFields.mockRestore()
    })

    it('should not call ModelManager update without primary key', async () => {
      const mockModelManagerUpdate = jest.spyOn(TestModel.objects, 'update').mockImplementation(async () => null)

      const model = new TestModel()
      expect(await model.update()).toBe(false)

      expect(mockModelManagerUpdate).not.toBeCalled()
      mockModelManagerUpdate.mockRestore()
    })
  })

  describe('save', () => {
    class TestModel extends ServiceModel {
      protected static fieldsDef = {
        id: new Field({ primaryKey: true }),
        title: new Field()
      }
    }

    it('should call create when no primary key is set', async () => {
      const modelData = { title: 'Title' }
      const model = new TestModel(modelData)
      const mockCreate = jest.spyOn(model, 'create').mockImplementation(async () => true)
      const mockUpdate = jest.spyOn(model, 'update').mockImplementation(async () => true)

      expect(await model.save()).toBe(true)

      expect(mockCreate).toBeCalledTimes(1)
      expect(mockUpdate).not.toBeCalled()

      mockCreate.mockRestore()
      mockUpdate.mockRestore()
    })

    it('should call create when primary key is set', async () => {
      const modelData = { id: true, title: 'Title' }
      const model = new TestModel(modelData)
      const mockCreate = jest.spyOn(model, 'create').mockImplementation(async () => true)
      const mockUpdate = jest.spyOn(model, 'update').mockImplementation(async () => true)

      expect(await model.save()).toBe(false)

      expect(mockCreate).not.toBeCalled()
      expect(mockUpdate).toBeCalledTimes(1)

      mockCreate.mockRestore()
      mockUpdate.mockRestore()
    })
  })

  describe('delete', () => {
    class TestModel extends ServiceModel {
      protected static fieldsDef = {
        id: new Field({ primaryKey: true }),
        title: new Field()
      }
    }

    it('should call ModelManager delete', async () => {
      const modelData = { id: 1, title: 'Title' }
      const mockModelManagerDelete = jest.spyOn(TestModel.objects, 'delete').mockImplementation(async () => null)

      const model = new TestModel(modelData)
      expect(await model.delete()).toBe(true)

      expect(mockModelManagerDelete).toBeCalledTimes(1)
      expect(mockModelManagerDelete.mock.calls[0]).toEqual([modelData.id, { parents: {} }])
      mockModelManagerDelete.mockRestore()
    })

    it('should call ModelManager delete with parents', async () => {
      class ParentTestModel extends TestModel {
        protected static parentNames: ['parent1', 'parent2']
      }

      const parents = { parent1: 8, parent2: 'key' }
      const modelData = { id: 1, title: 'Title' }
      const mockModelManagerDelete = jest.spyOn(ParentTestModel.objects, 'delete').mockImplementation(async () => null)

      const model = new ParentTestModel(modelData, parents)
      expect(await model.delete()).toBe(true)

      expect(mockModelManagerDelete).toBeCalledTimes(1)
      expect(mockModelManagerDelete.mock.calls[0]).toEqual([modelData.id, { parents }])
      mockModelManagerDelete.mockRestore()
    })

    it('should not call ModelManager delete without primary key', async () => {
      const mockModelManagerDelete = jest.spyOn(TestModel.objects, 'delete').mockImplementation(async () => null)

      const model = new TestModel()
      expect(await model.delete()).toBe(false)

      expect(mockModelManagerDelete).not.toBeCalled()
      mockModelManagerDelete.mockRestore()
    })
  })
})
