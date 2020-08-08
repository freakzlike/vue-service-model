const typescript = require('rollup-plugin-typescript2')
const pkg = require('./package.json')
const { terser } = require('rollup-plugin-terser')

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: './dist/vue-service-model.min.js',
      format: 'iife',
      name: 'VueServiceModel',
      globals: {
        vue: 'Vue',
        'vue-async-computed': 'AsyncComputed',
        axios: 'axios'
      }
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    typescript({
      typescript: require('typescript')
    }),
    terser()
  ]
}
