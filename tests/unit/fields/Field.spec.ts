import { Field as jsField } from 'js-service-model'
import { Field } from '@/fields/Field'
import BaseDisplayFieldRender from '@/components/BaseDisplayFieldRender'

describe('fields/Field', () => {
  describe('class', () => {
    it('should correct inherit from js-service-model/Field and FieldMixin', () => {
      const field = new Field()
      expect(field).toBeInstanceOf(jsField)
      expect(field).toHaveProperty('displayComponent')
      expect(field).toHaveProperty('displayRender')
    })
  })

  describe('displayComponent', () => {
    it('should return BaseDisplayFieldRender', async () => {
      const field = new Field()
      const displayComponent = await field.displayComponent
      expect(displayComponent.default).toBe(BaseDisplayFieldRender)
    })
  })
})
