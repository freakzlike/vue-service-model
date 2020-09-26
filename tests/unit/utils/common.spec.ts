import { isObject, isNull, clone, mergeDeep, deepCompare, format, funcEval, promiseEval } from '@/utils/common'

describe('utils/common.js', () => {
  /**
   * isObject
   */
  describe('isObject', () => {
    it('should be object', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
      expect(isObject([], true)).toBe(true)
      expect(isObject([1, 2], true)).toBe(true)
    })

    it('should not be an object', () => {
      expect(isObject(1)).toBe(false)
      expect(isObject('1')).toBe(false)
      expect(isObject(true)).toBe(false)
      expect(isObject(false)).toBe(false)
      expect(isObject([], false)).toBe(false)
      expect(isObject([1, 2], false)).toBe(false)
    })
  })

  /**
   * isNull
   */
  describe('isNull', () => {
    it('should be null', () => {
      expect(isNull(null)).toBe(true)
      expect(isNull(undefined)).toBe(true)
    })

    it('should not be null', () => {
      expect(isNull(0)).toBe(false)
      expect(isNull('')).toBe(false)
      expect(isNull({})).toBe(false)
      expect(isNull(1)).toBe(false)
      expect(isNull('1')).toBe(false)
      expect(isNull(true)).toBe(false)
      expect(isNull(false)).toBe(false)
      expect(isNull([])).toBe(false)
      expect(isNull([1, 2])).toBe(false)
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

      const newObj = clone(oldObj)

      expect(oldObj).toEqual(newObj)
      expect(deepCompare(oldObj, newObj)).toBe(true)

      expect(oldObj.a).toEqual(newObj.a)
      expect(oldObj.b).not.toBe(newObj.b)
      expect(oldObj.b.c).toEqual(newObj.b.c)
      expect(oldObj.b.d).not.toBe(newObj.b.d)
    })

    it('should clone null value', () => {
      expect(clone(null)).toEqual(null)
    })

    it('should clone primitive value', () => {
      expect(clone('value1')).toEqual('value1')
    })

    it('should clone array', () => {
      const oldArray = [1, 2, { a: 3 }]
      const newArray = clone(oldArray)

      expect(oldArray).not.toBe(newArray)
      expect(oldArray).toEqual(newArray)
      expect(deepCompare(oldArray, newArray)).toBe(true)

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
      const objSave = clone(obj)
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
      const resultObj = mergeDeep(targetObj, obj)

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
      const obj1Save = clone(obj1)
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

      const obj2Save = clone(obj2)
      expect(obj2Save).not.toBe(obj2)
      expect(obj2Save).toEqual(obj2)

      const targetObj = {}
      const resultObj = mergeDeep(targetObj, obj1, obj2)

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
      const obj1Save = clone(obj1)
      expect(obj1Save).not.toBe(obj1)
      expect(obj1Save).toEqual(obj1)

      const obj2 = {
        a: 7,
        c: 8,
        d: {
          e: 9
        }
      }
      const obj2Save = clone(obj2)
      expect(obj2Save).not.toBe(obj2)
      expect(obj2Save).toEqual(obj2)

      const obj3 = {
        b: 10,
        d: {
          f: 11,
          g: 12
        }
      }
      const obj3Save = clone(obj3)
      expect(obj3Save).not.toBe(obj3)
      expect(obj3Save).toEqual(obj3)

      const resultObj = mergeDeep(targetObj, obj1, obj2, obj3)

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
      expect(deepCompare(1, 1)).toBe(true)
      expect(deepCompare('1', '1')).toBe(true)
      expect(deepCompare(true, true)).toBe(true)
      expect(deepCompare(false, false)).toBe(true)
      expect(deepCompare({}, {})).toBe(true)
      expect(deepCompare([], [])).toBe(true)
      expect(deepCompare({ a: 1 }, { a: 1 })).toBe(true)
      expect(deepCompare({ a: '1' }, { a: '1' })).toBe(true)
      expect(deepCompare({ a: '1', b: 2 }, { a: '1', b: 2 })).toBe(true)
      expect(deepCompare({ a: '1', b: [] }, { a: '1', b: [] })).toBe(true)
      expect(deepCompare({ a: '1', b: [1, 2] }, { a: '1', b: [1, 2] })).toBe(true)
      expect(deepCompare([1], [1])).toBe(true)
      expect(deepCompare([1, 1], [1, 1])).toBe(true)
      expect(deepCompare([1, '1'], [1, '1'])).toBe(true)
      expect(deepCompare(['1', 1], ['1', 1])).toBe(true)
      expect(deepCompare([{}], [{}])).toBe(true)
      expect(deepCompare([{ a: 1 }], [{ a: 1 }])).toBe(true)
      expect(deepCompare({
        method () {
        }
      }, {
        method () {
        }
      })).toBe(true)
    })

    it('should not be equal', () => {
      expect(deepCompare(1, 2)).toBe(false)
      expect(deepCompare(1, null)).toBe(false)
      expect(deepCompare('1', '2')).toBe(false)
      expect(deepCompare({}, { a: 1 })).toBe(false)
      expect(deepCompare({ a: 1 }, {})).toBe(false)
      expect(deepCompare({ a: 1 }, { a: 2 })).toBe(false)
      expect(deepCompare({ a: 2 }, { a: 1 })).toBe(false)
      expect(deepCompare({ a: 2 }, { b: 2 })).toBe(false)
      expect(deepCompare({ a: { b: 1 } }, { a: { c: 1 } })).toBe(false)
      expect(deepCompare([], [1])).toBe(false)
      expect(deepCompare([1], [])).toBe(false)
      expect(deepCompare([], ['1'])).toBe(false)
      expect(deepCompare(['1'], [])).toBe(false)
      expect(deepCompare(1, {})).toBe(false)
      expect(deepCompare({}, 1)).toBe(false)
      expect(deepCompare(1, { a: 1 })).toBe(false)
      expect(deepCompare({ a: 1 }, 1)).toBe(false)
      expect(deepCompare({}, [])).toBe(false)
      expect(deepCompare([], {})).toBe(false)
      expect(deepCompare({ a: 1 }, [1])).toBe(false)
      expect(deepCompare([1], { a: 1 })).toBe(false)
      expect(deepCompare({
        method: function x () {
        }
      }, {
        method: function y () {
        }
      })).toBe(false)
    })
  })

  /**
   * funcEval
   */
  describe('funcEval', () => {
    it('should funcEval non-functions', () => {
      expect(funcEval(null, null, 1, 2)).toBe(null)
      expect(funcEval(undefined, null, 't')).toBe(undefined)
      expect(funcEval(0)).toBe(0)
      expect(funcEval('Text', null)).toBe('Text')
      const obj = { a: 1 }
      expect(funcEval(obj)).toBe(obj)
      const list = [1, 2]
      expect(funcEval(list, null, 1, 2)).toBe(list)
    })

    it('should funcEval function', () => {
      const func = (...args: Array<any>) => args

      expect(funcEval(func)).toEqual([])
      expect(funcEval(func, null)).toEqual([])
      expect(funcEval(func, null, 1, 2)).toEqual([1, 2])
      expect(funcEval(func, null, 1, null, 3, 4, 5, 6)).toEqual([1, null, 3, 4, 5, 6])
    })

    it('should funcEval function context', () => {
      const expectedContext = {}

      function funcWithContext (this: any, ...args: Array<any>) {
        expect(this).toBe(expectedContext)
        return args
      }

      function funcNoContext (this: any, ...args: Array<any>) {
        expect(this).toBeUndefined()
        return args
      }

      expect(funcEval(funcWithContext, expectedContext)).toEqual([])
      expect(funcEval(funcNoContext)).toEqual([])
    })
  })

  /**
   * promiseEval
   */
  describe('promiseEval', () => {
    it('should eval non-functions', async () => {
      expect(await promiseEval(null, null, 1, 2)).toBe(null)
      expect(await promiseEval(undefined, 't')).toBe(undefined)
      expect(await promiseEval(0)).toBe(0)
      expect(await promiseEval('Text', null)).toBe('Text')
      const obj = { a: 1 }
      expect(await promiseEval(obj)).toBe(obj)
      const list = [1, 2]
      expect(await promiseEval(list, 1, 2)).toBe(list)

      expect(await promiseEval(new Promise(resolve => resolve(0)), 1, 2)).toBe(0)
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

      expect(await promiseEval(func)).toEqual([])
      expectedContext = null
      expect(await promiseEval(func, null)).toEqual([])
      expect(await promiseEval(func, null, 1, 2)).toEqual([1, 2])
      expectedContext = {}
      expect(await promiseEval(func, expectedContext, 1, null, 3, 4, 5, 6)).toEqual([1, null, 3, 4, 5, 6])

      expectedContext = undefined
      expect(await promiseEval(promiseFunc)).toEqual([])
      expectedContext = {}
      expect(await promiseEval(promiseFunc, expectedContext)).toEqual([])
      expect(await promiseEval(promiseFunc, expectedContext, 1, null, 3, 4)).toEqual([1, null, 3, 4])
    })
  })

  /**
   * format
   */
  describe('format', () => {
    it('should format string', async () => {
      expect(format('Test string {value}', { value: 5 })).toBe('Test string 5')
      expect(format('Test {value1} string {value2}', {
        value1: 1,
        value2: 'string value'
      })).toBe('Test 1 string string value')

      expect(format('Test {value1} string {value2} {value1}', {
        value1: 1
      })).toBe('Test 1 string {value2} 1')
    })
  })
})
