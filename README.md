# Vue service model

[![Build](https://github.com/freakzlike/vue-service-model/workflows/Build/badge.svg)](https://github.com/freakzlike/vue-service-model/actions)
[![Latest Version](https://img.shields.io/npm/v/vue-service-model.svg)](https://www.npmjs.com/package/vue-service-model)
[![License](https://img.shields.io/npm/l/vue-service-model.svg)](https://github.com/freakzlike/vue-service-model/blob/master/LICENSE)

[Vue.js](https://vuejs.org/) Library for handling REST service requests with caching, aggregation and model definitions. Uses core function from [js-service-model](https://github.com/freakzlike/js-service-model).

## Features

* Define models and easily handle REST service requests
* Pass model data to REST service requests and retrieve model data from them
* Aggregation for multiple parallel requests to the same url to avoid redundant requests. See [aggregation](https://github.com/freakzlike/js-service-model#aggregation)
* Caches response from services
* Uses [axios](https://github.com/axios/axios) for service request
* Field specific [rendering](#rendering)
* ... [more later](#future)

## Content

* [Installation](#installation)
* [Example](#example)
* [Usage](#usage)
  * [Core Usage](#core-usage)
  * [Fields](#fields)
    * [Rendering](#rendering)
  * [Components](#components)
    * [DisplayField](#displayfield)
* [Future](#future)
* [Contribution](#contribution)
* [License](#license)

## Installation
```sh
npm install vue-service-model
```

## Example

Definition of a simple `ServiceModel` without using fields. https://jsonplaceholder.typicode.com/albums/ is being used as an example REST JSON service.
```js
import {ServiceModel} from 'vue-service-model'

class Album extends ServiceModel {
  // Define service url
  static urls = {
    BASE: 'https://jsonplaceholder.typicode.com/albums/'
  }
}
```

Retrieve data from a service. `objects.detail()` will return a model instance. `objects.list()` will return a list of model instances.

```js
// Retrieve all albums from /albums/
const allAlbums = await Album.objects.list()

// Retrieve specific album from /albums/1/
const album = await Album.objects.detail(1)

// Retrieve filtered list from /albums/?userId=1
const userAlbums = await Album.objects.list({filter: {userId: 1}})
```

You can easily access the data from a model instance or define model [fields](https://github.com/freakzlike/js-service-model#fields).

```js
album.data
```

## Usage

### Core Usage
The Core functionality has been moved to [js-service-model](https://github.com/freakzlike/js-service-model). You can still use same imports with `vue-service-model`.
See [Core usage](https://github.com/freakzlike/js-service-model).

### Fields

#### Rendering

By using the [`DisplayField`](#displayfield) component you can render the value of a field. To customize the different 
output which should be rendered you can either set a `displayRender` or a custom `displayComponent`.

The `displayRender` can be used for small changes of the output and is a simple render function (See [Vue.js render function](https://vuejs.org/v2/guide/render-function.html)).

```js
class RedTextField extends Field {
  displayRender (h) {
    return h('span', {
      style: {
        color: 'red'
      }
    }, this.value)
  }
}
```

In case you need to do more specific rendering you can also set your own component which will be rendered when using [`DisplayField`](#displayfield) on your custom field.

```js
// CustomField.js
class CustomField extends Field {
  get displayComponent () {
    return import('./CustomFieldComponent')
  }
}

// CustomFieldComponent.vue
<template>
  <span>{{ fieldValue }}</span>
</template>

<script>
  import {BaseDisplayFieldRender} from 'vue-service-model'

  export default {
    extends: BaseDisplayFieldRender,
    computed: {
      fieldValue () {
        return this.field.value      
      }  
    }
  }
</script>
```

### Components

#### DisplayField

The `DisplayField` component can be used to display the value of the given field. The property `model` can either be a 
model instance or `null` to allow async loading of the model instance. The component will not render when `null` has 
been passed as `model`. To change the output for specific fields see [Fields rendering](#rendering). 

```vue
<template>
  [...]
    <display-field :model="album" field-name="title"/>
  [...]
</template>

<script>
  import {DisplayField} from 'vue-service-model'

  export default {
    components: {DisplayField},
    data () {
      return {
        album: null
      }  
    },
    mounted () {
      this.loadAlbum()    
    },
    methods: {
      async loadAlbum () {
        this.album = await Album.objects.detail(1)
      }
    }
  }
</script>
```


## Future

* [Core](https://github.com/freakzlike/js-service-model#future)
* Fields
  * Methods to allow generation of input/display components according to field type
  * Loading slot for `DisplayField`

## Contribution

Feel free to create an issue for bugs, feature requests, suggestions or any idea you have. You can also add a pull request with your implementation.

It would please me to hear from your experience.

I used some ideas and names from [django](https://www.djangoproject.com/), [django REST framework](https://www.django-rest-framework.org/), [ag-Grid](https://www.ag-grid.com/) and other libraries and frameworks.

## License

[MIT](http://opensource.org/licenses/MIT)
