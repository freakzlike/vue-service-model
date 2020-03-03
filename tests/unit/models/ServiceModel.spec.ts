import store from '@/store'
import { ServiceModel, MissingUrlException, ServiceParent } from '@/models/ServiceModel'

describe('models/ServiceModel', () => {
  describe('getListUrl', () => {
    it('should return urls.LIST', async () => {
      const listUrl = 'list-url/'

      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
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
        public static keyName = 'TestModel'
        protected static parents = ['parent1', 'parent2']
        protected static urls = {
          LIST: 'list-url/{parent1}/text/{parent2}/'
        }
      }

      expect(await TestModel.getListUrl(parents)).toBe('list-url/val/text/15/')
    })

    it('should return urls.BASE', async () => {
      const baseUrl = 'base-url/'

      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
        protected static urls = {
          BASE: baseUrl,
          DETAIL: 'detail-url/'
        }
      }

      expect(await TestModel.getListUrl()).toBe(baseUrl)
    })

    it('should throw MissingUrlException', async () => {
      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
      }

      await expect(TestModel.getListUrl()).rejects.toBeInstanceOf(MissingUrlException)
    })
  })

  describe('getDetailUrl', () => {
    it('should return urls.DETAIL', async () => {
      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
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
        public static keyName = 'TestModel'
        protected static parents = ['parent1', 'parent2']
        protected static urls = {
          DETAIL: 'detail-url/{parent1}/text/{parent2}/{pk}/'
        }
      }

      expect(await TestModel.getDetailUrl(11, parents)).toBe('detail-url/val/text/15/11/')
    })

    it('should return urls.BASE', async () => {
      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
        protected static urls = {
          BASE: 'base-url/'
        }
      }

      expect(await TestModel.getDetailUrl('pk-value')).toBe('base-url/pk-value/')
    })

    it('should throw MissingUrlException', async () => {
      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
      }

      await expect(TestModel.getDetailUrl(11)).rejects.toBeInstanceOf(MissingUrlException)
    })
  })

  describe('checkServiceParents', () => {
    it('should check no parents', async () => {
      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
      }

      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.checkServiceParents()).toBe(true)
      expect(console.warn).toHaveBeenCalledTimes(0)
      spy.mockRestore()
    })

    it('should check correct parents given', async () => {
      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
        protected static parents = ['parent1', 'parent2']
      }

      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.checkServiceParents({ parent1: 'text', parent2: 15 })).toBe(true)
      expect(console.warn).toHaveBeenCalledTimes(0)
      spy.mockRestore()
    })

    it('should check parents not given', async () => {
      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
        protected static parents = ['parent1', 'parent2']
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
        public static keyName = 'TestModel'
        protected static parents = ['parent1', 'parent2']
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
        public static keyName = 'TestModel'
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
        public static keyName = 'TestModel'
        protected static parents = ['parent1']
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

  describe('storeName', () => {
    it('should return correct storeName', () => {
      class TestModel extends ServiceModel {
        public static keyName = 'AppTestModel'
      }

      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.storeName).toBe('service/AppTestModel')

      expect(console.warn).toHaveBeenCalledTimes(0)
      spy.mockRestore()
    })

    it('should warn for missing keyName', () => {
      class TestModel extends ServiceModel {
      }

      const spy = jest.spyOn(console, 'warn').mockImplementation()
      expect(TestModel.storeName).toBe('service/TestModel')

      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toEqual([
        ['Missing keyName for Model', 'TestModel']
      ])
      spy.mockRestore()
    })
  })

  describe('register', () => {
    it('should register model and create store module', () => {
      const storeObj = {}
      const mockServiceStoreFactory = jest.fn(() => storeObj)

      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
        protected static cacheDuration = 15
        protected static storeFactory = mockServiceStoreFactory
      }

      class OtherModel extends ServiceModel {
        public static keyName = 'OtherModel'
      }

      jest.mock('@/store/ServiceStoreFactory', () => ({
        __esModule: true,
        ServiceStoreFactory: mockServiceStoreFactory
      }))

      const spy = jest.spyOn(store, 'registerModule').mockImplementation()
      expect(TestModel.register()).toBe(true)
      expect(OtherModel.register()).toBe(true)
      expect(TestModel.register()).toBe(false)
      expect(OtherModel.register()).toBe(false)

      expect(mockServiceStoreFactory.mock.calls).toHaveLength(1)
      expect(mockServiceStoreFactory.mock.calls).toEqual([[15]])
      expect(store.registerModule).toHaveBeenCalledTimes(2)
      expect(spy.mock.calls[0]).toEqual([TestModel.storeName, storeObj])
      spy.mockRestore()
    })
  })

  describe('objects', () => {
    it('should return ModelManager instance', () => {
      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
      }

      const modelManager = TestModel.objects
      expect(modelManager).toBeInstanceOf(TestModel.ModelManager)
      expect(TestModel.objects).toBe(modelManager)
      store.unregisterModule(TestModel.storeName)
    })

    it('should return custom ModelManager instance', () => {
      const CustomModelManager = class extends ServiceModel.ModelManager {
      }

      class TestModel extends ServiceModel {
        public static keyName = 'TestModel'
        public static ModelManager = CustomModelManager
      }

      const modelManager = TestModel.objects
      expect(modelManager).toBeInstanceOf(TestModel.ModelManager)
      expect(modelManager).toBeInstanceOf(CustomModelManager)
      expect(TestModel.objects).toBe(modelManager)
      store.unregisterModule(TestModel.storeName)
    })
  })
})
