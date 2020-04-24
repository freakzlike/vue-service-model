# Vue service model

[![Build](https://github.com/freakzlike/vue-service-model/workflows/Build/badge.svg)](https://github.com/freakzlike/vue-service-model/actions)
[![codecov](https://codecov.io/gh/freakzlike/vue-service-model/branch/master/graph/badge.svg)](https://codecov.io/gh/freakzlike/vue-service-model)
[![Package Quality](https://npm.packagequality.com/shield/vue-service-model.svg)](https://packagequality.com/#?package=vue-service-model)
[![Latest Version](https://img.shields.io/npm/v/vue-service-model.svg)](https://www.npmjs.com/package/vue-service-model)
[![License](https://img.shields.io/npm/l/vue-service-model.svg)](https://github.com/freakzlike/vue-service-model/blob/master/LICENSE)

[Vue.js](https://vuejs.org/) Library for handling REST service requests with caching, aggregation and model definitions.

## Features

* Define models and easily handle REST service requests
* Pass model data to REST service requests and retrieve model data from them
* Aggregation for multiple parallel requests to the same url to avoid redundant requests. See [aggregation](https://freakzlike.github.io/vue-service-model/guide/service-model.html#aggregation)
* Caches response from services
* Uses [axios](https://github.com/axios/axios) for service request
* Field specific [rendering](https://freakzlike.github.io/vue-service-model/guide/fields.html#rendering) with common component for consistent display of field values

## [Documentation](https://freakzlike.github.io/vue-service-model/)

## [Example project](https://github.com/freakzlike/vue-service-model-example)

## Contribution

Feel free to create an issue for bugs, feature requests, suggestions or any idea you have. You can also add a pull request with your implementation.

It would please me to hear from your experience.

I used some ideas and names from [django](https://www.djangoproject.com/), [django REST framework](https://www.django-rest-framework.org/), [ag-Grid](https://www.ag-grid.com/) and other libraries and frameworks.

## License

[MIT](http://opensource.org/licenses/MIT)
