# ServiceModel

[[toc]]

A `ServiceModel` extends from [`BaseModel`](/guide/base-model/) and adds the [`ModelManager`](/guide/model-manager/) with a caching
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

## Urls

Urls are currently divided into 2 different types. `LIST` and `DETAIL` (same like in [Django REST framework](https://www.django-rest-framework.org/api-guide/routers.html#simplerouter)).

* `LIST`: (e.g. `/albums/`) used for [`objects.list()`](/guide/model-manager.html#retrieve-list-of-data-objectslist)
* `DETAIL`: (e.g. `/albums/1/`) used for [`objects.detail(1)`](/guide/model-manager.html#retrieve-single-entry-of-data-objectsdetail)


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



## Aggregation

When you start to request data from a service, for example `Album.objects.detail('1')`, then the `Promise` of the request will 
be saved as long as the request has not been completed. So when requesting `Album.objects.detail('1')` again (e.g from another component)
this request will be attached to the first request which has not been completed yet and the request of the service will only made once.

In case you want to avoid the request aggregation for a specific request see [`noRequestAggregation`](/guide/model-manager.html#retrieveinterfaceparams) in [ModelManager RetrieveInterfaceParams](/guide/model-manager.html#retrieveinterfaceparams).

## Cache

With the static property `cacheDuration` it is possible to set the duration (in seconds) of how long the result of a response 
should be cached. The default value is 30 seconds. Currently the expired data will only be removed by requesting the same data again.

* null: cache will not be removed
* 0: no caching

You can manually clear the complete cache including [aggregation](#aggregation) by calling `model.store.clear()`.

In case you want to set cache options for a specific request see [ModelManager RetrieveInterfaceParams](/guide/model-manager.html#retrieveinterfaceparams).

By default the response of a list request will not be cached.

## Parents

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
validation of the parents by extending the `checkServiceParents` method of your `ServiceModel`. This will be called on default [`ModelManager`](/guide/model-manager/) interfaces and when retrieving the service url from [`getListUrl`](#urls) or [`getDetailUrl`](#urls).

You can provide parents to your model instance via the constructor or manually set with `photo.parents = {album: 1}`.
