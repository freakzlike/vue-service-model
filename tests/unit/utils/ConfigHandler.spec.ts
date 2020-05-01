import { configHandler } from '@/utils/ConfigHandler'

describe('utils/ConfigHandler', () => {
  describe('getConfig', () => {
    it('should merged config', () => {
      const _config = configHandler.getConfig()

      expect(_config).toHaveProperty('events')
      expect(Object.keys(_config.events)).toContain('onSendDetailRequest')
    })
  })

  describe('emitEvent', () => {
    it('should emit event', () => {
      const _config = configHandler.getConfig()
      const mockGetConfig = jest.spyOn(configHandler, 'getConfig').mockImplementation(() => _config)
      const spyEvent = jest.spyOn(_config.events, 'onSendDetailRequest').mockImplementation()
      const args = [{x: 1}]

      configHandler.emitEvent('onSendDetailRequest', args)

      expect(spyEvent).toBeCalledTimes(1)
      expect(spyEvent.mock.calls[0]).toEqual(args)

      mockGetConfig.mockRestore()
      spyEvent.mockRestore()
    })

    it('should throw error on unknown event', () => {
      expect(() => configHandler.emitEvent('unknown event', [])).toThrow(Error)
    })
  })
})
