# Installation

`vue-service-model` requires [`Vue.js v2`](https://vuejs.org/) as dependencies.

## NPM
```sh
npm install vue-service-model
```

## Yarn
```sh
yarn add vue-service-model
```

## CDN
```html
<!-- dependencies -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/vue-service-model/dist/vue-service-model.min.js"></script>
```

For production you should use a specific versions to avoid unexpected changes.
```html
<script src="https://cdn.jsdelivr.net/npm/vue-service-model@0.18.0/dist/vue-service-model.min.js"></script>
```

::: warning
When using CDN you need to access from `VueServiceModel`. E.g:
```js
class MyModel extends VueServiceModel.ServiceModel {
  [...]
}
```
:::

### Integration of `vue-async-computed`

`vue-service-model` can optionally make usage of [`vue-async-computed`](https://github.com/foxbenjaminfox/vue-async-computed)
to achieve more reactivity when rendering components. In case you have [`vue-async-computed`](https://github.com/foxbenjaminfox/vue-async-computed)
installed, then you need to enable it in the [configuration](/guide/configuration.html#vue-async-computed).

```js
import {setConfig} from 'vue-service-model'

setConfig({
  useAsyncComputed: true
  // ... your other configurations
})
```
