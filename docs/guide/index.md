# Guide

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

You can also define [fields](/guide/fields.html) for your model.

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

By using a common component [`DisplayField`](/guide/components.html#displayfield) you can render the value of a field for display purpose anywhere in your application with the same output.
```vue
<display-field :model="album" field-name="title"/>
```

Or [`InputField`](/guide/components.html#inputfield) for an input field.

```vue
<input-field :model="album" field-name="title"/>
```

## Content:
* [BaseModel](/guide/base-model/)
* [ServiceModel](/guide/service-model/)
* [Fields](/guide/fields/)
* [ModelManager](/guide/model-manager/)
* [Components](/guide/components/)
