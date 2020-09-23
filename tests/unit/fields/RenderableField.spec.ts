import { RenderableField } from '@/fields/RenderableField'
import { BaseModel } from '@/models/BaseModel'
import { InputProps } from '@/types/fields/Field'
import BaseDisplayFieldRender from '@/components/BaseDisplayFieldRender'
import BaseInputFieldRender from '@/components/BaseInputFieldRender'

describe('fields/RenderableField', () => {
  class TestModel extends BaseModel {
  }

  const model = new TestModel()

  describe('prepareDisplayRender', () => {
    it('should return renderData', async () => {
      const data = { description: 'desc value' }
      const model = new TestModel(data)

      const field = new RenderableField({}, { name: 'description', model })
      const renderData = await field.prepareDisplayRender()
      expect(renderData).toBe(data.description)
    })
  })

  describe('displayComponent', () => {
    it('should return BaseDisplayFieldRender', async () => {
      const field = new RenderableField()
      const displayComponent = await field.displayComponent
      expect(displayComponent.default).toBe(BaseDisplayFieldRender)
    })
  })

  describe('prepareInputRender', () => {
    it('should return renderData', async () => {
      const data = { description: 'desc value' }
      const model = new TestModel(data)
      const inputProps: InputProps = { disabled: false, readonly: true }

      const field = new RenderableField({}, { name: 'description', model })
      const renderData = await field.prepareInputRender(inputProps)
      expect(renderData).toEqual({
        value: data.description,
        inputProps
      })
    })
  })

  describe('inputComponent', () => {
    it('should return BaseInputFieldRender', async () => {
      const field = new RenderableField()
      const inputComponent = await field.inputComponent
      expect(inputComponent.default).toBe(BaseInputFieldRender)
    })
  })
})
