/* eslint-disable max-len, import/export, no-use-before-define */
import { App, DefineComponent, defineComponent } from 'vue'

export default function mixins<T extends DefineComponent[]> (...args: T): ExtractVue<T> extends infer V ? V extends App ? DefineComponent<V> : never : never
export default function mixins<T extends DefineComponent> (...args: DefineComponent[]): DefineComponent<T>
export default function mixins (...args: DefineComponent[]): DefineComponent {
  return defineComponent({ mixins: args })
}

/**
 * Returns the instance type from a DefineComponent
 * Useful for adding types when using mixins().extend()
 */
export type ExtractVue<T extends DefineComponent | DefineComponent[]> = T extends (infer U)[]
  ? UnionToIntersection<U extends DefineComponent<infer V> ? V : never>
  : T extends DefineComponent<infer V> ? V : never

type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
