declare namespace jest {
  interface Matchers<R> {
    toUseReactivity(computed: () => {}, times?: number): CustomMatcherResult;
  }
}
