# Guide

## Installation

`vue-service-model` requires [`Vue.js`](https://vuejs.org/) and [`vue-async-computed`](https://github.com/foxbenjaminfox/vue-async-computed) as dependencies.

### NPM:
```sh
npm install vue-service-model vue vue-async-computed
```

### Yarn:
```sh
yarn add vue-service-model vue vue-async-computed
```

### CDN:
```html
<!-- dependencies -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-async-computed/dist/vue-async-computed.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/vue-service-model/dist/vue-service-model.min.js"></script>
```

For production you should use a specific versions to avoid unexpected changes.
```html
<script src="https://cdn.jsdelivr.net/npm/vue-service-model@0.9.0/dist/vue-service-model.min.js"></script>
```

::: warning
When using CDN you need to access from `VueServiceModel`. E.g:
```js
class MyModel extends VueServiceModel.ServiceModel {
  [...]
}
```
:::


## Example

[Codepen example](https://codepen.io/freakzlike/pen/WNvWJXg)
[Example project](https://github.com/freakzlike/vue-service-model-example)

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

// Reloading model data from service
await album.reload()
```

You can also define [fields](/guide-old/fields.html) for your model.

```js
class Album extends ServiceModel {
  [...]

  static fieldsDef = {
    id: new Field({primaryKey: true}),
    title: new Field()
  }
}

const album = await Album.objects.detail(1)

// Retrieve primary key
album.pk // Output: 1

// Retrieve value for field title
await album.val.title // Output: Album title
```

If you want to create, update or delete your backend data you can use the following methods.

### Create
```js
// Create new album directly
await Album.objects.create({title: 'New album'})

// Or create by calling .create on model instance
const album = new Album({title: 'New album'})
await album.create()
```

### Update
```js
// Update an album
await Album.objects.update(1, {title: 'Updated album'})

// Or update by calling .update on model instance
album.val.title = 'Updated album'
await album.update()
```

::: tip
You can also use `.save()` for create or update. It will call `.create()` if no primary key if set.
Otherwise `.update()` will be called. 
:::

### Delete
```js
// Delete specific album
await Album.objects.delete(1)

// Delete current album instance
await album.delete()
```

### Rendering

By using a common component [`DisplayField`](/guide-old/components.html#displayfield) you can render the value of a field for display purpose anywhere in your application with the same output.
```vue
<display-field :model="album" field-name="title"/>
```

Or [`InputField`](/guide-old/components.html#inputfield) for an input field.

```vue
<input-field :model="album" field-name="title"/>
```

## Content:
* [BaseModel](/guide-old/base-model/)
* [ServiceModel](/guide-old/service-model/)
* [Fields](/guide-old/fields/)
* [ModelManager](/guide-old/model-manager/)
* [Components](/guide-old/components/)
