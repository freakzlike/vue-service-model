# Vue service model

[![Build](https://github.com/freakzlike/vue-service-model/workflows/Build/badge.svg)](https://github.com/freakzlike/vue-service-model/actions)
[![Latest Version](https://img.shields.io/npm/v/vue-service-model.svg)](https://www.npmjs.com/package/vue-service-model)
[![License](https://img.shields.io/npm/l/vue-service-model.svg)](https://github.com/freakzlike/vue-service-model/blob/master/LICENSE)

[Vue.js](https://vuejs.org/) library for model definition and using for REST services.

## Features

* Define models and easily retrieving data from a REST service
* Uses [Vuex](https://vuex.vuejs.org/) to cache response from service
* Handles active requests to same url and attach new requests to active request
* ... [more later](#future)

## Installation
```sh
npm install vue-service-model
```

## Example

Definition of a simple `ServiceModel` without using fields and use https://jsonplaceholder.typicode.com/posts/ as an example REST JSON service.
```js
import {ServiceModel} from 'vue-service-model'

class Post extends ServiceModel {
  // Unique name to handle in vuex
  static keyName = 'Post'

  // Define service url
  static urls = {
    BASE: 'https://jsonplaceholder.typicode.com/posts/'
  }
}
```

Retrieve the data from a service. `objects.get()` will return a model instance. `objects.all()` and `objects.filter()` will return a list of model instances.

```js
// Retrieve all posts from /posts/
const allPosts = await Post.objects.all()

// Retrieve filtered list from /posts/?userId=1
const userPosts = await Post.objects.filter({userId: 1})

// Retrieve specific post from /posts/1/
const post = await Post.objects.get('1')
```

You can easily access the data from a model instance

```js
post.data
```

## Usage

### BaseModel
A `BaseModel` can be used to handle data from any outer source.

```js
import {BaseModel, fields} from 'vue-service-model'

class MyModel extends BaseModel {
    static keyName = 'MyModel'
    
    static fieldsDef = {
      text: new fields.Field()
    }
}

const obj = new MyModel({text: 'Text value'})
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
// Retrieve value for field 'text'
obj.val.text
```

Retrieve field instance of given field name
```js
obj.getField('text')
```

### ServiceModel

A `ServiceModel` extends from [`BaseModel`](#basemodel) and adds the [`ModelManager`](#modelmanager-objects) with a vuex store to keep track of active requests and optionally cache the result of a service.

```js
import {ServiceModel, fields} from 'vue-service-model'

class Post extends ServiceModel {
  static keyName = 'Post'

  static urls = {
    BASE: 'https://jsonplaceholder.typicode.com/posts/'
  }

  // Duration to cache requested data in seconds. 0: no cache. null: Cache forever. Default is 30 seconds
  static cacheDuration = 5

  static fieldsDef = {
    id: new fields.Field(),
    title: new fields.CharField({label: 'Title'}),
    body: new fields.CharField({label: 'Body'})
  }
}
```

*TODO: Explain handling of vuex store and cache*

#### Urls

*TODO: Explain difference between list/detail url*

There are currently 3 places where an url can be defined. With the following priority
1. Overwrite `getListUrl` method and a return a Promise which will resolve the url as string
1. Set the list url in model `static urls = { LIST: <...> }`
1. Set the base url in model `static urls = { BASE: <...> }`

#### ModelManager (objects)

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
* ...

## Contribution

*TODO*

## License

[MIT](http://opensource.org/licenses/MIT)
