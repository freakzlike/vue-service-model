import { CharField } from '@/fields/CharField'
import { FormatStringField } from '@/fields/FormatStringField'

describe('fields/CharField', () => {
  const field = new CharField()

  describe('constructor', () => {
    it('should inherit from FormatStringField', async () => {
      expect(field).toBeInstanceOf(FormatStringField)
    })
  })

  describe('valueParser', () => {
    it('should return string value', async () => {
      expect(await field.valueParser('string')).toBe('string')
      expect(await field.valueParser(true)).toBe('true')
      expect(await field.valueParser(false)).toBe('false')
      expect(await field.valueParser(0)).toBe('0')
    })

    it('should return null', async () => {
      expect(await field.valueParser('')).toBe(null)
      expect(await field.valueParser(null)).toBe(null)
      expect(await field.valueParser(undefined)).toBe(null)
    })
  })
})
