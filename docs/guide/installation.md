# Installation

`vue-service-model` requires [`Vue.js`](https://vuejs.org/) and [`vue-async-computed`](https://github.com/foxbenjaminfox/vue-async-computed) as dependencies.

## NPM
```sh
npm install vue-service-model vue vue-async-computed
```

## Yarn
```sh
yarn add vue-service-model vue vue-async-computed
```

## CDN
```html
<!-- dependencies -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-async-computed/dist/vue-async-computed.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/vue-service-model/dist/vue-service-model.min.js"></script>
```

For production you should use a specific versions to avoid unexpected changes.
```html
<script src="https://cdn.jsdelivr.net/npm/vue-service-model@0.13.0/dist/vue-service-model.min.js"></script>
```

::: warning
When using CDN you need to access from `VueServiceModel`. E.g:
```js
class MyModel extends VueServiceModel.ServiceModel {
  [...]
}
```
:::