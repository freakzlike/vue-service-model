import { format } from '@/utils/common'
import axios from 'axios'
import { ServiceModel } from '@/models/ServiceModel'
import { ServiceParent } from '@/types/models/ServiceModel'
import Dictionary from '@/types/Dictionary'
import { configHandler } from '@/utils/ConfigHandler'
import {
  APIException,
  BadRequestAPIException,
  UnauthorizedAPIException,
  ForbiddenAPIException,
  NotFoundAPIException,
  InternalServerErrorAPIException
} from '@/exceptions/APIExceptions'

jest.mock('axios')

describe('models/ModelManager', () => {
  const BASE_URL = 'test-base-url/'
  const PARENT_BASE_URL = 'test/{parent1}/base/{parent2}/url/'

  class BaseTestModel extends ServiceModel {
    protected static cacheDuration: number | null = 0
  }

  class TestModel extends BaseTestModel {
    protected static urls = BASE_URL
  }

  class ParentTestModel extends BaseTestModel {
    protected static parentNames = ['parent1', 'parent2']
    protected static urls = PARENT_BASE_URL
  }

  const CACHED_TEST_MODEL_URL = '/parent/{parent}/model/'

  class CachedTestModel extends ServiceModel {
    protected static parentNames = ['parent']
    protected static cacheDuration = null
    protected static urls = CACHED_TEST_MODEL_URL
  }

  const withMockedAxios = async (
    response: Dictionary<any> | Array<Dictionary<any>> | null,
    callback: (mockedAxios: jest.Mocked<typeof axios>) => void,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete' = 'get'
  ) => {
    const mockedAxios = axios as jest.Mocked<typeof axios>
    if (response) {
      mockedAxios[method].mockResolvedValue({ data: response })
    }

    try {
      await callback(mockedAxios)
    } finally {
      mockedAxios[method].mockClear()
    }
  }

  const checkModelParents = (model: ServiceModel, parents?: ServiceParent) => {
    if (parents) {
      expect(model.parents).not.toBe(parents)
      expect(model.parents).toEqual(parents)
    } else {
      expect(model.parents).toEqual({})
    }
  }

  const checkListResponseData = (
    responseData: Array<Dictionary<any>>,
    resultData: Array<ServiceModel>,
    model: typeof ServiceModel,
    parents?: ServiceParent
  ) => {
    expect(resultData).toHaveLength(responseData.length)
    resultData.forEach((entry: ServiceModel, index: number) => {
      expect(entry).toBeInstanceOf(model)
      expect(entry.data).toEqual(responseData[index])
      checkModelParents(entry, parents)
    })
  }

  /**
   * objects.list()
   */
  describe('list', () => {
    it('should request all', async () => {
      const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
      await withMockedAxios(responseData, async mockedAxios => {
        const mockSendListRequest = jest.spyOn(TestModel.objects, 'sendListRequest')
        const mockMapListResponseBeforeCache = jest.spyOn(TestModel.objects, 'mapListResponseBeforeCache')
        const mockEmitEvent = jest.spyOn(configHandler, 'emitEvent').mockImplementation()

        const resultData = await TestModel.objects.list()
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[BASE_URL, {}]])

        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        checkListResponseData(responseData, resultData, TestModel)

        expect(mockEmitEvent).toBeCalledTimes(1)
        expect(mockEmitEvent.mock.calls[0]).toEqual(['onSendListRequest', [{
          modelManager: TestModel.objects, url: BASE_URL, params: { noCache: true }
        }]])

        mockEmitEvent.mockRestore()
        mockSendListRequest.mockRestore()
        mockMapListResponseBeforeCache.mockRestore()
      })
    })

    it('should request filter list', async () => {
      const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
      await withMockedAxios(responseData, async mockedAxios => {
        const mockSendListRequest = jest.spyOn(TestModel.objects, 'sendListRequest')
        const mockMapListResponseBeforeCache = jest.spyOn(TestModel.objects, 'mapListResponseBeforeCache')

        const filterParams = { name: 'text' }
        const resultData = await TestModel.objects.list({ filter: filterParams })

        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[BASE_URL, { params: filterParams }]])

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
        const resultData = await ParentTestModel.objects.list({ parents })

        expect(mockCheckServiceParents).toBeCalledTimes(1)
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[format(PARENT_BASE_URL, parents), {}]])

        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        checkListResponseData(responseData, resultData, ParentTestModel, parents)
        mockCheckServiceParents.mockRestore()
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
        const resultData = await ParentTestModel.objects.list({ parents, filter: filterParams })

        expect(mockCheckServiceParents).toBeCalledTimes(1)
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[format(PARENT_BASE_URL, parents), { params: filterParams }]])

        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        checkListResponseData(responseData, resultData, ParentTestModel, parents)
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

        await CachedTestModel.objects.list({ parents: parents1, filter: filter1, noCache: false })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls[0]).toEqual([format(CACHED_TEST_MODEL_URL, parents1), { params: filter1 }])
        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        // Check if cached
        await CachedTestModel.objects.list({ parents: parents1, filter: filter1, noCache: false })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        // Check with other filter
        await CachedTestModel.objects.list({ parents: parents1, filter: filter2, noCache: false })
        expect(mockedAxios.get.mock.calls).toHaveLength(2)
        expect(mockedAxios.get.mock.calls[1]).toEqual([format(CACHED_TEST_MODEL_URL, parents1), { params: filter2 }])
        expect(mockSendListRequest).toBeCalledTimes(2)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(2)

        // Check with other parent
        await CachedTestModel.objects.list({ parents: parents2, filter: filter1, noCache: false })
        expect(mockedAxios.get.mock.calls).toHaveLength(3)
        expect(mockedAxios.get.mock.calls[2]).toEqual([format(CACHED_TEST_MODEL_URL, parents2), { params: filter1 }])
        expect(mockSendListRequest).toBeCalledTimes(3)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(3)

        mockSendListRequest.mockRestore()
        mockMapListResponseBeforeCache.mockRestore()
      })
    })

    it('should request all without cache', async () => {
      class CacheTestModel extends TestModel {
        protected static cacheDuration = null
      }

      const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
      await withMockedAxios(responseData, async mockedAxios => {
        const mockSendListRequest = jest.spyOn(CacheTestModel.objects, 'sendListRequest')
        const mockMapListResponseBeforeCache = jest.spyOn(CacheTestModel.objects, 'mapListResponseBeforeCache')

        const resultData = await CacheTestModel.objects.list()
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[BASE_URL, {}]])

        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        checkListResponseData(responseData, resultData, CacheTestModel)

        // Check if not cached
        await CacheTestModel.objects.list()
        expect(mockedAxios.get.mock.calls).toHaveLength(2)
        expect(mockSendListRequest).toBeCalledTimes(2)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(2)

        mockSendListRequest.mockRestore()
        mockMapListResponseBeforeCache.mockRestore()
      })
    })

    it('should request all with cache', async () => {
      class CacheTestModel extends TestModel {
        protected static cacheDuration = null
      }

      const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
      await withMockedAxios(responseData, async mockedAxios => {
        const mockSendListRequest = jest.spyOn(CacheTestModel.objects, 'sendListRequest')
        const mockMapListResponseBeforeCache = jest.spyOn(CacheTestModel.objects, 'mapListResponseBeforeCache')

        const resultData = await CacheTestModel.objects.list({ noCache: false })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[BASE_URL, {}]])

        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        checkListResponseData(responseData, resultData, CacheTestModel)

        // Check if cached
        await CacheTestModel.objects.list({ noCache: false })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        mockSendListRequest.mockRestore()
        mockMapListResponseBeforeCache.mockRestore()
      })
    })

    it('should handle error from service', async () => {
      await withMockedAxios(null, async mockedAxios => {
        const mockHandleResponseError = jest.spyOn(TestModel.objects, 'handleResponseError')
        const customError = new Error('Handle error')
        mockedAxios.get.mockRejectedValue(customError)

        expect.assertions(2)
        await expect(TestModel.objects.list()).rejects.toBe(customError)
        expect(mockHandleResponseError).toBeCalledTimes(1)
        mockHandleResponseError.mockRestore()
      })
    })
  })

  /**
   * objects.detail()
   */
  describe('detail', () => {
    it('should request detail', async () => {
      const responseData = { text: 'Entry 1' }
      await withMockedAxios(responseData, async mockedAxios => {
        const mockRetrieveDetailData = jest.spyOn(TestModel.objects, 'retrieveDetailData')
        const mockSendDetailRequest = jest.spyOn(TestModel.objects, 'sendDetailRequest')
        const mockMapDetailResponseBeforeCache = jest.spyOn(TestModel.objects, 'mapDetailResponseBeforeCache')
        const mockEmitEvent = jest.spyOn(configHandler, 'emitEvent').mockImplementation()

        const pk = 1
        const entry = await TestModel.objects.detail(pk)

        const url = BASE_URL + pk + '/'
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[url, {}]])
        expect(mockRetrieveDetailData).toBeCalledTimes(1)
        expect(mockSendDetailRequest).toBeCalledTimes(1)
        expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)

        expect(entry).toBeInstanceOf(TestModel)
        expect(entry.data).toEqual(responseData)
        checkModelParents(entry)

        expect(mockEmitEvent).toBeCalledTimes(1)
        expect(mockEmitEvent.mock.calls[0]).toEqual(['onSendDetailRequest', [{
          modelManager: TestModel.objects, url, pk, params: undefined
        }]])

        mockEmitEvent.mockRestore()
        mockRetrieveDetailData.mockRestore()
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
        const entry = await ParentTestModel.objects.detail(pk, { parents })

        const url = format(PARENT_BASE_URL, parents) + pk + '/'
        expect(mockCheckServiceParents).toBeCalledTimes(1)
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[url, {}]])
        expect(mockSendDetailRequest).toBeCalledTimes(1)
        expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)

        expect(entry).toBeInstanceOf(ParentTestModel)
        expect(entry.data).toEqual(responseData)
        checkModelParents(entry, parents)
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

        let entry = await CachedTestModel.objects.detail(pk, { parents: parents1 })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        let url = format(CACHED_TEST_MODEL_URL, parents1) + pk.toString() + '/'
        expect(mockedAxios.get.mock.calls[0]).toEqual([url, {}])
        expect(mockSendDetailRequest).toBeCalledTimes(1)
        expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)
        checkModelParents(entry, parents1)

        // Check if cached
        entry = await CachedTestModel.objects.detail(pk, { parents: parents1 })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockSendDetailRequest).toBeCalledTimes(1)
        expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)
        checkModelParents(entry, parents1)

        // Check with other parent
        entry = await CachedTestModel.objects.detail(pk, { parents: parents2 })
        expect(mockedAxios.get.mock.calls).toHaveLength(2)
        url = format(CACHED_TEST_MODEL_URL, parents2) + pk.toString() + '/'
        expect(mockedAxios.get.mock.calls[1]).toEqual([url, {}])
        expect(mockSendDetailRequest).toBeCalledTimes(2)
        expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(2)
        checkModelParents(entry, parents2)

        mockSendDetailRequest.mockRestore()
        mockMapDetailResponseBeforeCache.mockRestore()
      })
    })

    it('should handle error from service', async () => {
      await withMockedAxios(null, async mockedAxios => {
        const mockHandleResponseError = jest.spyOn(TestModel.objects, 'handleResponseError')
        const customError = new Error('Handle error')
        mockedAxios.get.mockRejectedValue(customError)

        expect.assertions(2)
        await expect(TestModel.objects.detail(1)).rejects.toBe(customError)
        expect(mockHandleResponseError).toBeCalledTimes(1)
        mockHandleResponseError.mockRestore()
      })
    })
  })

  /**
   * objects.create()
   */
  describe('create', () => {
    it('should send create request', async () => {
      const responseData = { value: 1, id: 5 }
      await withMockedAxios(responseData, async mockedAxios => {
        const mockSendCreateRequest = jest.spyOn(TestModel.objects, 'sendCreateRequest')
        const mockEmitEvent = jest.spyOn(configHandler, 'emitEvent').mockImplementation()

        const postData = { value: 1 }
        const result = await TestModel.objects.create(postData)

        const url = BASE_URL
        expect(mockedAxios.post.mock.calls).toHaveLength(1)
        expect(mockedAxios.post.mock.calls).toEqual([[url, postData]])
        expect(mockSendCreateRequest).toBeCalledTimes(1)

        expect(result).toBe(responseData)

        expect(mockEmitEvent).toBeCalledTimes(1)
        expect(mockEmitEvent.mock.calls[0]).toEqual(['onSendCreateRequest', [{
          modelManager: TestModel.objects, url, data: postData, params: undefined
        }]])

        mockEmitEvent.mockRestore()
        mockSendCreateRequest.mockRestore()
      }, 'post')
    })

    it('should send create request with parents', async () => {
      const responseData = { value: 1, id: 5 }
      await withMockedAxios(responseData, async mockedAxios => {
        const mockCheckServiceParents = jest.spyOn(ParentTestModel, 'checkServiceParents')
        const mockSendCreateRequest = jest.spyOn(ParentTestModel.objects, 'sendCreateRequest')

        const postData = { value: 1 }
        const parents: ServiceParent = { parent1: 'parent-1', parent2: 8 }
        const result = await ParentTestModel.objects.create(postData, { parents })

        const url = format(PARENT_BASE_URL, parents)
        expect(mockedAxios.post.mock.calls).toHaveLength(1)
        expect(mockedAxios.post.mock.calls).toEqual([[url, postData]])
        expect(mockCheckServiceParents).toBeCalledTimes(1)
        expect(mockSendCreateRequest).toBeCalledTimes(1)

        expect(result).toBe(responseData)
        mockSendCreateRequest.mockRestore()
        mockCheckServiceParents.mockRestore()
      }, 'post')
    })

    it('should handle error from service', async () => {
      await withMockedAxios(null, async mockedAxios => {
        const mockHandleResponseError = jest.spyOn(TestModel.objects, 'handleResponseError')
        const customError = new Error('Handle error')
        mockedAxios.post.mockRejectedValue(customError)

        expect.assertions(2)
        await expect(TestModel.objects.create({ value: 1 })).rejects.toBe(customError)
        expect(mockHandleResponseError).toBeCalledTimes(1)
        mockHandleResponseError.mockRestore()
      }, 'post')
    })
  })

  /**
   * objects.update()
   */
  describe('update', () => {
    it('should send update request', async () => {
      const responseData = { value: 1, id: 5 }
      await withMockedAxios(responseData, async mockedAxios => {
        const mockSendUpdateRequest = jest.spyOn(TestModel.objects, 'sendUpdateRequest')
        const mockEmitEvent = jest.spyOn(configHandler, 'emitEvent').mockImplementation()

        const pk = 1
        const putData = { value: 1 }
        const result = await TestModel.objects.update(1, putData)

        const url = BASE_URL + pk + '/'
        expect(mockedAxios.put.mock.calls).toHaveLength(1)
        expect(mockedAxios.put.mock.calls).toEqual([[url, putData]])
        expect(mockSendUpdateRequest).toBeCalledTimes(1)

        expect(result).toBe(responseData)

        expect(mockEmitEvent).toBeCalledTimes(1)
        expect(mockEmitEvent.mock.calls[0]).toEqual(['onSendUpdateRequest', [{
          modelManager: TestModel.objects, url, pk, data: putData, params: undefined
        }]])

        mockEmitEvent.mockRestore()
        mockSendUpdateRequest.mockRestore()
      }, 'put')
    })

    it('should send update request with parents', async () => {
      const responseData = { value: 1, id: 5 }
      await withMockedAxios(responseData, async mockedAxios => {
        const mockCheckServiceParents = jest.spyOn(ParentTestModel, 'checkServiceParents')
        const mockSendUpdateRequest = jest.spyOn(ParentTestModel.objects, 'sendUpdateRequest')

        const pk = 1
        const putData = { value: 1 }
        const parents: ServiceParent = { parent1: 'parent-1', parent2: 8 }
        const result = await ParentTestModel.objects.update(1, putData, { parents })

        const url = format(PARENT_BASE_URL, parents) + pk + '/'
        expect(mockedAxios.put.mock.calls).toHaveLength(1)
        expect(mockedAxios.put.mock.calls).toEqual([[url, putData]])
        expect(mockCheckServiceParents).toBeCalledTimes(1)
        expect(mockSendUpdateRequest).toBeCalledTimes(1)

        expect(result).toBe(responseData)
        mockSendUpdateRequest.mockRestore()
        mockCheckServiceParents.mockRestore()
      }, 'put')
    })

    it('should send partial update request', async () => {
      const responseData = { value: 1, id: 5 }
      await withMockedAxios(responseData, async mockedAxios => {
        const mockSendPartialUpdateRequest = jest.spyOn(TestModel.objects, 'sendPartialUpdateRequest')
        const mockSendUpdateRequest = jest.spyOn(TestModel.objects, 'sendUpdateRequest')
        const mockEmitEvent = jest.spyOn(configHandler, 'emitEvent').mockImplementation()

        const pk = 1
        const putData = { value: 1 }
        const result = await TestModel.objects.update(1, putData, { partial: true })

        const url = BASE_URL + pk + '/'
        expect(mockedAxios.patch.mock.calls).toHaveLength(1)
        expect(mockedAxios.patch.mock.calls).toEqual([[url, putData]])
        expect(mockSendPartialUpdateRequest).toBeCalledTimes(1)
        expect(mockSendUpdateRequest).not.toBeCalled()

        expect(result).toBe(responseData)

        expect(mockEmitEvent).toBeCalledTimes(1)
        expect(mockEmitEvent.mock.calls[0]).toEqual(['onSendPartialUpdateRequest', [{
          modelManager: TestModel.objects, url, pk, data: putData, params: { partial: true }
        }]])

        mockEmitEvent.mockRestore()
        mockSendPartialUpdateRequest.mockRestore()
        mockSendUpdateRequest.mockRestore()
      }, 'patch')
    })

    it('should handle error from service', async () => {
      await withMockedAxios(null, async mockedAxios => {
        const mockHandleResponseError = jest.spyOn(TestModel.objects, 'handleResponseError')
        const customError = new Error('Handle error')
        mockedAxios.put.mockRejectedValue(customError)

        expect.assertions(2)
        await expect(TestModel.objects.update(1, { value: 1 })).rejects.toBe(customError)
        expect(mockHandleResponseError).toBeCalledTimes(1)
        mockHandleResponseError.mockRestore()
      }, 'put')
    })

    it('should handle error from service on partial update', async () => {
      await withMockedAxios(null, async mockedAxios => {
        const mockHandleResponseError = jest.spyOn(TestModel.objects, 'handleResponseError')
        const customError = new Error('Handle error')
        mockedAxios.patch.mockRejectedValue(customError)

        expect.assertions(2)
        await expect(TestModel.objects.update(1, { value: 1 }, { partial: true })).rejects.toBe(customError)
        expect(mockHandleResponseError).toBeCalledTimes(1)
        mockHandleResponseError.mockRestore()
      }, 'patch')
    })
  })

  /**
   * objects.delete()
   */
  describe('delete', () => {
    it('should send delete request', async () => {
      await withMockedAxios(null, async mockedAxios => {
        const mockSendDeleteRequest = jest.spyOn(TestModel.objects, 'sendDeleteRequest')
        const mockEmitEvent = jest.spyOn(configHandler, 'emitEvent').mockImplementation()

        const pk = 1
        const result = await TestModel.objects.delete(pk)

        const url = BASE_URL + pk + '/'
        expect(mockedAxios.delete.mock.calls).toHaveLength(1)
        expect(mockedAxios.delete.mock.calls).toEqual([[url]])
        expect(mockSendDeleteRequest).toBeCalledTimes(1)

        expect(result).toBeNull()

        expect(mockEmitEvent).toBeCalledTimes(1)
        expect(mockEmitEvent.mock.calls[0]).toEqual(['onSendDeleteRequest', [{
          modelManager: TestModel.objects, url: await TestModel.getDetailUrl(pk), pk, params: undefined
        }]])

        mockEmitEvent.mockRestore()
        mockSendDeleteRequest.mockRestore()
      }, 'delete')
    })

    it('should send delete request with parents', async () => {
      await withMockedAxios(null, async mockedAxios => {
        const mockCheckServiceParents = jest.spyOn(ParentTestModel, 'checkServiceParents')
        const mockSendDeleteRequest = jest.spyOn(ParentTestModel.objects, 'sendDeleteRequest')

        const pk = 1
        const parents: ServiceParent = { parent1: 'parent-1', parent2: 8 }
        const result = await ParentTestModel.objects.delete(pk, { parents })

        const url = format(PARENT_BASE_URL, parents) + pk + '/'
        expect(mockedAxios.delete.mock.calls).toHaveLength(1)
        expect(mockedAxios.delete.mock.calls).toEqual([[url]])
        expect(mockCheckServiceParents).toBeCalledTimes(1)
        expect(mockSendDeleteRequest).toBeCalledTimes(1)

        expect(result).toBeNull()
        mockSendDeleteRequest.mockRestore()
        mockCheckServiceParents.mockRestore()
      }, 'delete')
    })

    it('should handle error from service', async () => {
      await withMockedAxios(null, async mockedAxios => {
        const mockHandleResponseError = jest.spyOn(TestModel.objects, 'handleResponseError')
        const customError = new Error('Handle error')
        mockedAxios.delete.mockRejectedValue(customError)

        expect.assertions(2)
        await expect(TestModel.objects.delete(1)).rejects.toBe(customError)
        expect(mockHandleResponseError).toBeCalledTimes(1)
        mockHandleResponseError.mockRestore()
      }, 'delete')
    })
  })

  /**
   * handleResponseError
   */
  describe('handleResponseError', () => {
    const handleResponseError = async (status: number) => {
      return TestModel.objects.handleResponseError({ response: { status } })
    }
    it('should return BadRequestAPIException', async () => {
      expect(await handleResponseError(400)).toBeInstanceOf(BadRequestAPIException)
    })

    it('should return UnauthorizedAPIException', async () => {
      expect(await handleResponseError(401)).toBeInstanceOf(UnauthorizedAPIException)
    })

    it('should return ForbiddenAPIException', async () => {
      expect(await handleResponseError(403)).toBeInstanceOf(ForbiddenAPIException)
    })

    it('should return NotFoundAPIException', async () => {
      expect(await handleResponseError(404)).toBeInstanceOf(NotFoundAPIException)
    })

    it('should return InternalServerErrorAPIException', async () => {
      expect(await handleResponseError(500)).toBeInstanceOf(InternalServerErrorAPIException)
    })

    it('should return APIException', async () => {
      expect(await handleResponseError(0)).toBeInstanceOf(APIException)
    })

    it('should return other error', async () => {
      const mockEmitEvent = jest.spyOn(configHandler, 'emitEvent').mockImplementation()

      const customError = new Error('Custom error')
      expect(await TestModel.objects.handleResponseError(customError)).toBe(customError)

      expect(mockEmitEvent).toBeCalledTimes(1)
      expect(mockEmitEvent.mock.calls[0]).toEqual(['onResponseError', [{
        modelManager: TestModel.objects, error: customError
      }]])

      mockEmitEvent.mockRestore()
    })
  })
})
