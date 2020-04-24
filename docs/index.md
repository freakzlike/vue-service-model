---
home: true
heroImage: /logo.png
heroText: vue-service-model
tagline: Vue.js Library for handling REST service requests with caching, aggregation and model definitions.
actionText: Get Started →
actionLink: /guide/getting-started/
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

## Examples

* [Codepen example](https://codepen.io/freakzlike/pen/WNvWJXg)
* [Example project](https://github.com/freakzlike/vue-service-model-example)

Definition of a simple `ServiceModel` without using fields. https://jsonplaceholder.typicode.com/albums/ is being used as an example REST JSON service.
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

// Retrieve all albums from /albums/
const allAlbums = await Album.objects.list()

// Retrieve specific album from /albums/1/
const album = await Album.objects.detail(1)

// Retrieve value for field title
await album.val.title // Output: Album title

// Set new title for album
album.val.title = 'Updated album'

// Update album by doing a PUT request to /albums/1/
await album.update()
```

### Mapping of service URLs to vue-service-model methods

| Url      | HTTP Method | vue-service-model methods |
| ------------ | ------ | ---- |
| /albums/      | GET    | `Album.objects.list()` |
| /albums/      | POST   | `Album.objects.create()` or `album.create()` |
| /albums/{pk}/ | GET    | `Album.objects.detail()` or `album.reload()` |
| /albums/{pk}/ | PUT    | `Album.objects.update()` or `album.update()` |
| /albums/{pk}/ | DELETE | `Album.objects.delete()` or `album.delete()` |


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
