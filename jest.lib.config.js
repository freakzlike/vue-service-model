// jest config to test against compiled lib
const jestConfig = require('./jest.config.js')

module.exports = {
  ...jestConfig,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/lib/$1'
  }
}
