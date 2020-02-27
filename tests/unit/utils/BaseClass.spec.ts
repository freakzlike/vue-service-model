import { BaseClass } from '@/utils/BaseClass'

describe('utils/BaseClass', () => {
  describe('cls', () => {
    it('should return class on static', () => {
      expect(BaseClass.cls).toBe(BaseClass)
    })

    it('should return class on object', () => {
      const obj = new BaseClass()
      expect(obj.cls).toBe(obj.constructor)
    })
  })
})
