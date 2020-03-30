# ModelManager (`objects`)

[[toc]]

The `ModelManager` provides the interface to perform the api requests. At the moment there are 2 default interface methods.

## Retrieve list of data (`objects.list()`)

`objects.list()` is used to request a list of data (e.g. `/albums/`) and will return a list of model instances.
You can optionally set [`RetrieveInterfaceParams`](#retrieveinterfaceparams) as only argument.
The method will use [`getListUrl`](/guide/service-model.html#urls), [`sendListRequest`](#custom-modelmanager) and [`mapListResponseBeforeCache`](#custom-modelmanager) which can be overwritten for customization.

Examples:
```js
Album.objects.list() // Request: GET /albums/
Photo.objects.list({parents: {album: 1}}) // Request: GET /albums/1/photos/
Album.objects.list({filter: {userId: 1}}) // Request: GET /albums/?userId=1
```

## Retrieve single entry of data (`objects.detail()`)

`objects.detail()` is used to request a single entry (e.g. `/albums/1/`) and will return a model instance.
The first argument is the primary key which can either be a `string` or `number`. You can optionally set [`RetrieveInterfaceParams`](#retrieveinterfaceparams) as second argument.
The method will use [`getDetailUrl`](/guide/service-model.html#urls), [`sendDetailRequest`](#custom-modelmanager) and [`mapDetailResponseBeforeCache`](#custom-modelmanager) which can be overwritten for customization.

Examples:
```js
Album.objects.detail(1) // Request: GET /albums/1/
Photo.objects.detail(5, {parents: {album: 1}}) // Request: GET /albums/1/photos/5/
```

## Create single entry (`objects.create()`)

`objects.create()` is used to create a single entry under (e.g. `/albums/`) by sending a request with method `POST`.
You can provide your data you want to send with post as first argument. The method will use [`getListUrl`](/guide/service-model.html#urls) and [`sendCreateRequest`](#custom-modelmanager).

Examples:
```js
Album.objects.create({title: 'New Album'}) // Request: POST /albums/
Photo.objects.create({title: 'New Photo'}, {parents: {album: 1}}) // Request: POST /albums/1/photos/
```

## Update single entry (`objects.update()`)

`objects.update()` is used to update a single entry under (e.g. `/albums/1/`) by sending a request with method `PUT`.
The first argument is the primary key which can either be a `string` or `number`. You can provide your data you want to send with put as first argument.
The method will use [`getDetailUrl`](/guide/service-model.html#urls) and [`sendUpdateRequest`](#custom-modelmanager).

Examples:
```js
Album.objects.update(1, {title: 'Updated Album'}) // Request: PUT /albums/1/
Photo.objects.update(5, {title: 'Updated Photo'}, {parents: {album: 1}}) // Request: PUT /albums/1/photos/5/
```

## Delete single entry (`objects.delete()`)

`objects.delete()` is used to delete a single entry under (e.g. `/albums/1/`) by sending a request with method `DELETE`.
The method will use [`getDetailUrl`](/guide/service-model.html#urls) and [`sendDeleteRequest`](#custom-modelmanager).

Examples:
```js
Album.objects.delete(1) // Request: DELETE /albums/1/
Photo.objects.delete(5, {parents: {album: 1}}) // Request: DELETE /albums/1/photos/5/
```

## RetrieveInterfaceParams

With `RetrieveInterfaceParams` you can provide additional parameters for `objects.list()` and `objects.detail()` e.g. for using query parameters or [parents](/guide/service-model.html#parents).

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

## Exceptions

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

## Custom ModelManager
  
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
