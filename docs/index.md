---
home: true
heroImage: /logo.png
heroText: vue-service-model
tagline: Vue.js Library for handling REST service requests with caching, aggregation and model definitions.
actionText: Get Started →
actionLink: /guide-old/
features:
- title: Model definitions
  details: Define your backend REST services as models and use them for simple usage in your frontend.
- title: Service requests
  details: Reduce your service request load with request caching and aggregation.
- title: Field rendering
  details: Define the display and input rendering of your fields at one point and receive consistent representation of your fields.
footer: MIT Licensed | Copyright © 2020-present Freakzlike
---

[![Build](https://github.com/freakzlike/vue-service-model/workflows/Build/badge.svg)](https://github.com/freakzlike/vue-service-model/actions)
[![codecov](https://codecov.io/gh/freakzlike/vue-service-model/branch/master/graph/badge.svg)](https://codecov.io/gh/freakzlike/vue-service-model)
[![Package Quality](https://npm.packagequality.com/shield/vue-service-model.svg)](https://packagequality.com/#?package=vue-service-model)
[![Latest Version](https://img.shields.io/npm/v/vue-service-model.svg)](https://www.npmjs.com/package/vue-service-model)
[![License](https://img.shields.io/npm/l/vue-service-model.svg)](https://github.com/freakzlike/vue-service-model/blob/master/LICENSE)

## Installation
```sh
npm install vue-service-model
```

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

### Rendering:

By using a common component [`DisplayField`](/guide-old/components.html#displayfield) you can render the value of a field for display purpose anywhere in your application with the same output.
```vue
<display-field :model="album" field-name="title"/>
```

Or [`InputField`](/guide-old/components.html#inputfield) for an input field.

```vue
<input-field :model="album" field-name="title"/>
```


## Contribution

Feel free to create an issue for bugs, feature requests, suggestions or any idea you have. You can also add a pull request with your implementation.

It would please me to hear from your experience.

I used some ideas and names from [django](https://www.djangoproject.com/), [django REST framework](https://www.django-rest-framework.org/), [ag-Grid](https://www.ag-grid.com/) and other libraries and frameworks.
