import Vue, { nextTick } from 'vue'
import { configHandler } from '@/utils/ConfigHandler'

const waitFunc = (times: number) => {
  return async () => {
    for (let i = 0; i < times; i++) {
      await nextTick()
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
  // TODO
  // localVue.use(AsyncComputed)
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
