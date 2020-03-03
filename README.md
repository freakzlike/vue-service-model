# Vue service model

[![Build](https://github.com/freakzlike/vue-service-model/workflows/Build/badge.svg)](https://github.com/freakzlike/vue-service-model/actions)
[![Latest Version](https://img.shields.io/npm/v/vue-service-model.svg)](https://www.npmjs.com/package/vue-service-model)
[![License](https://img.shields.io/npm/l/vue-service-model.svg)](https://github.com/freakzlike/vue-service-model/blob/master/LICENSE)

[Vue.js](https://vuejs.org/) library for handling REST service requests with caching, aggregation and model definitions.

## Features

* Define models and easily handle REST service requests
* Pass model data to REST service requests and retrieve model data from them
* Aggregation for multiple parallel requests to the same url to avoid redundant requests. See [aggregation](#aggregation)
* Uses [Vuex](https://vuex.vuejs.org/) to cache responses from service
* Uses [axios](https://github.com/axios/axios) for service request
* ... [more later](#future)

## Content

* [Installation](#installation)
* [Example](#example)
* [Usage](#usage)
  * [BaseModel](#basemodel)
  * [ServiceModel](#servicemodel)
    * [Urls](#urls)
    * [ModelManager (`objects`)](#modelmanager-objects)
      * [Custom ModelManager](#custom-modelmanager)
    * [Aggregation](#aggregation)
    * [Cache](#cache)
    * [Parents](#parents)
  * [Fields](#fields)
    * [Field definition (`fieldsDef`)](#field-definition-fieldsdef)
      * [Attribute name (`attributeName`)](#attribute-name-attributename)
      * [Field label and hint (`label`, `hint`)](#field-label-and-hint-label-hint)
    * [Custom/Computed fields](#customcomputed-fields)
    * [Field types](#field-types)
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
  // Unique name to handle caching
  static keyName = 'Album'

  // Define service url
  static urls = {
    BASE: 'https://jsonplaceholder.typicode.com/albums/'
  }
}
```

Retrieve data from a service. `objects.get()` will return a model instance. `objects.all()` and `objects.filter()` will return a list of model instances. Filter fields will be passed as URL query parameters.

```js
// Retrieve all albums from /albums/
const allAlbums = await Album.objects.all()

// Retrieve filtered list from /albums/?userId=1
const userAlbums = await Album.objects.filter({userId: 1})

// Retrieve specific album from /albums/1/
const album = await Album.objects.get(1)
```

You can easily access the data from a model instance or define model [fields](#fields).

```js
album.data
```

## Usage

### BaseModel
A `BaseModel` can be used to handle data from any source by passing the data when instantiating the model.

```js
import {BaseModel, fields} from 'vue-service-model'

class MyModel extends BaseModel {
  // Unique name
  static keyName = 'MyModel'
    
  // Definition of model fields (optional)
  static fieldsDef = {
    title: new fields.Field()
  }
}

const obj = new MyModel({title: 'My title'})
```

Retrieve data of the model instance.
```js
obj.data // output: {title: 'My title'}
```

Retrieve a list of all fields.
```js
obj.fields
```

Retrieve value from a single field.
```js
// Retrieve value for field 'title'
obj.val.title // output: My title
```

Retrieve field instance of given field name
```js
obj.getField('title')
```

### ServiceModel

A `ServiceModel` extends from [`BaseModel`](#basemodel) and adds the [`ModelManager`](#modelmanager-objects) with a vuex
store to keep track of [aggregation](#aggregation) of running requests and optionally caching the result of the services.

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
    title: new fields.Field()
  }
}
```

#### Urls

Urls are currently divided into 2 different types. `LIST` and `DETAIL` (same like in [Django REST framework](https://www.django-rest-framework.org/api-guide/routers/#simplerouter)).

* `LIST`: (e.g. `/albums/`) used for `objects.all()` and `objects.filter()`
* `DETAIL`: (e.g. `/albums/1/`) used for `objects.get(1)`


The simplest way to define the urls is to set the static property `urls.BASE` in your `ServiceModel`.
```js
static urls = {
  BASE: 'https://jsonplaceholder.typicode.com/albums/'
}
```
When performing a detail request your key will be automatically appended to the end of the `BASE` url.

You can also define the `LIST` and `DETAIL` url separately:
```js
static urls = {
  LIST: 'https://jsonplaceholder.typicode.com/albums/',
  // {pk} will be replaced with your value you provide to objects.get() 
  DETAIL: 'https://jsonplaceholder.typicode.com/albums/{pk}/'
}
```

There are currently 3 ways to define your url with the following priority
1. Overwrite `getListUrl` or `getDetailUrl` method and a return a `Promise` which will resolve the url as a string
1. Set the `LIST` or `DETAIL` url in your model `static urls = { LIST: <...>, DETAIL: <...> }`
1. Set the `BASE` url in your model `static urls = { BASE: <...> }`

If you got a nested RESTful service structure (e.g. `/albums/1/photos/`) have a look at [parents](#parents).

#### ModelManager (`objects`)

The `ModelManager` provides the interface to perform the api requests.

At the moment there are 3 default interface methods:
* `objects.all()`
  * Used to request a list of data (e.g. `/albums/`)
  * Returns a list of model instances
* `objects.filter({userId: 1)`
  * Used to request a list of data with query parameters (e.g. `/albums/?userId=1`)
  * Returns a list of model instances
  * Usually used for filtering a list
  * Takes `filterParams` as first argument which must be plain object and will be converted to query parameters (`params` in [axios](https://github.com/axios/axios))
  * `objects.filter({})` is equivalent to `objects.all()`
* `objects.get(1)`
  * Used to request a single instance (e.g. `/albums/1/`)
  * Returns a single model instance
  * Takes key as first argument which can either be a `string` or `number`

Each method also takes a plain object with [parents](#parents) as last argument.

##### Custom ModelManager
  
You can extend the `ModelManager` and add your own methods.
```js
class Album extends ServiceModel {
  [...]

  static ModelManager = class extends ServiceModel.ModelManager {
    customMethod () {
      const Model = this.model
      return new Model({title: 'Custom Album'})
    }
  }
}

const customAlbum = Album.objects.customMethod()
```

It is also possible to overwrite some methods to do the `list`/`detail` request by yourself or map the response data before it gets cached and used for the model instance.

* `sendListRequest`
  * Gets called when doing a list request with `objects.all()` or `objects.filter()`
* `sendDetailRequest`
  * Gets called when doing a detail with `objects.get()`
* `mapListResponseBeforeCache`
  * Gets called from `sendListRequest` with the response data before the data will be cached
* `mapDetailResponseBeforeCache`
  * Gets called from `sendDetailRequest` with the response data before the data will be cached

#### Aggregation

When you start to request data from a service, for example `Album.objects.get('1')`, then the `Promise` of the request will 
be saved as long as the request has not been completed. So when requesting `Album.objects.get('1')` again (e.g from another component)
this request will be attached to the first request which has not been completed yet and the request of the service will only made once.

#### Cache

With the static property `cacheDuration` it is possible to set the duration (in seconds) of how long the result of a response 
should be cached. The default value is 30 seconds. Currently the expired data will only be removed by requesting the same data again.
The `keyName` of your model will be used to access the specific cache so keep them unqiue to avoid having models using the same cache.

* null: cache will not be removed
* 0: no caching

#### Parents

When using a nested RESTful service more information is necessary to uniquely identify a resource. You need to define `parents` in your `ServiceModel`.

```js
class Photo extends ServiceModel {
  [...]

  // Define name of parents
  static parents = ['album']

  static urls = {
    // Add placeholder for parent in your url
    BASE: 'https://jsonplaceholder.typicode.com/albums/{album}/photos/'
  }
}

// Retrieve all photos from album 1: /albums/1/photos/
const photos = await Photo.objects.all({album: 1})

// Retrieve photo 2 from album 1: /albums/1/photos/2/
const photo = await Photo.objects.get(2, {album: 1})
```

It is necessary to set exact parents otherwise a warning will be printed to the console. You can also add some custom
validation of the parents by extending the `checkServiceParents` method of your `ServiceModel`. This will be called on default [`ModelManager`](#modelmanager-objects) interfaces and when retrieving the service url from [`getListUrl`](#urls) or [`getDetailUrl`](#urls).

### Fields

Fields will be one of the main features of this library.

#### Field definition (`fieldsDef`)
You can set your model fields with the static property `fieldsDef` with a plain object with your fieldname as key and the field instance as value. 
Nested `fieldsDef` is currently not supported.

```js
class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    first_name: new fields.Field(),
    last_name: new fields.Field()
  }
}

const myObj = new MyModel({
  first_name: 'Joe',
  last_name: 'Bloggs'
})

myObj.val.first_name // output: Joe
myObj.val.last_name // output: Bloggs
```

##### Attribute name (`attributeName`)

By default the key of your field in your `fieldsDef` (e.g. `first_name`) will be used to retrieve the value from the model data.
You can also set the `attributeName` when instantiating the field. It is also possible to access nested data when using dot-notation in `attributeName`.
If you need a more specific way to retrieve the value of a field from your data then have a look at [Custom/Computed fields](#customcomputed-fields).

```js
class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    name: new fields.Field({attributeName: 'username'}),
    address_city: new fields.Field({attributeName: 'address.city'}),
    address_street: new fields.Field({attributeName: 'address.street.name'})
  }
}

const myObj = new MyModel({
  username: 'joe_bloggs',
  address: {
    city: 'New York',
    street: {
      name: 'Fifth Avenue'
    } 
  }
})

myObj.val.name // output: joe_bloggs
myObj.val.address_city // output: New York
myObj.val.address_street // output: Fifth Avenue
```

##### Field label and hint (`label`, `hint`)

With the `label` property you can set a descriptive name for your field. `hint` is used to provide a detail description of your field. `label` and `hint` can either be a `string` or a `function` which should return a `string` or a `Promise`.
You can access your label/hint with the `label`/`hint` property of your field instance which will always return a `Promise`.

```js
class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    first_name: new fields.Field({
      label: 'First name',
      hint: () => 'First name of the employee'
    })
  }
}

[...]

const firstNameField = myObj.getField('first_name')

await firstNameField.label // output: First name
await firstNameField.hint // output: First name of the employee
```

#### Custom/Computed fields

In case you want to define your own field class you just need to extend from `fields.Field`. By overwriting the `valueGetter` method you are able to map the field value by yourself and create computed values.

```js
class FullNameField extends fields.Field {
  valueGetter (data) {
    return data ? data.first_name + ' ' + data.last_name : null
  }
}

class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    full_name: new FullNameField()
  }
}

const myObj = new MyModel({
  first_name: 'Joe',
  last_name: 'Bloggs'
})

myObj.val.full_name // output: Joe Bloggs
```

#### Field types

Different field types will be added with future releases.

## Future

* Models
  * Default support of model creation, update and delete with POST, PUT/PATCH and DELETE request
  * Easy extending or overwriting of the request function
  * Optional mapping of response data
  * Cache
    * API to clear cache
    * Define a different cacheDuration for a specific request
    * Argument on [`ModelManager`](#modelmanager-objects) methods to not use cache
    * Use cache from list response also for detail requests
    * "garbage collector" to remove expired cache
* Fields
  * Different field types
  * Standalone field instances
  * Methods to allow generation of input/display components according to field type
  * Accessing foreign key fields and retrieving foreign model instances
* Global configuration with hooks
* Error handling
* ...

## Contribution

Feel free to create an issue for bugs, feature requests, suggestions or any idea you have. You can also add a pull request with your implementation.

It would please me to hear from your experience.

I used some ideas and names from [django](https://www.djangoproject.com/) (e.g. `objects.filter()`) and other libraries and frameworks.

## License

[MIT](http://opensource.org/licenses/MIT)