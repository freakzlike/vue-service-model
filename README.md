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
* ... [more later](#future)

## Content

* [Installation](#installation)
* [Example](#example)
* [Documentation](https://freakzlike.github.io/vue-service-model/)
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

// Create new album
await Album.objects.create({title: 'New album'})

// Update an album
await Album.objects.update(1, {title: 'Updated album'})

// Delete specific album
await Album.objects.delete(1)
```

You can also define [fields](https://freakzlike.github.io/vue-service-model/guide/fields.html) for your model.

```js
class Album extends ServiceModel {
  [...]

  static fieldsDef = {
    id: new Field({primaryKey: true}),
    title: new Field({label: 'Album title'})
  }
}

const album = await Album.objects.detail(1)

// Retrieve primary key
album.pk // Output: 1

// Retrieve value for field title
await album.val.title // Output: 'Album title'
```

By using a common component [`DisplayField`](https://freakzlike.github.io/vue-service-model/guide/components.html#displayfield) you can render the value of a field for display purpose anywhere in your application with the same output.
```vue
<display-field :model="album" field-name="title"/>
```

Or [`InputField`](https://freakzlike.github.io/vue-service-model/guide/components.html#inputfield) for an input field.

```vue
<input-field :model="album" field-name="title"/>
```

## Future

* Models
  * Model instance methods for saving/deleting data (`.save()`, `.delete()`)
  * Synchronize mode to update model data 
  * Cache
    * Define a different cacheDuration for a specific request
    * Use cache from list response also for detail requests
    * "garbage collector" to remove expired cache
* Fields
  * Different field types
  * Standalone field instances
  * Accessing foreign key fields and retrieving foreign model instances
  * Methods to allow generation of input components according to field type
  * Loading slot for `DisplayField`
* Global configuration with hooks
* ...

## Contribution

Feel free to create an issue for bugs, feature requests, suggestions or any idea you have. You can also add a pull request with your implementation.

It would please me to hear from your experience.

I used some ideas and names from [django](https://www.djangoproject.com/), [django REST framework](https://www.django-rest-framework.org/), [ag-Grid](https://www.ag-grid.com/) and other libraries and frameworks.

## License

[MIT](http://opensource.org/licenses/MIT)
