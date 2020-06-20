module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  setupFilesAfterEnv: [
    './tests/setupJest.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.{!(json),}'
  ]
}
