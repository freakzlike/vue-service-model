import { BaseModel } from '@/models/BaseModel'
import { FormatStringField } from '@/fields/FormatStringField'

describe('fields/FormatStringField', () => {
  class TestModel extends BaseModel {
    static fieldsDef = {
      description: new FormatStringField()
    }
  }

  describe('prepareDisplayRender', () => {
    it('should call valueFormatter', async () => {
      const data = { description: 'desc value' }
      const model = new TestModel(data)
      const field = model.getField('description') as FormatStringField

      const mockValueFormatter = jest.spyOn(field, 'valueFormatter').mockImplementation(async () => data.description)

      expect(await field.prepareDisplayRender()).toBe(data.description)

      expect(mockValueFormatter).toBeCalledTimes(1)
      expect(mockValueFormatter.mock.calls[0]).toEqual([])
      mockValueFormatter.mockRestore()
    })
  })

  describe('valueFormatter', () => {
    it('should return string value', async () => {
      const data = { description: 'desc value' } as { description: any }
      const model = new TestModel(data)
      const field = model.getField('description') as FormatStringField

      expect(await field.valueFormatter()).toBe(data.description)

      data.description = 54.3
      expect(await field.valueFormatter()).toBe('54.3')

      data.description = 0
      expect(await field.valueFormatter()).toBe('0')

      data.description = false
      expect(await field.valueFormatter()).toBe('false')

      data.description = [1, 2]
      expect(await field.valueFormatter()).toBe('1,2')
    })

    it('should return null', async () => {
      const data = { description: null } as { description: any }
      const model = new TestModel(data)
      const field = model.getField('description') as FormatStringField

      data.description = null
      expect(await field.valueFormatter()).toBeNull()

      data.description = undefined
      expect(await field.valueFormatter()).toBeNull()
    })
  })
})
