import { BaseClass } from '@/models/BaseClass'

describe('models/BaseClass', () => {
  describe('cls', () => {
    it('should return class on static', () => {
      expect(BaseClass.cls).toBe(BaseClass.constructor)
    })

    it('should return class on object', () => {
      const obj = new BaseClass()
      expect(obj.cls).toBe(obj.constructor)
    })
  })
})
