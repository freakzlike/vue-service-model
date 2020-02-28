# Vue service model

[![Build](https://github.com/freakzlike/vue-service-model/workflows/Build/badge.svg)](https://github.com/freakzlike/vue-service-model/actions)
[![Latest Version](https://img.shields.io/npm/v/vue-service-model.svg)](https://www.npmjs.com/package/vue-service-model)
[![License](https://img.shields.io/npm/l/vue-service-model.svg)](https://github.com/freakzlike/vue-service-model/blob/master/LICENSE)

[Vue.js](https://vuejs.org/) library for handling REST requests and models definitions.

## Features

* Define models and easily handle REST requests
* Pass model data to REST requests and retrieve model data from them
* Uses [Vuex](https://vuex.vuejs.org/) to cache responses from service
* Handles multiple parallel requests to the same url and attach new requests to already [running requests](#running-requests), so the request will only made once
* ... [more later](#future)

## Installation
```sh
npm install vue-service-model
```

## Example

Definition of a simple `ServiceModel` without using fields. https://jsonplaceholder.typicode.com/albums/ is being used as an example REST JSON service.
```js
import {ServiceModel} from 'vue-service-model'

class Album extends ServiceModel {
  // Unique name to handle caching
  static keyName = 'Album'

  // Define service url
  static urls = {
    BASE: 'https://jsonplaceholder.typicode.com/albums/'
  }
}
```

Retrieve data from a service. `objects.get()` will return a model instance. `objects.all()` and `objects.filter()` will return a list of model instances. Filter fields will be passes as URL parameters.

```js
// Retrieve all albums from /albums/
const allAlbums = await Album.objects.all()

// Retrieve filtered list from /albums/?userId=1
const userAlbums = await Album.objects.filter({userId: 1})

// Retrieve specific album from /albums/1/
const album = await Album.objects.get('1')
```

You can easily access the data from a model instance

```js
album.data
```

## Usage

### BaseModel
A `BaseModel` can be used to handle data from any outer source.

```js
import {BaseModel, fields} from 'vue-service-model'

class MyModel extends BaseModel {
    static keyName = 'MyModel'
    
    static fieldsDef = {
      title: new fields.Field()
    }
}

const obj = new MyModel({title: 'My title'})
```

Retrieve data of a model instance.
```js
obj.data
```

Retrieve a list of all fields.
```js
obj.fields
```

Retrieve value from a single field.
```js
// Retrieve value for field 'title'
obj.val.title
```

Retrieve field instance of given field name
```js
obj.getField('title')
```

### ServiceModel

A `ServiceModel` extends from [`BaseModel`](#basemodel) and adds the [`ModelManager`](#modelmanager-objects) with a vuex
store to keep track of [running requests](#running-requests) and optionally caching the result of a service.

```js
import {ServiceModel, fields} from 'vue-service-model'

class Album extends ServiceModel {
  static keyName = 'Album'

  static urls = {
    BASE: 'https://jsonplaceholder.typicode.com/albums/'
  }

  // Duration to cache requested data in seconds. 0: no cache. null: Cache forever. Default is 30 seconds
  static cacheDuration = 5

  static fieldsDef = {
    id: new fields.Field(),
    title: new fields.CharField({label: 'Title'})
  }
}
```

#### Urls

Urls are currently divided up in 2 different types `LIST` and `DETAIL` (same like in [Django REST framework](https://www.django-rest-framework.org/api-guide/routers/#simplerouter)).

* `LIST`: (e.g. `/albums/`) used for `objects.all()` and `objects.filter()`
* `DETAIL`: (e.g. `/albums/1/`) used for `objects.get(1)`


The simplest way to define the urls is to set the static property `urls.BASE` in your `ServiceModel`.
```js
static urls = {
  BASE: 'https://jsonplaceholder.typicode.com/albums/'
}
```
When doing a detail request your key will be automatically appended to the end of the `BASE` url.

You can also define the `LIST` and `DETAIL` url separately:
```
static urls = {
  LIST: 'https://jsonplaceholder.typicode.com/albums/',
  // {pk} will be replaced with your value you provide to objects.get() 
  DETAIL: 'https://jsonplaceholder.typicode.com/albums/{pk}/'
}
```

There are currently 3 ways how you can define your url with the following priority
1. Overwrite `getListUrl` or `getDetailUrl` method and a return a Promise which will resolve the url as a string
1. Set the `LIST` or `DETAIL` url in your model `static urls = { LIST: <...>, DETAIL: <...> }`
1. Set the `BASE` url in your model `static urls = { BASE: <...> }`

#### ModelManager (objects)

*TODO*

#### Running requests

When you start to request data from a service for example `Album.objects.get('1')` then the Promise of the request will 
be saved as long as the request has not been completed. So when requesting `Album.objects.get('1')` again (e.g from another component)
then this request will be attached to the first request which has not been completed yet and the request of the service will only made once.

#### Cache

With the static property `cacheDuration` it is possible to set the duration in seconds how long the result of a response 
should be cached. The default value is 30 seconds

* null: cache will not be removed
* 0: no caching

*Open features*:
- [ ] API to cache clear cache
- [ ] Define different cacheDuration for a specific request
- [ ] Argument on [`ModelManager`](#modelmanager-objects) methods to not use cache
- [ ] "garbage collector" to remove expired cache

#### Parents

*TODO*

### Fields

*TODO*

## Future

* Models
  * Default support of model creation, update and delete with POST, PUT/PATCH and DELETE request
  * Easy extending or overwriting of the request function
  * Optional mapping of response data
* Fields
  * Different field types
  * Methods to allow generation of input/display components according to field type
  * Accessing foreign key fields and retrieving foreign model instances
* Global configuration with hooks
* Error handling
* ...

## Contribution

Feel free to create an issue for bugs, feature requests, suggestions or any idea you have. You can also add a pull request with your implementation.

It would would be happy to hear from your experience.

## License

[MIT](http://opensource.org/licenses/MIT)