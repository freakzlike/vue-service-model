# Vue service model

[![Build](https://github.com/freakzlike/vue-service-model/workflows/Build/badge.svg)](https://github.com/freakzlike/vue-service-model/actions)
[![codecov](https://codecov.io/gh/freakzlike/vue-service-model/branch/master/graph/badge.svg)](https://codecov.io/gh/freakzlike/vue-service-model)
[![Latest Version](https://img.shields.io/npm/v/vue-service-model.svg)](https://www.npmjs.com/package/vue-service-model)
[![License](https://img.shields.io/npm/l/vue-service-model.svg)](https://github.com/freakzlike/vue-service-model/blob/master/LICENSE)

[Vue.js](https://vuejs.org/) Library for handling REST service requests with caching, aggregation and model definitions.

## Features

* Define models and easily handle REST service requests
* Pass model data to REST service requests and retrieve model data from them
* Aggregation for multiple parallel requests to the same url to avoid redundant requests. See [aggregation](#aggregation)
* Caches response from services
* Uses [axios](https://github.com/axios/axios) for service request
* Field specific [rendering](#rendering) with common component for consistent display of field values
* ... [more later](#future)

## Content

* [Installation](#installation)
* [Example](#example)
* [Usage](#usage)
  * [BaseModel](#basemodel)
    * [Model fields](#model-fields-fieldsdef)
    * [BaseModel API](#basemodel-api)
  * [ServiceModel](#servicemodel)
    * [Urls](#urls)
    * [Aggregation](#aggregation)
    * [Cache](#cache)
    * [Parents](#parents)
    * [ServiceModel API](#servicemodel-api)
  * [Fields](#fields)
    * [Field definition](#field-definition)
      * [Attribute name (`attributeName`)](#attribute-name-attributename)
      * [Field label and hint (`label`, `hint`)](#field-label-and-hint-label-hint)
    * [Field API](#field-api)
    * [Custom/Computed fields](#customcomputed-fields)
    * [Field types](#field-types)
    * [Rendering](#rendering)
  * [ModelManager (`objects`)](#modelmanager-objects)
    * [Retrieve list of data (`objects.list()`)](#retrieve-list-of-data-objectslist)
    * [Retrieve single entry of data (`objects.detail()`)](#retrieve-single-entry-of-data-objectsdetail)
    * [Create single entry (`objects.create()`)](#create-single-entry-objectscreate)
    * [Update single entry (`objects.update()`)](#update-single-entry-objectsupdate)
    * [Delete single entry (`objects.delete()`)](#delete-single-entry-objectsdelete)
    * [RetrieveInterfaceParams](#retrieveinterfaceparams)
    * [Exceptions](#exceptions)
    * [Custom ModelManager](#custom-modelmanager)
  * [Components](#components)
    * [DisplayField](#displayfield)
    * [InputField](#inputfield)
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

You can easily access the data from a model instance or define model [fields](#fields).

```js
album.data
```

By using a common component [`DisplayField`](#displayfield) you can render the value of a field for display purpose anywhere in your application with the same output.
```js
<display-field :model="album" field-name="title"/>
```

## Usage

### BaseModel
A `BaseModel` can be used to handle data from any source by passing the data when instantiating the model.

```js
import {BaseModel, Field} from 'vue-service-model'

class MyModel extends BaseModel {
  // Definition of model fields (optional)
  static fieldsDef = {
    title: new Field()
  }
}

const obj = new MyModel({title: 'My title'})
```

Retrieve data of the model instance.
```js
obj.data // output: {title: 'My title'}
```

Retrieve value from a single field.
```js
// Retrieve value for field 'title'
await obj.val.title // output: My title
```

Set value of a field
```js
obj.val.title = 'New title'
```

#### Model fields (`fieldsDef`)

You can set your model fields with the static property `fieldsDef` with a plain object with your fieldname as key and the field instance as value. 
Nested `fieldsDef` is currently not supported.

```js
class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    first_name: new Field(),
    last_name: new Field()
  }
}

const myObj = new MyModel({
  first_name: 'Joe',
  last_name: 'Bloggs'
})

await myObj.val.first_name // output: Joe
await myObj.val.last_name // output: Bloggs
```

#### BaseModel API

```typescript
class BaseModel {
  // Constructor takes model data
  constructor (data: Dictionary<any> = {})

  // Data containing values
  public get data (): Dictionary<any>

  // Bound dictionary of fields by field name
  public get fields (): Dictionary<Field>

  // Getter with values to return data of model
  // Can be accessed as object (e.g. for field name 'description': val.description)
  //
  // Retrieve value of field title:
  // await obj.val.title
  // Set value of field title:
  // obj.val.title = 'New title'
  public get val (): Dictionary<any>

  // Return primary key of model instance or null if not set
  // Primary key field can be defined with FieldDef attribute 'primaryKey: true'
  public get pk (): string | number | null

  // Return field by name.
  // Throws NotDeclaredFieldException if field name is not in fields
  public getField (fieldName: string): Field
}
```

### ServiceModel

A `ServiceModel` extends from [`BaseModel`](#basemodel) and adds the [`ModelManager`](#modelmanager-objects) with a caching
store to keep track of [aggregation](#aggregation) of running requests and optionally caching the result of the services.

```js
import {ServiceModel, Field} from 'vue-service-model'

class Album extends ServiceModel {
  static urls = {
    BASE: 'https://jsonplaceholder.typicode.com/albums/'
  }

  // Duration to cache requested data in seconds. 0: no cache. null: Cache forever. Default is 30 seconds
  static cacheDuration = 5

  static fieldsDef = {
    id: new Field({primaryKey: true}),
    title: new Field()
  }
}
```

#### Urls

Urls are currently divided into 2 different types. `LIST` and `DETAIL` (same like in [Django REST framework](https://www.django-rest-framework.org/api-guide/routers/#simplerouter)).

* `LIST`: (e.g. `/albums/`) used for [`objects.list()`](#retrieve-list-of-data-objectslist)
* `DETAIL`: (e.g. `/albums/1/`) used for [`objects.detail(1)`](#retrieve-single-entry-of-data-objectsdetail)


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
  // {pk} will be replaced with your value you provide to objects.detail() 
  DETAIL: 'https://jsonplaceholder.typicode.com/albums/{pk}/'
}
```

There are currently 3 ways to define your url with the following priority
1. Overwrite `getListUrl` or `getDetailUrl` method and a return a `Promise` which will resolve the url as a string
1. Set the `LIST` or `DETAIL` url in your model `static urls = { LIST: <...>, DETAIL: <...> }`
1. Set the `BASE` url in your model `static urls = { BASE: <...> }`

If you got a nested RESTful service structure (e.g. `/albums/1/photos/`) have a look at [parents](#parents).



#### Aggregation

When you start to request data from a service, for example `Album.objects.detail('1')`, then the `Promise` of the request will 
be saved as long as the request has not been completed. So when requesting `Album.objects.detail('1')` again (e.g from another component)
this request will be attached to the first request which has not been completed yet and the request of the service will only made once.

In case you want to avoid the request aggregation for a specific request see [`noRequestAggregation`](#retrieveinterfaceparams) in [ModelManager RetrieveInterfaceParams](#retrieveinterfaceparams).

#### Cache

With the static property `cacheDuration` it is possible to set the duration (in seconds) of how long the result of a response 
should be cached. The default value is 30 seconds. Currently the expired data will only be removed by requesting the same data again.

* null: cache will not be removed
* 0: no caching

You can manually clear the complete cache including [aggregation](#aggregation) by calling `model.store.clear()`.

In case you want to set cache options for a specific request see [ModelManager RetrieveInterfaceParams](#retrieveinterfaceparams).

#### Parents

When using a nested RESTful service more information is necessary to uniquely identify a resource. You need to define `parentNames` in your `ServiceModel`.

```js
class Photo extends ServiceModel {
  [...]

  // Define name of parents
  static parentNames = ['album']

  static urls = {
    // Add placeholder for parent in your url
    BASE: 'https://jsonplaceholder.typicode.com/albums/{album}/photos/'
  }
}

// Retrieve all photos from album 1: /albums/1/photos/
const photos = await Photo.objects.list({parents: {album: 1}})

// Retrieve photo 2 from album 1: /albums/1/photos/2/
const photo = await Photo.objects.detail(2, {parents: {album: 1}})

// Access parents of photo
photo.parents
```

It is necessary to set exact parents otherwise a warning will be printed to the console. You can also add some custom
validation of the parents by extending the `checkServiceParents` method of your `ServiceModel`. This will be called on default [`ModelManager`](#modelmanager-objects) interfaces and when retrieving the service url from [`getListUrl`](#urls) or [`getDetailUrl`](#urls).

You can provide parents to your model instance via the constructor or manually set with `photo.parents = {album: 1}`.

#### ServiceModel API

```typescript
class ServiceModel {
  // Default URL definition for backend APIs
  // Fill either LIST/DETAIL or BASE url or use other urls by overwriting getListUrl/getDetailUrl
  protected static urls: {
    BASE: string | null
    LIST: string | null
    DETAIL: string | null
  }

  // List of parent names to be used in url
  // Required if using parents
  protected static parentNames: string[] = []

  // Duration to cache requested data in seconds. 0: no cache. null: Cache forever
  protected static cacheDuration: number | null = 30

  // Constructor optionally takes model data and/or parents
  constructor (data: Dictionary<any> = {}, parents: ServiceParent = {})

  // Returns instance of ServiceStore for caching
  public static get store (): ServiceStore

  // Function to return list url of model according to parents
  public static async getListUrl (parents?: ServiceParent): Promise<string>

  // Function to return detail url of model according to parents
  public static async getDetailUrl (pk: PrimaryKey, parents?: ServiceParent): Promise<string>

  // Returns instance of ModelManager
  public static get objects (): ModelManager

  // Return model parents 
  public get parents (): ServiceParent

  // Set deep copy of parents to model instance
  public set parents (parents: ServiceParent)
}
```

### Fields

#### Field definition

When instantiating a new field you can provide a specific definition for the field.

```js
class Album extends BaseModel {
  [...]

  static fieldsDef = {
    id: new Field({primaryKey: true}),
    title: new Field({label: 'Album title'})
  }
}
```

Field definition structure:
```js
{
  // String which key should be used to retrieve value from. See Attribute name for more information
  // Optional: default uses key from fieldsDef 
  attributeName: 'title',

  // Label of field. See Field label and hint for more information
  // Optional: Can either be a string, function or promise
  label: () => Promise.resolve('Title'),

  // Hint of field. See Field label and hint for more information
  // Optional: Can either be a string, function or promise
  hint: 'Title of album',

  // Boolean flag whether field is a primary key
  // Optional: default is false
  primaryKey: true
}
```

##### Attribute name (`attributeName`)

By default the key of your field in your `fieldsDef` (e.g. `first_name`) will be used to retrieve the value from the model data.
You can also set the `attributeName` when instantiating the field. It is also possible to access nested data when using dot-notation in `attributeName`.
If you need a more specific way to retrieve the value of a field from your data then have a look at [Custom/Computed fields](#customcomputed-fields).

```js
class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    name: new Field({attributeName: 'username'}),
    address_city: new Field({attributeName: 'address.city'}),
    address_street: new Field({attributeName: 'address.street.name'})
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

await myObj.val.name // output: joe_bloggs
await myObj.val.address_city // output: New York
await myObj.val.address_street // output: Fifth Avenue
```

##### Field label and hint (`label`, `hint`)

With the `label` property you can set a descriptive name for your field. `hint` is used to provide a detail description of your field. `label` and `hint` can either be a `string` or a `function` which should return a `string` or a `Promise`.
You can access your label/hint with the `label`/`hint` property of your field instance which will always return a `Promise`.

```js
class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    first_name: new Field({
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

#### Field API

```typescript
class Field {
  // Constructor takes field definition
  constructor (def: FieldDef)

  // Clone field instance
  public clone (): Field

  // Returns field name (Which has been set as key at fieldsDef.
  // Will throw FieldNotBoundException in case field has not been bound to a model
  public get name (): string

  // Returns either attributeName from fieldsDef or field name
  public get attributeName (): string

  // Returns field definition
  public get definition (): FieldDef

  // Assigned model
  // Will throw FieldNotBoundException in case field has not been bound to a model
  public get model (): BaseModel

  // Returns async field value from data by calling valueGetter with data of assigned model
  public get value (): any

  // Sets field value to model data by calling valueSetter with data of assigned model
  public set value (value: any)

  // Returns async field label from field definition
  public get label (): Promise<string>

  // Returns async field hint from field definition
  public get hint (): Promise<string>

  // Returns boolean whether field is a primary key
  public get isPrimaryKey (): boolean

  // Retrieve value from data structure according to attributeName
  // Uses nested syntax from attributeName (e.g. "address.city" -> {address: {city: 'New York'}})
  // Will return null if value is not available
  public valueGetter (data: any): any

  // Set value to data by using attributeName
  // Will create nested structure from attributeName (e.g. "address.city" -> {address: {city: 'New York'}})
  public valueSetter (value: any, data: Dictionary<any>): void

  // Display component to render when displaying value with <display-field/>
  // For more information see Field - Rendering 
  public get displayComponent (): Promise<ComponentModule>

  // Simple Vue render function when using default displayComponent when displaying value with <display-field/>
  // For more information see Field - Rendering 
  public displayRender (h: CreateElement, resolvedValue: any): VNode

  // Input component to render when showing input for field with <input-field/>
  // For more information see Field - Rendering 
  public get inputComponent (): Promise<ComponentModule>

  // Simple Vue render function when using default inputComponent for input of field value with <input-field/>
  // For more information see Field - Rendering 
  public inputRender (h: CreateElement, resolvedValue: any): VNode

}
```

#### Custom/Computed fields

In case you want to define your own field class you just need to extend from `Field`. By overwriting the `valueGetter` method you are able to map the field value by yourself and create computed values.

```js
class FullNameField extends Field {
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

await myObj.val.full_name // output: Joe Bloggs
```

#### Field types

Different field types will be added with future releases.

#### Rendering

By using the [`DisplayField`](#displayfield) component you can render the value of a field for displaying purpose
and [`InputField`](#inputfield) when you want to render the input component for this field.
To customize the different output which should be rendered you can either set a `displayRender`/`inputRender` or a custom `displayComponent`/`inputComponent`.

The `displayRender`/`inputRender` can be used for small changes of the output and is a simple render function (See [Vue.js render function](https://vuejs.org/v2/guide/render-function.html)).

```js
class RedTextField extends Field {
  // Render a red text for display
  displayRender (h, resolvedValue) {
    return h('span', {
      style: {
        color: 'red'
      }
    }, resolvedValue)
  }

  // Render an text input field for input
  inputRender (h, resolvedValue) {
    return h('input', {
      attrs: {
        type: 'text',
        value: resolvedValue
      },
      on: {
        input: (event) => {
          // Set input value to field.value
          this.value = event.target.value
        }
      }
    })
  }
}
```

In case you need to do more specific rendering you can also set your own component which will be rendered when using [`DisplayField`](#displayfield) on your custom field.
If you want to change the input component you can extend from `BaseInputFieldRender` and overwrite the `inputComponent` method of your field.
For easy usage with async values if recommend you to take a look at [vue-async-computed](https://github.com/foxbenjaminfox/vue-async-computed).

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
    asyncComputed: {
      fieldValue () {
        return this.field.value      
      }  
    }
  }
</script>
```

### ModelManager (`objects`)

The `ModelManager` provides the interface to perform the api requests. At the moment there are 2 default interface methods.

#### Retrieve list of data (`objects.list()`)

`objects.list()` is used to request a list of data (e.g. `/albums/`) and will return a list of model instances.
You can optionally set [`RetrieveInterfaceParams`](#retrieveinterfaceparams) as only argument.
The method will use [`getListUrl`](#urls), [`sendListRequest`](#custom-modelmanager) and [`mapListResponseBeforeCache`](#custom-modelmanager) which can be overwritten for customization.

Examples:
```js
Album.objects.list() // Request: GET /albums/
Photo.objects.list({parents: {album: 1}}) // Request: GET /albums/1/photos/
Album.objects.list({filter: {userId: 1}}) // Request: GET /albums/?userId=1
```

#### Retrieve single entry of data (`objects.detail()`)

`objects.detail()` is used to request a single entry (e.g. `/albums/1/`) and will return a model instance.
The first argument is the primary key which can either be a `string` or `number`. You can optionally set [`RetrieveInterfaceParams`](#retrieveinterfaceparams) as second argument.
The method will use [`getDetailUrl`](#urls), [`sendDetailRequest`](#custom-modelmanager) and [`mapDetailResponseBeforeCache`](#custom-modelmanager) which can be overwritten for customization.

Examples:
```js
Album.objects.detail(1) // Request: GET /albums/1/
Photo.objects.detail(5, {parents: {album: 1}}) // Request: GET /albums/1/photos/5/
```

#### Create single entry (`objects.create()`)

`objects.create()` is used to create a single entry under (e.g. `/albums/`) by sending a request with method `POST`.
You can provide your data you want to send with post as first argument. The method will use [`getListUrl`](#urls) and [`sendCreateRequest`](#custom-modelmanager).

Examples:
```js
Album.objects.create({title: 'New Album'}) // Request: POST /albums/
Photo.objects.create({title: 'New Photo'}, {parents: {album: 1}}) // Request: POST /albums/1/photos/
```

#### Update single entry (`objects.update()`)

`objects.update()` is used to update a single entry under (e.g. `/albums/1/`) by sending a request with method `PUT`.
The first argument is the primary key which can either be a `string` or `number`. You can provide your data you want to send with put as first argument.
The method will use [`getDetailUrl`](#urls) and [`sendUpdateRequest`](#custom-modelmanager).

Examples:
```js
Album.objects.update(1, {title: 'Updated Album'}) // Request: PUT /albums/1/
Photo.objects.update(5, {title: 'Updated Photo'}, {parents: {album: 1}}) // Request: PUT /albums/1/photos/5/
```

#### Delete single entry (`objects.delete()`)

`objects.delete()` is used to delete a single entry under (e.g. `/albums/1/`) by sending a request with method `DELETE`.
The method will use [`getDetailUrl`](#urls) and [`sendDeleteRequest`](#custom-modelmanager).

Examples:
```js
Album.objects.delete(1) // Request: DELETE /albums/1/
Photo.objects.delete(5, {parents: {album: 1}}) // Request: DELETE /albums/1/photos/5/
```

#### RetrieveInterfaceParams

With `RetrieveInterfaceParams` you can provide additional parameters for `objects.list()` and `objects.detail()` e.g. for using query parameters or [parents](#parents).

Full structure example:
```js
{
  // Optional service parents to handle nested RESTful services
  parents: {album: 1},

  // Filter params as plain object which will be converted to query parameters (params in axios)
  filter: {userId: 1},

  // Do not use and set response cache. Requests will still be aggregated.
  // Already cached data will not be cleared
  // Optional: default = false
  noCache: false,

  // Do not use request aggregation. Response will still be set and used from cache
  // Optional: default = false
  noRequestAggregation: false,

  // Cache will not be used but set. Requests will still be aggregated
  // Optional: default = false
  refreshCache: false
}
```

#### Exceptions

Error codes from response (e.g. 401 - Unauthorized) will be mapped to an `APIException`. You can catch a specific error by checking with `instanceof` for your required exception.

```js
import {APIException, UnauthorizedAPIException} from 'vue-service-model'

[...]

try {
  albums = await Album.objects.list()
} catch (error) {
  if (error instanceof UnauthorizedAPIException) {
    // Unauthorized
  } else if (error instanceof APIException) {
    // Any other HTTP error status code
  } else {
    // Other exceptions
    throw error  
  }
}
```

All API exceptions inherit from `APIException` and contain the response as property (`error.response`).

HTTP status code | Exception
---------------- | ------------
400 - Bad Request | `BadRequestAPIException`
401 - Unauthorized | `UnauthorizedAPIException`
403 - Forbidden | `ForbiddenAPIException`
404 - Not Found | `NotFoundAPIException`
500 - Internal Server Error | `InternalServerErrorAPIException`
Other | `APIException`

#### Custom ModelManager
  
You can extend the `ModelManager` and add your own methods.
```js
import {ModelManager} from 'vue-service-model'

class Album extends ServiceModel {
  [...]

  static ModelManager = class extends ModelManager {
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
  * Gets called when doing a list request with `objects.list()`
* `sendDetailRequest`
  * Gets called when doing a detail with `objects.detail()`
* `sendCreateRequest`
  * Gets called when sending a create with `objects.create()`
* `sendUpdateRequest`
  * Gets called when sending a update with `objects.update()`
* `sendDeleteRequest`
  * Gets called when sending a delete with `objects.delete()`
* `buildRetrieveRequestConfig`
  * Gets called from `sendListRequest` and `sendDetailRequest` and uses [`RetrieveInterfaceParams`](#retrieveinterfaceparams) to return the [request configuration](https://github.com/axios/axios#request-config) for [axios](https://github.com/axios/axios).
* `mapListResponseBeforeCache`
  * Gets called from `sendListRequest` with the response data before the data will be cached
* `mapDetailResponseBeforeCache`
  * Gets called from `sendDetailRequest` with the response data before the data will be cached
* `handleResponseError`
  * Receives Errors from `axios` and maps it to api exceptions

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

#### InputField

The `InputField` component is equal to the `DisplayField`. The input value will directly change the data of your model (using the `valueSetter`). 

```vue
<template>
  [...]
    <input-field :model="album" field-name="title"/>
  [...]
</template>

<script>
  import {InputField} from 'vue-service-model'

  export default {
    components: {InputField},
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
