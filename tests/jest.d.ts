declare namespace jest {
  interface Matchers<R> {
    toUseReactivity(computed: (() => object) | object, times?: number): CustomMatcherResult;
  }
}
