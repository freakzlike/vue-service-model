import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'

export default {
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
