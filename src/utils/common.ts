import Dictionary from '../types/Dictionary'

/**
 * Simple object check.
 * Source: https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 * @param {Any} item
 * @param {Boolean} arrayIsObject
 * @returns {Boolean}
 */
export const isObject = (item: any, arrayIsObject = false): boolean => {
  if (item && typeof item === 'object') {
    return !Array.isArray(item) || arrayIsObject
  } else {
    return false
  }
}

/**
 * Check whether value is null or undefined is empty
 * @param {Any} value
 * @returns {Boolean}
 */
export const isNull = (value: any): boolean => {
  return value === null || value === undefined
}

/**
 * clone
 * deep clone javascript object
 * @param {Any} obj
 * @returns {Any}
 */
export const clone = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  const copy = obj.constructor()
  for (const attr of Object.keys(obj)) {
    copy[attr] = clone(obj[attr])
  }
  return copy
}

/**
 * Deep merge two objects.
 * Source: https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 * @param {Object} target
 * @param {Object} sources
 * @returns {Object}
 */
export const mergeDeep = (target: Dictionary<any>, ...sources: Array<Dictionary<any>>): Dictionary<any> => {
  if (!sources.length) return target
  const source = sources.shift()

  /* istanbul ignore else */
  if (source && isObject(target) && isObject(source)) {
    for (const key of Object.keys(source)) {
      const value: any = source[key]
      if (isObject(value)) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], value)
      } else {
        Object.assign(target, { [key]: value })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

/**
 * Deep compare two objects
 * Will not work with circular objects and only compares method names
 * @param {Any} obj1
 * @param {Any} obj2
 * @returns {Boolean}
 */
export const deepCompare = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true
  if (isNull(obj1) || isNull(obj2)) return false
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false
  if (isObject(obj1, true) !== isObject(obj2, true)) return false
  if (!isObject(obj1, true)) {
    // Primitive objects! -> Simple compare with: ===
    return obj1 === obj2
  }
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false

  for (const p of Object.keys(obj1)) {
    if (!Object.prototype.hasOwnProperty.call(obj2, p)) {
      return false
    }

    switch (typeof (obj1[p])) {
      case 'object':
        if (!deepCompare(obj1[p], obj2[p])) {
          return false
        }
        break
      case 'function':
        if (typeof (obj2[p]) === 'undefined' || (obj1[p].toString() !== obj2[p].toString())) {
          return false
        }
        break
      default:
        if (obj1[p] !== obj2[p]) {
          return false
        }
    }
  }

  return true
}

/**
 * Call value if callable else return value
 * @param {Any} value
 * @param {any} context
 * @param {Any} args
 * @returns {Any}
 */
export const funcEval = (value: any, context?: any, ...args: Array<any>): any => {
  return typeof value === 'function' ? value.call(context, ...args) : value
}

/**
 * Call value if callable else use value to resolve Promise
 * @param {Any} value
 * @param {Any} context
 * @param {Any} args
 * @returns {Promise}
 */
export const promiseEval = (value: any, context?: any, ...args: Array<any>): Promise<any> => {
  return Promise.resolve(funcEval(value, context, ...args))
}

/**
 * Format string with placeholders
 * E.g. "Test String {value}" + {value: 5} = "Test String 5"
 * https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/18234317
 */
export const format = (str: string, args: Dictionary<any>): string => {
  return Object.keys(args).reduce((_str: string, key: string): string => {
    return _str.replace(new RegExp(`\\{${key}\\}`, 'gi'), args[key])
  }, str.toString())
}

export const NO_VALUE = {}
