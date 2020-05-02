import { getConfig, Config } from '../config'
import cu from '../utils/common'

const defaultConfig: Config = {
  events: {
    onSendDetailRequest: () => {},
    onSendListRequest: () => {},
    onSendCreateRequest: () => {},
    onSendUpdateRequest: () => {},
    onSendPartialUpdateRequest: () => {},
    onSendDeleteRequest: () => {},
    onResponseError: () => {}
  }
}

export const configHandler = {
  defaultConfig,

  getConfig () {
    return cu.mergeDeep({}, defaultConfig, getConfig())
  },

  emitEvent (event: string, args: any[]) {
    const _config = this.getConfig()
    if (!_config.events[event]) {
      throw new Error('Try to emit unknown event: ' + event)
    }

    _config.events[event](...args)
  }
}
