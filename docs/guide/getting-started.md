# Getting started

For quick prototyping you can use this [Codepen example](https://codepen.io/freakzlike/pen/WNvWJXg) or checkout the [example project](https://github.com/freakzlike/vue-service-model-example).
[https://jsonplaceholder.typicode.com/albums/](https://jsonplaceholder.typicode.com/albums/) is being used as an example REST JSON service.

[[toc]]

## Installation

You can find more information about the installation [here](/guide/installation.html).

```sh
npm install vue-service-model vue vue-async-computed
```

## Defining your model

To declare your models create a class which extends from [`ServiceModel`](/guide/service-model.html).

```js
import {ServiceModel, Field} from 'vue-service-model'

class Album extends ServiceModel {
  // Define service url
  static urls = {
    BASE: 'https://jsonplaceholder.typicode.com/albums/'
  }

  // Define model fields
  static fieldsDef = {
    id: new Field({primaryKey: true}),
    title: new Field()
  }
}
```

Set your service url at `urls.BASE` which will be used when making common REST service requests.


At `fieldsDef` you can declare fields of your model as plain object where the key is your field name as key and the field instance as value.
With `primaryKey: true` the field `id` will be set as the primary key of your model and will be used to make requests.


## Working with your model

You can create a new instance of your model. At first argument you can optionally pass your model data.

```js
const album = new Album({id: 2, title: 'Album 2'})
```

To retrieve or set the complete model data you can use `album.data`.
```js
console.log(album.data) // {id: 2, title: 'Album 2'}

album.data = {id: 3, title: 'Album 3'}
```

In case you want to retrieve or set the value for a specific field you can use `album.val.<field-name>` where `<field-name>` is the name of your field (key provided in `fieldsDef`).

```js
console.log(await album.val.title) // 'Album 3'

album.val.title = 'New title'
```

To access the value of your primary key field use `album.pk`.
```js
console.log(album.pk) // 3
```

## Making service requests

There are currently 2 ways to make service requests. As static method without relation to a model instance (called `ModelManager`) or specific services of a model instance (like `update` or `delete`).
The `ModelManager` of a `ServiceModel` can be accessed by `Album.objects` and is used for every service request.

::: tip
* The response of `GET` requests will automatically be cached for 30 seconds
* Parallel requests will be aggregated
* To use the model instance methods it is required to set the primary key
:::

### Service interface

The following table shows a quick overview about the methods that can be used to make service requests 

| Url      | HTTP Method | ModelManager methods | Model instance methods |
| ------------ | ------ | -- | -- |
| /albums/      | GET    | `Album.objects.list()` |    |
| /albums/      | POST   | `Album.objects.create()` | `album.create()` |
| /albums/{pk}/ | GET    | `Album.objects.detail()` | `album.reload()` |
| /albums/{pk}/ | PUT    | `Album.objects.update()` | `album.update()` |
| /albums/{pk}/ | DELETE | `Album.objects.delete()` | `album.delete()` |

### Quick examples

::: details Retrieve list of model instances
```js
// Request: GET https://jsonplaceholder.typicode.com/albums/
const albums = await Album.objects.list()
// Response:
// [
//   {"id": 1, "title": "quidem molestiae enim"},
//   {"id": 2, "title": "sunt qui excepturi placeat culpa"},
//   ...
// ]

console.log(albums[0].data) // {"id": 1, "title": "quidem molestiae enim"}
console.log(albums[1].data) // {"id": 2, "title": "sunt qui excepturi placeat culpa"}
```
:::

::: details Retrieve single model instance
```js
// Request: GET https://jsonplaceholder.typicode.com/albums/1/
const album = await Album.objects.detail(1)
// Response:
// {"id": 1, "title": "quidem molestiae enim"},

console.log(album.data) // {"id": 1, "title": "quidem molestiae enim"}
console.log(album.pk) // 1

// Request: GET https://jsonplaceholder.typicode.com/albums/1/
album.reload()
// album.reload() will always refresh the cache
```
:::

::: details Creating new model instance
```js
// Request: POST https://jsonplaceholder.typicode.com/albums/
const album = new Album({title: 'New album'})
await album.create()

// Or without model instance
await Album.objects.create({title: 'New album'})
```
:::

::: details Updating a model instance
```js
// Request: PUT https://jsonplaceholder.typicode.com/albums/1/
album.val.title = 'New title'
await album.update()

// Or without model instance
await Album.objects.update(1, {title: 'New title'})
```
:::

::: details Deleting a model instance
```js
// Request: DELETE https://jsonplaceholder.typicode.com/albums/1/
await album.delete()

// Or without model instance
await Album.objects.delete(1)
```
:::

## Use components

To make it easy to render the value or an input element of a field you can use the `DisplayField` and the `InputField` component.
This is useful when having multiple field types (like numeric or boolean fields) so the value will be displayed user friendly and the correct input element will be rendered (e.g. a checkbox) .

```vue
<template>
  [...]
    <display-field :model="album" field-name="title"/>
    [...]
    <input-field :model="album" field-name="title"/>
  [...]
</template>

<script>
  import {DisplayField, InputField} from 'vue-service-model'

  export default {
    components: {DisplayField, InputField},
    data () {
      return {
        album: new Album({title: 'My album'})
      }  
    }
  }
</script>
```