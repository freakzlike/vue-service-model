import { BaseModel } from '@/models/BaseModel'
import { CharField } from '@/fields/CharField'
import { FormatStringField } from '@/fields/FormatStringField'

describe('fields/CharField', () => {
  class TestModel extends BaseModel {
    static fieldsDef = {
      description: new CharField()
    }
  }

  describe('constructor', () => {
    it('should inherit from FormatStringField', async () => {
      const model = new TestModel({})
      const field = model.getField('description')

      expect(field).toBeInstanceOf(FormatStringField)
    })
  })
})
