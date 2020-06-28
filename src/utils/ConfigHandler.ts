import { getConfig, Config } from '../config'
import cu from '../utils/common'

const defaultConfig: Config = {
  useAsyncComputed: false,
  i18n: {
    no: 'No',
    yes: 'Yes'
  },
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

  /**
   * Return flag whether asyncComputed package should be used
   */
  useAsyncComputed (): boolean {
    const _config = this.getConfig()
    return Boolean(_config.useAsyncComputed)
  },

  /**
   * Check whether useAsyncComputed should be true and output warning if not
   */
  checkWarningUseAsyncComputed (): void {
    if (!configHandler.useAsyncComputed()) {
      console.warn('[vue-service-model] asyncComputed has been called, but useAsyncComputed config is false.')
    }
  },

  /**
   * Get translation for given key
   */
  async getTranslation (key: string): Promise<string> {
    const _config = this.getConfig()
    if (!_config.i18n[key]) {
      throw new Error('Try to get unknown translation key: ' + key)
    }

    return cu.promiseEval(_config.i18n[key], null, key)
  },

  /**
   * Emit event
   */
  emitEvent (event: string, args: any[]) {
    const _config = this.getConfig()
    if (!_config.events[event]) {
      throw new Error('Try to emit unknown event: ' + event)
    }

    _config.events[event](...args)
  }
}
