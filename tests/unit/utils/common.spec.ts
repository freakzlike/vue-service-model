import cu from '@/utils/common'

describe('utils/common.js', () => {
  /**
   * isObject
   */
  describe('isObject', () => {
    it('should be object', () => {
      expect(cu.isObject({})).toBe(true)
      expect(cu.isObject({ a: 1 })).toBe(true)
      expect(cu.isObject([], true)).toBe(true)
      expect(cu.isObject([1, 2], true)).toBe(true)
    })

    it('should not be an object', () => {
      expect(cu.isObject(1)).toBe(false)
      expect(cu.isObject('1')).toBe(false)
      expect(cu.isObject(true)).toBe(false)
      expect(cu.isObject(false)).toBe(false)
      expect(cu.isObject([], false)).toBe(false)
      expect(cu.isObject([1, 2], false)).toBe(false)
    })
  })

  /**
   * isNull
   */
  describe('isNull', () => {
    it('should be null', () => {
      expect(cu.isNull(null)).toBe(true)
      expect(cu.isNull(undefined)).toBe(true)
    })

    it('should not be null', () => {
      expect(cu.isNull(0)).toBe(false)
      expect(cu.isNull('')).toBe(false)
      expect(cu.isNull({})).toBe(false)
      expect(cu.isNull(1)).toBe(false)
      expect(cu.isNull('1')).toBe(false)
      expect(cu.isNull(true)).toBe(false)
      expect(cu.isNull(false)).toBe(false)
      expect(cu.isNull([])).toBe(false)
      expect(cu.isNull([1, 2])).toBe(false)
    })
  })

  /**
   * clone
   */
  describe('clone', () => {
    it('should clone deep object', () => {
      const oldObj = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4]
        }
      }

      const newObj = cu.clone(oldObj)

      expect(oldObj).toEqual(newObj)
      expect(cu.deepCompare(oldObj, newObj)).toBe(true)

      expect(oldObj.a).toEqual(newObj.a)
      expect(oldObj.b).not.toBe(newObj.b)
      expect(oldObj.b.c).toEqual(newObj.b.c)
      expect(oldObj.b.d).not.toBe(newObj.b.d)
    })

    it('should clone null value', () => {
      expect(cu.clone(null)).toEqual(null)
    })

    it('should clone primitive value', () => {
      expect(cu.clone('value1')).toEqual('value1')
    })

    it('should clone array', () => {
      const oldArray = [1, 2, { a: 3 }]
      const newArray = cu.clone(oldArray)

      expect(oldArray).not.toBe(newArray)
      expect(oldArray).toEqual(newArray)
      expect(cu.deepCompare(oldArray, newArray)).toBe(true)

      expect(oldArray[2]).not.toBe(newArray[2])
    })
  })

  /**
   * mergeDeep
   */
  describe('mergeDeep', () => {
    it('should deep merge one object', () => {
      const obj = {
        a: 7,
        b: 8,
        d: {
          e: [9, 10],
          f: {
            h: 11
          },
          i: 12
        }
      }
      const objSave = cu.clone(obj)
      expect(objSave).not.toBe(obj)
      expect(objSave).toEqual(obj)

      const targetObj = {
        a: 1,
        c: 2,
        d: {
          e: [3, 4],
          f: {
            g: 5
          },
          i: {
            j: 6
          }
        }
      }
      const resultObj = cu.mergeDeep(targetObj, obj)

      expect(targetObj).toBe(resultObj)
      expect(resultObj).toEqual({
        a: 7,
        b: 8,
        c: 2,
        d: {
          e: [9, 10],
          f: {
            g: 5,
            h: 11
          },
          i: 12
        }
      })

      expect(objSave).toEqual(obj)
    })

    it('should deep merge two objects', () => {
      const obj1 = {
        a: 1,
        c: 2,
        d: {
          e: [3, 4],
          f: {
            g: 5
          },
          i: {
            j: 6
          }
        }
      }
      const obj1Save = cu.clone(obj1)
      expect(obj1Save).not.toBe(obj1)
      expect(obj1Save).toEqual(obj1)

      const obj2 = {
        a: 7,
        b: 8,
        d: {
          e: [9, 10],
          f: {
            h: 11
          },
          i: 12
        }
      }

      const obj2Save = cu.clone(obj2)
      expect(obj2Save).not.toBe(obj2)
      expect(obj2Save).toEqual(obj2)

      const targetObj = {}
      const resultObj = cu.mergeDeep(targetObj, obj1, obj2)

      expect(targetObj).toBe(resultObj)
      expect(resultObj).toEqual({
        a: 7,
        b: 8,
        c: 2,
        d: {
          e: [9, 10],
          f: {
            g: 5,
            h: 11
          },
          i: 12
        }
      })

      expect(obj1Save).toEqual(obj1)
      expect(obj2Save).toEqual(obj2)
    })

    it('should deep merge multiple object', () => {
      const targetObj = {
        a: 1,
        c: 2,
        d: {
          e: 3
        }
      }

      const obj1 = {
        a: 4,
        b: 5,
        d: {
          f: 6
        }
      }
      const obj1Save = cu.clone(obj1)
      expect(obj1Save).not.toBe(obj1)
      expect(obj1Save).toEqual(obj1)

      const obj2 = {
        a: 7,
        c: 8,
        d: {
          e: 9
        }
      }
      const obj2Save = cu.clone(obj2)
      expect(obj2Save).not.toBe(obj2)
      expect(obj2Save).toEqual(obj2)

      const obj3 = {
        b: 10,
        d: {
          f: 11,
          g: 12
        }
      }
      const obj3Save = cu.clone(obj3)
      expect(obj3Save).not.toBe(obj3)
      expect(obj3Save).toEqual(obj3)

      const resultObj = cu.mergeDeep(targetObj, obj1, obj2, obj3)

      expect(targetObj).toBe(resultObj)
      expect(resultObj).toEqual({
        a: 7,
        b: 10,
        c: 8,
        d: {
          e: 9,
          f: 11,
          g: 12
        }
      })

      expect(obj1Save).toEqual(obj1)
      expect(obj2Save).toEqual(obj2)
      expect(obj3Save).toEqual(obj3)
    })
  })

  /**
   * deepCompare
   */
  describe('deepCompare', () => {
    it('should be equal', () => {
      expect(cu.deepCompare(1, 1)).toBe(true)
      expect(cu.deepCompare('1', '1')).toBe(true)
      expect(cu.deepCompare(true, true)).toBe(true)
      expect(cu.deepCompare(false, false)).toBe(true)
      expect(cu.deepCompare({}, {})).toBe(true)
      expect(cu.deepCompare([], [])).toBe(true)
      expect(cu.deepCompare({ a: 1 }, { a: 1 })).toBe(true)
      expect(cu.deepCompare({ a: '1' }, { a: '1' })).toBe(true)
      expect(cu.deepCompare({ a: '1', b: 2 }, { a: '1', b: 2 })).toBe(true)
      expect(cu.deepCompare({ a: '1', b: [] }, { a: '1', b: [] })).toBe(true)
      expect(cu.deepCompare({ a: '1', b: [1, 2] }, { a: '1', b: [1, 2] })).toBe(true)
      expect(cu.deepCompare([1], [1])).toBe(true)
      expect(cu.deepCompare([1, 1], [1, 1])).toBe(true)
      expect(cu.deepCompare([1, '1'], [1, '1'])).toBe(true)
      expect(cu.deepCompare(['1', 1], ['1', 1])).toBe(true)
      expect(cu.deepCompare([{}], [{}])).toBe(true)
      expect(cu.deepCompare([{ a: 1 }], [{ a: 1 }])).toBe(true)
      expect(cu.deepCompare({
        method () {
        }
      }, {
        method () {
        }
      })).toBe(true)
    })

    it('should not be equal', () => {
      expect(cu.deepCompare(1, 2)).toBe(false)
      expect(cu.deepCompare(1, null)).toBe(false)
      expect(cu.deepCompare('1', '2')).toBe(false)
      expect(cu.deepCompare({}, { a: 1 })).toBe(false)
      expect(cu.deepCompare({ a: 1 }, {})).toBe(false)
      expect(cu.deepCompare({ a: 1 }, { a: 2 })).toBe(false)
      expect(cu.deepCompare({ a: 2 }, { a: 1 })).toBe(false)
      expect(cu.deepCompare({ a: 2 }, { b: 2 })).toBe(false)
      expect(cu.deepCompare({ a: { b: 1 } }, { a: { c: 1 } })).toBe(false)
      expect(cu.deepCompare([], [1])).toBe(false)
      expect(cu.deepCompare([1], [])).toBe(false)
      expect(cu.deepCompare([], ['1'])).toBe(false)
      expect(cu.deepCompare(['1'], [])).toBe(false)
      expect(cu.deepCompare(1, {})).toBe(false)
      expect(cu.deepCompare({}, 1)).toBe(false)
      expect(cu.deepCompare(1, { a: 1 })).toBe(false)
      expect(cu.deepCompare({ a: 1 }, 1)).toBe(false)
      expect(cu.deepCompare({}, [])).toBe(false)
      expect(cu.deepCompare([], {})).toBe(false)
      expect(cu.deepCompare({ a: 1 }, [1])).toBe(false)
      expect(cu.deepCompare([1], { a: 1 })).toBe(false)
      expect(cu.deepCompare({
        method: function x () {
        }
      }, {
        method: function y () {
        }
      })).toBe(false)
    })
  })

  /**
   * eval
   */
  describe('eval', () => {
    it('should eval non-functions', () => {
      expect(cu.eval(null, null, 1, 2)).toBe(null)
      expect(cu.eval(undefined, null, 't')).toBe(undefined)
      expect(cu.eval(0)).toBe(0)
      expect(cu.eval('Text', null)).toBe('Text')
      const obj = { a: 1 }
      expect(cu.eval(obj)).toBe(obj)
      const list = [1, 2]
      expect(cu.eval(list, null, 1, 2)).toBe(list)
    })

    it('should eval function', () => {
      const func = (...args: Array<any>) => args

      expect(cu.eval(func)).toEqual([])
      expect(cu.eval(func, null)).toEqual([])
      expect(cu.eval(func, null, 1, 2)).toEqual([1, 2])
      expect(cu.eval(func, null, 1, null, 3, 4, 5, 6)).toEqual([1, null, 3, 4, 5, 6])
    })

    it('should eval function context', () => {
      const expectedContext = {}

      function funcWithContext (this: any, ...args: Array<any>) {
        expect(this).toBe(expectedContext)
        return args
      }

      function funcNoContext (this: any, ...args: Array<any>) {
        expect(this).toBeUndefined()
        return args
      }

      expect(cu.eval(funcWithContext, expectedContext)).toEqual([])
      expect(cu.eval(funcNoContext)).toEqual([])
    })
  })

  /**
   * promiseEval
   */
  describe('promiseEval', () => {
    it('should eval non-functions', async () => {
      expect(await cu.promiseEval(null, null, 1, 2)).toBe(null)
      expect(await cu.promiseEval(undefined, 't')).toBe(undefined)
      expect(await cu.promiseEval(0)).toBe(0)
      expect(await cu.promiseEval('Text', null)).toBe('Text')
      const obj = { a: 1 }
      expect(await cu.promiseEval(obj)).toBe(obj)
      const list = [1, 2]
      expect(await cu.promiseEval(list, 1, 2)).toBe(list)

      expect(await cu.promiseEval(new Promise(resolve => resolve(0)), 1, 2)).toBe(0)
    })

    it('should eval function', async () => {
      let expectedContext: {} | null | undefined

      function func (this: any, ...args: Array<any>) {
        expect(this).toBe(expectedContext)
        return args
      }

      function promiseFunc (this: any, ...args: Array<any>) {
        expect(this).toBe(expectedContext)
        return new Promise(resolve => resolve(args))
      }

      expect(await cu.promiseEval(func)).toEqual([])
      expectedContext = null
      expect(await cu.promiseEval(func, null)).toEqual([])
      expect(await cu.promiseEval(func, null, 1, 2)).toEqual([1, 2])
      expectedContext = {}
      expect(await cu.promiseEval(func, expectedContext, 1, null, 3, 4, 5, 6)).toEqual([1, null, 3, 4, 5, 6])

      expectedContext = undefined
      expect(await cu.promiseEval(promiseFunc)).toEqual([])
      expectedContext = {}
      expect(await cu.promiseEval(promiseFunc, expectedContext)).toEqual([])
      expect(await cu.promiseEval(promiseFunc, expectedContext, 1, null, 3, 4)).toEqual([1, null, 3, 4])
    })
  })

  /**
   * format
   */
  describe('format', () => {
    it('should format string', async () => {
      expect(cu.format('Test string {value}', { value: 5 })).toBe('Test string 5')
      expect(cu.format('Test {value1} string {value2}', {
        value1: 1,
        value2: 'string value'
      })).toBe('Test 1 string string value')

      expect(cu.format('Test {value1} string {value2} {value1}', {
        value1: 1
      })).toBe('Test 1 string {value2} 1')
    })
  })
})
