type anyPromise<T> = Promise<T> | T
type funcValue<T> = () => anyPromise<T>
type LazyValue<T> = funcValue<T> | T

export { LazyValue }
export default LazyValue
