import { ServiceModel } from '@/models/ServiceModel'
import { BaseModel } from '@/models/BaseModel'
import { ServiceParent } from '@/types/models/ServiceModel'
import { MissingUrlException } from '@/exceptions/ModelExceptions'

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

      expect(model.data).toBe(data)
      expect(model.parents).toEqual({})
    })

    it('should create ServiceModel with only parents', () => {
      const parents = { x: 1 }
      const model = new TestModel(undefined, parents)

      expect(model.data).toEqual({})
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

      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.checkServiceParents()).toBe(true)
      expect(console.warn).toHaveBeenCalledTimes(0)
      spy.mockRestore()
    })

    it('should check correct parents given', async () => {
      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1', 'parent2']
      }

      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.checkServiceParents({ parent1: 'text', parent2: 15 })).toBe(true)
      expect(console.warn).toHaveBeenCalledTimes(0)
      spy.mockRestore()
    })

    it('should check parents not given', async () => {
      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1', 'parent2']
      }

      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.checkServiceParents({})).toBe(false)

      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['Missing parents', 'TestModel', ['parent1', 'parent2']]
      ])
      spy.mockRestore()
    })

    it('should check missing parent', async () => {
      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1', 'parent2']
      }

      const parents: ServiceParent = { parent1: 10 }
      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.checkServiceParents(parents)).toBe(false)

      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['Missing parents', 'TestModel', ['parent2']]
      ])
      spy.mockRestore()
    })

    it('should check parents given no parents defined', async () => {
      class TestModel extends ServiceModel {
      }

      const parents: ServiceParent = { parent1: 10 }
      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.checkServiceParents(parents)).toBe(false)

      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['Too much parents given', 'TestModel', parents]
      ])
      spy.mockRestore()
    })

    it('should check parents too much parents given', async () => {
      class TestModel extends ServiceModel {
        protected static parentNames = ['parent1']
      }

      const parents: ServiceParent = { parent1: 10, parent2: 'text' }
      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.checkServiceParents(parents)).toBe(false)

      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['Too much parents given', 'TestModel', parents]
      ])
      spy.mockRestore()
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
})
