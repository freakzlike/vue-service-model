import cu from '@/utils/common'
import store from '@/store'
import axios from 'axios'
import { ServiceModel, MissingUrlException, ServiceParent } from '@/models/ServiceModel'
import Dictionary from '@/types/Dictionary'

jest.mock('axios')

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

  /**
   * ModelManager
   */
  describe('ModelManager', () => {
    const BASE_URL = 'test-base-url/'
    const PARENT_BASE_URL = 'test/{parent1}/base/{parent2}/url/'

    class BaseTestModel extends ServiceModel {
      protected static cacheDuration = 0
    }

    class TestModel extends BaseTestModel {
      public static keyName = 'TestModel'
      protected static urls = {
        BASE: BASE_URL
      }
    }

    class ParentTestModel extends BaseTestModel {
      public static keyName = 'ParentTestModel'
      protected static parents = ['parent1', 'parent2']
      protected static urls = {
        BASE: PARENT_BASE_URL
      }
    }

    const CACHED_TEST_MODEL_URL = '/parent/{parent}/model/'

    class CachedTestModel extends ServiceModel {
      public static keyName = 'CachedTestModel'
      protected static parents = ['parent']
      protected static cacheDuration = null
      protected static urls = {
        BASE: CACHED_TEST_MODEL_URL
      }
    }

    const withMockedAxios = async (
      responseData: Dictionary<any> | Array<Dictionary<any>>,
      callback: (mockedAxios: jest.Mocked<typeof axios>) => void
    ) => {
      const mockedAxios = axios as jest.Mocked<typeof axios>
      mockedAxios.get.mockResolvedValue({ data: responseData })

      try {
        await callback(mockedAxios)
      } finally {
        mockedAxios.get.mockClear()
      }
    }

    const checkListResponseData = (
      responseData: Array<Dictionary<any>>,
      resultData: Array<BaseTestModel>,
      model: typeof BaseTestModel
    ) => {
      expect(resultData).toHaveLength(responseData.length)
      resultData.forEach((entry: BaseTestModel, index: number) => {
        expect(entry).toBeInstanceOf(model)
        expect(entry.data).toEqual(responseData[index])
      })
    }

    /**
     * objects.all()
     */
    describe('all', () => {
      it('should request all', async () => {
        const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
        await withMockedAxios(responseData, async mockedAxios => {
          const mockSendListRequest = jest.spyOn(TestModel.objects, 'sendListRequest')
          const mockMapListResponseBeforeCache = jest.spyOn(TestModel.objects, 'mapListResponseBeforeCache')

          const resultData = await TestModel.objects.all()
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockedAxios.get.mock.calls).toEqual([[BASE_URL, {}]])

          expect(mockSendListRequest).toBeCalledTimes(1)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

          checkListResponseData(responseData, resultData, TestModel)
          mockSendListRequest.mockRestore()
          mockMapListResponseBeforeCache.mockRestore()
        })
      })

      it('should request all with parents', async () => {
        const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
        await withMockedAxios(responseData, async mockedAxios => {
          const mockCheckServiceParents = jest.spyOn(ParentTestModel, 'checkServiceParents')
          const mockSendListRequest = jest.spyOn(ParentTestModel.objects, 'sendListRequest')
          const mockMapListResponseBeforeCache = jest.spyOn(ParentTestModel.objects, 'mapListResponseBeforeCache')

          const parents: ServiceParent = { parent1: 'parent-1', parent2: 8 }
          const resultData = await ParentTestModel.objects.all(parents)

          expect(mockCheckServiceParents).toBeCalledTimes(2)
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockedAxios.get.mock.calls).toEqual([[cu.format(PARENT_BASE_URL, parents), {}]])

          expect(mockSendListRequest).toBeCalledTimes(1)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

          checkListResponseData(responseData, resultData, ParentTestModel)
          mockCheckServiceParents.mockRestore()
          mockSendListRequest.mockRestore()
          mockMapListResponseBeforeCache.mockRestore()
        })
      })

      it('should request all from different parents', async () => {
        const responseData = [{ text: 'Entry 1' }]
        await withMockedAxios(responseData, async mockedAxios => {
          const mockSendListRequest = jest.spyOn(CachedTestModel.objects, 'sendListRequest')
          const mockMapListResponseBeforeCache = jest.spyOn(CachedTestModel.objects, 'mapListResponseBeforeCache')

          const parents1: ServiceParent = { parent: 1 }
          await CachedTestModel.objects.all(parents1)
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockedAxios.get.mock.calls[0]).toEqual([cu.format(CACHED_TEST_MODEL_URL, parents1), {}])
          expect(mockSendListRequest).toBeCalledTimes(1)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

          // Check if cached
          await CachedTestModel.objects.all(parents1)
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockSendListRequest).toBeCalledTimes(1)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

          // Check with other parent
          const parents2: ServiceParent = { parent: 2 }
          await CachedTestModel.objects.all(parents2)
          expect(mockedAxios.get.mock.calls).toHaveLength(2)
          expect(mockedAxios.get.mock.calls[1]).toEqual([cu.format(CACHED_TEST_MODEL_URL, parents2), {}])
          expect(mockSendListRequest).toBeCalledTimes(2)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(2)

          mockSendListRequest.mockRestore()
          mockMapListResponseBeforeCache.mockRestore()
        })
      })
    })

    /**
     * objects.filter()
     */
    describe('filter', () => {
      it('should request filter list', async () => {
        const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
        await withMockedAxios(responseData, async mockedAxios => {
          const mockSendListRequest = jest.spyOn(TestModel.objects, 'sendListRequest')
          const mockMapListResponseBeforeCache = jest.spyOn(TestModel.objects, 'mapListResponseBeforeCache')

          const filterParams = { name: 'text' }
          const resultData = await TestModel.objects.filter(filterParams)

          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockedAxios.get.mock.calls).toEqual([[BASE_URL, { params: filterParams }]])

          expect(mockSendListRequest).toBeCalledTimes(1)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

          checkListResponseData(responseData, resultData, TestModel)
          mockSendListRequest.mockRestore()
          mockMapListResponseBeforeCache.mockRestore()
        })
      })

      it('should request filter list with parents', async () => {
        const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
        await withMockedAxios(responseData, async mockedAxios => {
          const mockCheckServiceParents = jest.spyOn(ParentTestModel, 'checkServiceParents')
          const mockSendListRequest = jest.spyOn(ParentTestModel.objects, 'sendListRequest')
          const mockMapListResponseBeforeCache = jest.spyOn(ParentTestModel.objects, 'mapListResponseBeforeCache')

          const filterParams = { name: 'text' }

          const parents: ServiceParent = { parent1: 'parent-1', parent2: 8 }
          const resultData = await ParentTestModel.objects.filter(filterParams, parents)

          expect(mockCheckServiceParents).toBeCalledTimes(2)
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockedAxios.get.mock.calls).toEqual([[cu.format(PARENT_BASE_URL, parents), { params: filterParams }]])

          expect(mockSendListRequest).toBeCalledTimes(1)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

          checkListResponseData(responseData, resultData, ParentTestModel)
          mockCheckServiceParents.mockRestore()
          mockSendListRequest.mockRestore()
          mockMapListResponseBeforeCache.mockRestore()
        })
      })

      it('should request all from different parents and filters', async () => {
        const responseData = [{ text: 'Entry 1' }]
        await withMockedAxios(responseData, async mockedAxios => {
          const mockSendListRequest = jest.spyOn(CachedTestModel.objects, 'sendListRequest')
          const mockMapListResponseBeforeCache = jest.spyOn(CachedTestModel.objects, 'mapListResponseBeforeCache')

          const parents1: ServiceParent = { parent: 1 }
          const parents2: ServiceParent = { parent: 2 }
          const filter1 = { name: 1 }
          const filter2 = { name: 2 }

          await CachedTestModel.objects.filter(filter1, parents1)
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockedAxios.get.mock.calls[0]).toEqual([cu.format(CACHED_TEST_MODEL_URL, parents1), { params: filter1 }])
          expect(mockSendListRequest).toBeCalledTimes(1)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

          // Check if cached
          await CachedTestModel.objects.filter(filter1, parents1)
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockSendListRequest).toBeCalledTimes(1)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

          // Check with other filter
          await CachedTestModel.objects.filter(filter2, parents1)
          expect(mockedAxios.get.mock.calls).toHaveLength(2)
          expect(mockedAxios.get.mock.calls[1]).toEqual([cu.format(CACHED_TEST_MODEL_URL, parents1), { params: filter2 }])
          expect(mockSendListRequest).toBeCalledTimes(2)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(2)

          // Check with other parent
          await CachedTestModel.objects.filter(filter1, parents2)
          expect(mockedAxios.get.mock.calls).toHaveLength(3)
          expect(mockedAxios.get.mock.calls[2]).toEqual([cu.format(CACHED_TEST_MODEL_URL, parents2), { params: filter1 }])
          expect(mockSendListRequest).toBeCalledTimes(3)
          expect(mockMapListResponseBeforeCache).toBeCalledTimes(3)

          mockSendListRequest.mockRestore()
          mockMapListResponseBeforeCache.mockRestore()
        })
      })
    })

    /**
     * objects.get()
     */
    describe('get', () => {
      it('should request detail', async () => {
        const responseData = { text: 'Entry 1' }
        await withMockedAxios(responseData, async mockedAxios => {
          const mockSendDetailRequest = jest.spyOn(TestModel.objects, 'sendDetailRequest')
          const mockMapDetailResponseBeforeCache = jest.spyOn(TestModel.objects, 'mapDetailResponseBeforeCache')

          const pk = 1
          const entry = await TestModel.objects.get(pk)

          const url = BASE_URL + pk + '/'
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockedAxios.get.mock.calls).toEqual([[url]])
          expect(mockSendDetailRequest).toBeCalledTimes(1)
          expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)

          expect(entry).toBeInstanceOf(TestModel)
          expect(entry.data).toEqual(responseData)
          mockSendDetailRequest.mockRestore()
          mockMapDetailResponseBeforeCache.mockRestore()
        })
      })

      it('should request detail with parents', async () => {
        const responseData = { text: 'Entry 1' }
        await withMockedAxios(responseData, async mockedAxios => {
          const mockCheckServiceParents = jest.spyOn(ParentTestModel, 'checkServiceParents')
          const mockSendDetailRequest = jest.spyOn(ParentTestModel.objects, 'sendDetailRequest')
          const mockMapDetailResponseBeforeCache = jest.spyOn(ParentTestModel.objects, 'mapDetailResponseBeforeCache')
          const pk = 1

          const parents: ServiceParent = { parent1: 'parent-1', parent2: 8 }
          const entry = await ParentTestModel.objects.get(pk, parents)

          const url = cu.format(PARENT_BASE_URL, parents) + pk + '/'
          expect(mockCheckServiceParents).toBeCalledTimes(2)
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockedAxios.get.mock.calls).toEqual([[url]])
          expect(mockSendDetailRequest).toBeCalledTimes(1)
          expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)

          expect(entry).toBeInstanceOf(ParentTestModel)
          expect(entry.data).toEqual(responseData)
          mockCheckServiceParents.mockRestore()
          mockSendDetailRequest.mockRestore()
          mockMapDetailResponseBeforeCache.mockRestore()
        })
      })

      it('should request detail from different parents', async () => {
        const responseData = [{ text: 'Entry 1' }]
        await withMockedAxios(responseData, async mockedAxios => {
          const mockSendDetailRequest = jest.spyOn(CachedTestModel.objects, 'sendDetailRequest')
          const mockMapDetailResponseBeforeCache = jest.spyOn(CachedTestModel.objects, 'mapDetailResponseBeforeCache')

          const pk = 1
          const parents1: ServiceParent = { parent: 1 }
          const parents2: ServiceParent = { parent: 2 }
          await CachedTestModel.objects.get(pk, parents1)
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          let url = cu.format(CACHED_TEST_MODEL_URL, parents1) + pk.toString() + '/'
          expect(mockedAxios.get.mock.calls[0]).toEqual([url])
          expect(mockSendDetailRequest).toBeCalledTimes(1)
          expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)

          // Check if cached
          await CachedTestModel.objects.get(pk, parents1)
          expect(mockedAxios.get.mock.calls).toHaveLength(1)
          expect(mockSendDetailRequest).toBeCalledTimes(1)
          expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)

          // Check with other parent
          await CachedTestModel.objects.get(pk, parents2)
          expect(mockedAxios.get.mock.calls).toHaveLength(2)
          url = cu.format(CACHED_TEST_MODEL_URL, parents2) + pk.toString() + '/'
          expect(mockedAxios.get.mock.calls[1]).toEqual([url])
          expect(mockSendDetailRequest).toBeCalledTimes(2)
          expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(2)

          mockSendDetailRequest.mockRestore()
          mockMapDetailResponseBeforeCache.mockRestore()
        })
      })
    })
  })
})
