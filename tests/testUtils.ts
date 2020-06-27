import Vue from 'vue'
import { Wrapper } from '@vue/test-utils'
import AsyncComputed from 'vue-async-computed'
import { configHandler } from '@/utils/ConfigHandler'

const waitFunc = (times: number) => {
  return async (wrapper: Wrapper<Vue>) => {
    for (let i = 0; i < times; i++) {
      await wrapper.vm.$nextTick()
    }
  }
}

export const waitRender = {
  DisplayField: waitFunc(4),
  DisplayFieldUpdate: waitFunc(3),
  InputField: waitFunc(4),
  InputFieldUpdate: waitFunc(3),
  FieldLabel: waitFunc(3)
}

export const installAsyncComputed = (localVue: typeof Vue) => {
  localVue.use(AsyncComputed)
  let mockGetConfig: any = null
  beforeAll(() => {
    mockGetConfig = jest.spyOn(configHandler, 'getConfig').mockImplementation(() => ({
      useAsyncComputed: true
    }))
  })

  afterAll(() => {
    if (mockGetConfig) {
      mockGetConfig.mockRestore()
    }
  })
}
