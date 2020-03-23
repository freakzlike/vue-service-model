import { ServiceStore } from '@/store/ServiceStore'
import { ServiceStoreOptions } from '@/types/store/ServiceStore'

describe('store/ServiceStore', () => {
  class TestServiceStore extends ServiceStore {
    get testGetCachedData () {
      return this._data
    }

    get testGetCachedRequests () {
      return this._requests
    }
  }

  describe('getData', () => {
    it('should request data and use cache', async () => {
      const serviceStore = new TestServiceStore(null)
      const resultData = { x: 1 }
      const options: ServiceStoreOptions = {
        key: 'serviceKey',
        sendRequest: () => Promise.resolve(resultData),
        args: [1, 'test']
      }
      const spySendRequest = jest.spyOn(options, 'sendRequest')

      expect(await serviceStore.getData(options)).toBe(resultData)
      expect(spySendRequest).toBeCalledTimes(1)
      expect(spySendRequest.mock.calls[0]).toEqual([options, 1, 'test'])

      expect(await serviceStore.getData(options)).toBe(resultData)
      expect(spySendRequest).toBeCalledTimes(1)

      expect(serviceStore.testGetCachedData).toHaveProperty(options.key)

      spySendRequest.mockRestore()
    })

    it('should request data and not use cache', async () => {
      const serviceStore = new TestServiceStore(0)
      const resultData = { x: 1 }
      const options: ServiceStoreOptions = {
        key: 'serviceKey',
        sendRequest: () => Promise.resolve(resultData)
      }
      const spySendRequest = jest.spyOn(options, 'sendRequest')

      expect(await serviceStore.getData(options)).toBe(resultData)
      expect(spySendRequest).toBeCalledTimes(1)
      expect(spySendRequest.mock.calls[0]).toEqual([options])

      expect(await serviceStore.getData(options)).toBe(resultData)
      expect(spySendRequest).toBeCalledTimes(2)
      expect(spySendRequest.mock.calls[0]).toEqual([options])

      expect(serviceStore.testGetCachedData).not.toHaveProperty(options.key)

      spySendRequest.mockRestore()
    })

    it('should request data and use expiring cache', async () => {
      const serviceStore = new ServiceStore(5)
      const resultData = { x: 1 }
      const options: ServiceStoreOptions = {
        key: 'serviceKey',
        sendRequest: () => Promise.resolve(resultData)
      }
      const spySendRequest = jest.spyOn(options, 'sendRequest')

      expect(await serviceStore.getData(options)).toBe(resultData)
      expect(spySendRequest).toBeCalledTimes(1)

      expect(await serviceStore.getData(options)).toBe(resultData)
      expect(spySendRequest).toBeCalledTimes(1)

      spySendRequest.mockRestore()
    })

    it('should aggregate running requests', async () => {
      jest.useFakeTimers()
      const serviceStore = new TestServiceStore(0)
      const resultData = { x: 1 }
      const timeouts: number[] = []
      const options: ServiceStoreOptions = {
        key: 'serviceKey',
        sendRequest: () => new Promise(resolve => {
          timeouts.push(setTimeout(() => resolve(resultData), 50000))
        })
      }
      const spySendRequest = jest.spyOn(options, 'sendRequest')

      const promise1 = serviceStore.getData(options)
      expect(promise1).toBeInstanceOf(Promise)
      expect(spySendRequest).toBeCalledTimes(1)
      expect(timeouts).toHaveLength(1)

      const promise2 = serviceStore.getData(options)
      expect(promise2).toBeInstanceOf(Promise)
      expect(spySendRequest).toBeCalledTimes(1)
      expect(timeouts).toHaveLength(1)

      expect(serviceStore.testGetCachedData).not.toHaveProperty(options.key)
      expect(serviceStore.testGetCachedRequests).toHaveProperty(options.key)

      jest.runOnlyPendingTimers()

      expect(await promise1).toBe(resultData)
      expect(await promise2).toBe(resultData)

      spySendRequest.mockRestore()
      timeouts.forEach(timeout => clearTimeout(timeout))
    })

    it('should expire cache and request data', async () => {
      const serviceStore = new ServiceStore(10)
      const resultData = { x: 1 }
      const options: ServiceStoreOptions = {
        key: 'serviceKey',
        sendRequest: () => Promise.resolve(resultData)
      }
      const spySendRequest = jest.spyOn(options, 'sendRequest')
      let spyGetTime = jest.spyOn(Date, 'now').mockImplementation(() => 1000)

      expect(await serviceStore.getData(options)).toBe(resultData)
      expect(spySendRequest).toBeCalledTimes(1)

      expect(await serviceStore.getData(options)).toBe(resultData)
      expect(spySendRequest).toBeCalledTimes(1)

      spyGetTime.mockRestore()
      spyGetTime = jest.spyOn(Date, 'now').mockImplementation(() => 12000)

      expect(await serviceStore.getData(options)).toBe(resultData)
      expect(spySendRequest).toBeCalledTimes(2)

      spySendRequest.mockRestore()
      spyGetTime.mockRestore()
    })

    it('should throw error and clean cached request', async () => {
      const serviceStore = new TestServiceStore(null)
      const customError = new Error('Handle error')
      const options: ServiceStoreOptions = {
        key: 'serviceKey',
        sendRequest: async () => {
          throw customError
        },
        args: [1, 'test']
      }
      const spySendRequest = jest.spyOn(options, 'sendRequest')

      await expect(serviceStore.getData(options)).rejects.toBe(customError)
      expect(spySendRequest).toBeCalledTimes(1)

      expect(serviceStore.testGetCachedData).not.toHaveProperty(options.key)
      expect(serviceStore.testGetCachedRequests).not.toHaveProperty(options.key)

      await expect(serviceStore.getData(options)).rejects.toBe(customError)
      expect(spySendRequest).toBeCalledTimes(2)

      expect(serviceStore.testGetCachedData).not.toHaveProperty(options.key)
      expect(serviceStore.testGetCachedRequests).not.toHaveProperty(options.key)

      spySendRequest.mockRestore()
    })

    it('should not use and set cache with options.noCache', async () => {
      const serviceStore = new TestServiceStore(null)
      let sendRequestCalled = 0
      const options: ServiceStoreOptions = {
        key: 'serviceKey',
        sendRequest: () => {
          sendRequestCalled++
          return Promise.resolve(sendRequestCalled)
        }
      }
      const spySendRequest = jest.spyOn(options, 'sendRequest')

      expect(await serviceStore.getData(options)).toBe(1)
      expect(spySendRequest).toBeCalledTimes(1)

      options.noCache = true
      expect(await serviceStore.getData(options)).toBe(2)
      expect(spySendRequest).toBeCalledTimes(2)

      expect(serviceStore.testGetCachedData).toHaveProperty(options.key)
      expect(serviceStore.testGetCachedData[options.key].data).toBe(1)

      spySendRequest.mockRestore()
    })

    it('should ignore cache and refresh it with options.refreshCache', async () => {
      const serviceStore = new TestServiceStore(null)
      let sendRequestCalled = 0
      const options: ServiceStoreOptions = {
        key: 'serviceKey',
        sendRequest: () => {
          sendRequestCalled++
          return Promise.resolve(sendRequestCalled)
        }
      }
      const spySendRequest = jest.spyOn(options, 'sendRequest')

      expect(await serviceStore.getData(options)).toBe(1)
      expect(spySendRequest).toBeCalledTimes(1)

      options.refreshCache = true
      expect(await serviceStore.getData(options)).toBe(2)
      expect(spySendRequest).toBeCalledTimes(2)

      expect(serviceStore.testGetCachedData).toHaveProperty(options.key)
      expect(serviceStore.testGetCachedData[options.key].data).toBe(2)

      spySendRequest.mockRestore()
    })

    it('should not aggregate running requests with options.noRequestAggregation', async () => {
      jest.useFakeTimers()
      const serviceStore = new TestServiceStore(0)
      const timeouts: number[] = []
      const options: ServiceStoreOptions = {
        key: 'serviceKey',
        sendRequest: () => new Promise(resolve => {
          const result = timeouts.length + 1
          timeouts.push(setTimeout(() => resolve(result), 50000))
        })
      }
      const spySendRequest = jest.spyOn(options, 'sendRequest')

      const promise1 = serviceStore.getData(options)
      expect(promise1).toBeInstanceOf(Promise)
      expect(spySendRequest).toBeCalledTimes(1)
      expect(serviceStore.testGetCachedRequests).toHaveProperty(options.key)
      expect(timeouts).toHaveLength(1)

      options.noRequestAggregation = true
      const promise2 = serviceStore.getData(options)
      expect(promise2).toBeInstanceOf(Promise)
      expect(spySendRequest).toBeCalledTimes(2)
      expect(timeouts).toHaveLength(2)

      expect(serviceStore.testGetCachedData).not.toHaveProperty(options.key)

      jest.runOnlyPendingTimers()

      expect(await promise1).toBe(1)
      expect(await promise2).toBe(2)

      spySendRequest.mockRestore()
      timeouts.forEach(timeout => clearTimeout(timeout))
    })
  })

  describe('clean', () => {
    it('should clean expired keys', async () => {
      const serviceStore = new TestServiceStore(10)
      const sendRequest = () => Promise.resolve(0)

      let spyGetTime = jest.spyOn(Date, 'now').mockImplementation(() => 1000)

      await serviceStore.getData({ key: 'key1', sendRequest })
      await serviceStore.getData({ key: 'key2', sendRequest })

      spyGetTime.mockRestore()
      spyGetTime = jest.spyOn(Date, 'now').mockImplementation(() => 9000)
      await serviceStore.getData({ key: 'key3', sendRequest })

      spyGetTime.mockRestore()
      spyGetTime = jest.spyOn(Date, 'now').mockImplementation(() => 12000)

      const stateData = serviceStore.testGetCachedData
      expect(Object.keys(stateData)).toHaveLength(3)
      expect(Object.keys(stateData).sort()).toEqual(['key1', 'key2', 'key3'].sort())

      serviceStore.clean()

      expect(Object.keys(stateData)).toHaveLength(1)
      expect(Object.keys(stateData)).toEqual(['key3'])

      spyGetTime.mockRestore()
    })
  })

  describe('clear', () => {
    it('should clear complete cache', async () => {
      const serviceStore = new TestServiceStore(null)
      const timeouts: number[] = []

      await serviceStore.getData({
        key: 'key1', sendRequest: () => Promise.resolve(0)
      })
      serviceStore.getData({
        key: 'key2',
        sendRequest: () => new Promise(resolve => {
          timeouts.push(setTimeout(() => resolve(0), 50000))
        })
      })

      expect(timeouts).toHaveLength(1)

      expect(Object.keys(serviceStore.testGetCachedData)).toHaveLength(1)
      expect(Object.keys(serviceStore.testGetCachedRequests)).toHaveLength(1)

      serviceStore.clear()

      expect(Object.keys(serviceStore.testGetCachedData)).toHaveLength(0)
      expect(Object.keys(serviceStore.testGetCachedRequests)).toHaveLength(0)

      jest.runOnlyPendingTimers()
      timeouts.forEach(timeout => clearTimeout(timeout))
    })
  })
})
