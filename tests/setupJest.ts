import { createApp } from 'vue'

expect.extend({
  toUseReactivity: async (received, computed, times = 1) => {
    const watchCaller = jest.fn(() => {
    })
    const vm = createApp({
      created () {
        this.$watch(computed, watchCaller)
      }
    })

    await Promise.resolve(received())

    // TODO vm.$destroy

    const calledTimes = watchCaller.mock.calls.length
    if (calledTimes === times) {
      return {
        pass: true,
        message: () => `Expected to be reactive ${times} times`
      }
    } else {
      return {
        pass: false,
        message: () => `Expected to be reactive ${times} times but was ${calledTimes} times`
      }
    }
  }
})
