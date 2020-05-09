import Vue, { Wrapper } from '@vue/test-utils'

const waitFunc = (times: number) => {
  return async (wrapper: Wrapper<Vue>) => {
    for (let i = 0; i < times; i++) {
      await wrapper.vm.$nextTick()
    }
  }
}

export const waitRender = {
  InputField: waitFunc(3),
  InputFieldUpdate: waitFunc(2)
}
