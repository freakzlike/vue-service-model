import { configHandler } from '@/utils/ConfigHandler'
import { Config, getConfig } from '@/config'
import { mergeDeep } from '@/utils/common'

describe('utils/ConfigHandler', () => {
  const withMockedConfig = async (
    config: Config,
    callback: (config: Config) => void
  ) => {
    const newConfig = mergeDeep({}, configHandler.getConfig(), config)
    const mockGetConfig = jest.spyOn(configHandler, 'getConfig').mockImplementation(() => newConfig)

    try {
      await callback(newConfig)
    } finally {
      mockGetConfig.mockRestore()
    }
  }

  describe('getConfig', () => {
    it('should merged config', () => {
      const _config = configHandler.getConfig()

      expect(_config).toHaveProperty('events')
      expect(_config).toHaveProperty('i18n')
      expect(Object.keys(_config.events)).toContain('onSendDetailRequest')
    })
  })

  describe('useAsyncComputed', () => {
    it('should not useAsyncComputed', async () => {
      await withMockedConfig({}, async () => {
        expect(configHandler.useAsyncComputed()).toBe(false)
      })
    })

    it('should useAsyncComputed', async () => {
      await withMockedConfig({
        useAsyncComputed: true
      }, () => {
        expect(configHandler.useAsyncComputed()).toBe(true)
      })
    })
  })

  describe('checkWarningUseAsyncComputed', () => {
    it('should output warning for disabled useAsyncComputed', async () => {
      await withMockedConfig({}, async () => {
        const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation()
        configHandler.checkWarningUseAsyncComputed()
        expect(mockConsoleWarn).toBeCalledTimes(1)
        mockConsoleWarn.mockRestore()
      })
    })

    it('should not output warning disabled useAsyncComputed', async () => {
      await withMockedConfig({
        useAsyncComputed: true
      }, () => {
        const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation()
        configHandler.checkWarningUseAsyncComputed()
        expect(mockConsoleWarn).toBeCalledTimes(0)
        mockConsoleWarn.mockRestore()
      })
    })
  })

  describe('getTranslation', () => {
    it('should get default translation', async () => {
      await withMockedConfig({}, async () => {
        expect(await configHandler.getTranslation('yes')).toBe('Yes')
      })
    })

    it('should get string translation', async () => {
      await withMockedConfig({
        i18n: {
          yes: 'Customized Yes'
        }
      }, async () => {
        expect(await configHandler.getTranslation('yes')).toBe('Customized Yes')
      })
    })

    it('should get lazy callback translation', async () => {
      const resolveTranslation = jest.fn(() => Promise.resolve('Lazy translation'))
      await withMockedConfig({
        i18n: {
          yes: resolveTranslation
        }
      }, async () => {
        expect(await configHandler.getTranslation('yes')).toBe('Lazy translation')
        expect(resolveTranslation).toBeCalledTimes(1)
        expect(resolveTranslation.mock.calls[0]).toEqual(['yes'])
      })
    })

    it('should throw error on unknown translation key', async () => {
      await expect(configHandler.getTranslation('unknown translation key')).rejects.toBeInstanceOf(Error)
    })
  })

  describe('emitEvent', () => {
    it('should emit event', async () => {
      await withMockedConfig({}, async (config: Config) => {
        if (!config.events) throw new Error('Missing events in config')
        const spyEvent = jest.spyOn(config.events, 'onSendDetailRequest').mockImplementation()
        const args = [{ x: 1 }]
        configHandler.emitEvent('onSendDetailRequest', args)

        expect(spyEvent).toBeCalledTimes(1)
        expect(spyEvent.mock.calls[0]).toEqual(args)
        spyEvent.mockRestore()
      })
    })

    it('should throw error on unknown event', () => {
      expect(() => configHandler.emitEvent('unknown event', [])).toThrow(Error)
    })
  })
})
