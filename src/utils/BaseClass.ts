import Dictionary from '../types/Dictionary'

/**
 * BaseClass
 */
export class BaseClass {
  /**
   * Getter to retrieve static class definition
   */
  public get cls (): Dictionary<any> {
    return this.constructor
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Getter to retrieve static class definition
   */
  public static get cls (): Dictionary<any> {
    return this
  }
}
