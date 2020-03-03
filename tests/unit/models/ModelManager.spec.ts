import cu from '@/utils/common'
import axios from 'axios'
import { ServiceModel, ServiceParent } from '@/models/ServiceModel'
import Dictionary from '@/types/Dictionary'

jest.mock('axios')

describe('models/ModelManager', () => {
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
   * objects.list()
   */
  describe('list', () => {
    it('should request all', async () => {
      const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
      await withMockedAxios(responseData, async mockedAxios => {
        const mockSendListRequest = jest.spyOn(TestModel.objects, 'sendListRequest')
        const mockMapListResponseBeforeCache = jest.spyOn(TestModel.objects, 'mapListResponseBeforeCache')

        const resultData = await TestModel.objects.list()
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[BASE_URL, {}]])

        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        checkListResponseData(responseData, resultData, TestModel)
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

    it('should request filter list with parents', async () => {
      const responseData = [{ text: 'Entry 1' }, { text: 'Entry 2' }]
      await withMockedAxios(responseData, async mockedAxios => {
        const mockCheckServiceParents = jest.spyOn(ParentTestModel, 'checkServiceParents')
        const mockSendListRequest = jest.spyOn(ParentTestModel.objects, 'sendListRequest')
        const mockMapListResponseBeforeCache = jest.spyOn(ParentTestModel.objects, 'mapListResponseBeforeCache')

        const filterParams = { name: 'text' }

        const parents: ServiceParent = { parent1: 'parent-1', parent2: 8 }
        const resultData = await ParentTestModel.objects.list({ parents, filter: filterParams })

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

        await CachedTestModel.objects.list({ parents: parents1, filter: filter1 })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls[0]).toEqual([cu.format(CACHED_TEST_MODEL_URL, parents1), { params: filter1 }])
        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        // Check if cached
        await CachedTestModel.objects.list({ parents: parents1, filter: filter1 })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockSendListRequest).toBeCalledTimes(1)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(1)

        // Check with other filter
        await CachedTestModel.objects.list({ parents: parents1, filter: filter2 })
        expect(mockedAxios.get.mock.calls).toHaveLength(2)
        expect(mockedAxios.get.mock.calls[1]).toEqual([cu.format(CACHED_TEST_MODEL_URL, parents1), { params: filter2 }])
        expect(mockSendListRequest).toBeCalledTimes(2)
        expect(mockMapListResponseBeforeCache).toBeCalledTimes(2)

        // Check with other parent
        await CachedTestModel.objects.list({ parents: parents2, filter: filter1 })
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
   * objects.detail()
   */
  describe('detail', () => {
    it('should request detail', async () => {
      const responseData = { text: 'Entry 1' }
      await withMockedAxios(responseData, async mockedAxios => {
        const mockSendDetailRequest = jest.spyOn(TestModel.objects, 'sendDetailRequest')
        const mockMapDetailResponseBeforeCache = jest.spyOn(TestModel.objects, 'mapDetailResponseBeforeCache')

        const pk = 1
        const entry = await TestModel.objects.detail(pk)

        const url = BASE_URL + pk + '/'
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[url, {}]])
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
        const entry = await ParentTestModel.objects.detail(pk, { parents })

        const url = cu.format(PARENT_BASE_URL, parents) + pk + '/'
        expect(mockCheckServiceParents).toBeCalledTimes(2)
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockedAxios.get.mock.calls).toEqual([[url, {}]])
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
        await CachedTestModel.objects.detail(pk, { parents: parents1 })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        let url = cu.format(CACHED_TEST_MODEL_URL, parents1) + pk.toString() + '/'
        expect(mockedAxios.get.mock.calls[0]).toEqual([url, {}])
        expect(mockSendDetailRequest).toBeCalledTimes(1)
        expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)

        // Check if cached
        await CachedTestModel.objects.detail(pk, { parents: parents1 })
        expect(mockedAxios.get.mock.calls).toHaveLength(1)
        expect(mockSendDetailRequest).toBeCalledTimes(1)
        expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(1)

        // Check with other parent
        await CachedTestModel.objects.detail(pk, { parents: parents2 })
        expect(mockedAxios.get.mock.calls).toHaveLength(2)
        url = cu.format(CACHED_TEST_MODEL_URL, parents2) + pk.toString() + '/'
        expect(mockedAxios.get.mock.calls[1]).toEqual([url, {}])
        expect(mockSendDetailRequest).toBeCalledTimes(2)
        expect(mockMapDetailResponseBeforeCache).toBeCalledTimes(2)

        mockSendDetailRequest.mockRestore()
        mockMapDetailResponseBeforeCache.mockRestore()
      })
    })
  })
})
