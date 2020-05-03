import { setConfig, getConfig } from '@/config'

describe('config', () => {
  it('should set and return config', () => {
    const oldCfg = getConfig()
    expect(oldCfg).toEqual({})

    const newCfg = { events: {} }
    setConfig(newCfg)

    const cfg = getConfig()
    expect(cfg).toEqual(newCfg)
    expect(oldCfg).toEqual(cfg)
  })
})
