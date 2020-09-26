# Fields

[[toc]]

A `Field` provides information and methods to work with your data. An information can be the label which is used to
display a name of the field for the user (e.g. as column header). A [`RenderableField`](/guide/fields.html#field-vs-renderablefield)
inherits from `Field` and additionally provides a handling to render to field value to the user or render an input field.

## Field definition

When instantiating a new field you can provide a specific definition for the field.

```js
class Album extends BaseModel {
  [...]

  static fieldsDef = {
    id: new Field({primaryKey: true}),
    title: new Field()
  }
}
```

Field definition structure:
```js
{
  // String which key should be used to retrieve value from.
  // See Attribute name for more information
  // Optional: default uses key from fieldsDef 
  attributeName: 'title',

  // Label of field. See Field label for more information
  // Optional: Can either be a string, function or promise
  label: () => Promise.resolve('Title'),

  // Boolean flag whether field is a primary key
  // Optional: default is false
  primaryKey: true,

  // Optional field type specific options.
  // Can either be an object, a function or a promise.
  // See field Types
  options: {}
}
```

### Attribute name (`attributeName`)

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

### Field label (`label`)

With the `label` property you can set a descriptive name for your field. The `label` can either be a `string` or a `function` which should return a `string` or a `Promise`.
You can access your label with the `label` property of your field instance which will always return a `Promise`.

```js
class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    first_name: new Field({
      label: 'First name'
    })
  }
}

[...]

const firstNameField = myObj.getField('first_name')

await firstNameField.label // output: First name
```

## Standalone Field

In some cases you just want to work with a single field and don't need a model.
So it is possible to create a standalone field by directly passing an initial value.

```js
// Pass initial value when creating a new instance
const myField = new Field({label: 'Description'}, {value: 'My description'})

await myField.value // output: My description
```

::: tip note
The value will be stored in a data object to keep the field reactive. Your can retrieve the data object with `myField.data`
:::

You can also directly pass a data object instead of an initial value

```js
const data = {description: 'My description'}
// Bind data when creating a new instance
const myField = new Field({attributeName: 'description'}, {data: data})

await myField.value // output: My description
```

You can also use the [components](/guide/components.html) to render your standalone field. Be sure to use a [`RenderableField`](/guide/fields.html#field-vs-renderablefield).

```vue
<template>
  [...]
    <display-field :field="myField"/>
  [...]
</template>
```

## Custom/Computed fields

In case you want to define your own field class you just need to extend from `Field`. By overwriting the `valueGetter` method you are able to map the field value by yourself and create computed values.

```js
class FullNameField extends Field {
  valueGetter (data) {
    return data ? `${data.first_name} ${data.last_name}` : null
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

## Value parsing

To avoid unexpected data types of your field value, then you should use the `setParseValue` method of your field. This will
ensure that your Field (e.g. `IntegerField`) always contains a `number`.

```js
// Set value without parsing
myIntegerField.value = '5'
// -> Field value will be string with value '5'

// Parse and set value
myIntegerField.setParseValue('5')
// -> Field value will be number with value 5
```

You can customize your parsing logic by overwriting the `valueParser`.

```js
class StringField extends Field {
  valueparser (rawValue) {
    return String(rawValue)
  }
}
```

## `Field` vs `RenderableField`

In case you don't need the rendering functions, then you can use the `Field` class and avoid unnecessary code which will make your bundle smaller.
The `RenderableField` provides additional methods like `displayRender` to allow rendering of the field.

## Rendering

::: warning
Be sure to use a field which inherits from [`RenderableField`](/guide/fields.html#field-vs-renderablefield). The default `Field` class does not support rendering.
:::

By using the [`DisplayField`](/guide/components.html#displayfield) component you can render the value of a field for displaying purpose
and [`InputField`](/guide/components.html#inputfield) when you want to render the input component for this field.
To customize the different output which should be rendered you can either set a `displayRender`/`inputRender` or a custom `displayComponent`/`inputComponent`.

The `displayRender`/`inputRender` can be used for small changes of the output and is a simple render function (See [Vue.js render function](https://vuejs.org/v2/guide/render-function.html)).

```js
class RedTextField extends RenderableField {
  // Render a red text for display
  displayRender (h, resolvedValue) {
    return h('span', {
      style: {
        color: 'red'
      }
    }, resolvedValue)
  }

  // Render an text input field for input
  inputRender (h, { value, inputProps }) {
    // Common input properties
    const { disabled, readonly } = inputProps

    return h('input', {
      attrs: {
        type: 'text',
        // Set current value to input
        value,
        // Implement common input properties
        disabled,
        readonly
      },
      on: {
        input: (event) => {
          // Parse and set input value to field.value
          this.setParseValue(event.target.value)
        }
      }
    })
  }
}
```

::: tip
In case you need to achieve more reactivity, then take a look at [Integration of `vue-async-computed`](/guide/installation.html#integration-of-vue-async-computed).
:::

### Resolving asynchronous values before rendering

In some cases you need to prepare or fetch other data before the field should be rendered. This can be done with the methods `prepareDisplayRender`/`prepareInputRender`.
They will be called before `displayRender`/`inputRender` and will give any async data to as 2. argument to them.

```js
class AlbumTitleField extends RenderableField {
  // Do any asynchronous operations before rendering with displayRender
  async prepareDisplayRender (renderProps) {
    const albumId = await this.value
    const album = await Album.objects.detail(albumId)
    return album.val.title
  }

  // Render the asynchronous fetched data
  // renderData will contain the value returned by prepareDisplayRender
  displayRender (h, renderData) {
    return h('span', renderData)
  }
}
```

::: tip
You can optionally use the `renderProps` argument which can be used to pass additional properties from [`DisplayField`](/guide/components.html#displayfield) component to [`prepareDisplayRender`](/guide/components.html#passing-additional-properties-to-preparedisplayrender)
:::

### Custom field component

In case you need to do more specific rendering you can also set your own component which will be rendered when using [`DisplayField`](/guide/components.html#displayfield) on your custom field.
If you want to change the input component you can extend from `BaseInputFieldRender` and overwrite the `inputComponent` method of your field.

```js
// CustomField.js
class CustomField extends RenderableField {
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
    data: () => ({
      fieldValue: null    
    }),
    created () {
      this.field.value.then(value => (this.fieldValue = value))      
    }
  }
</script>
```

To keep it simple and reactive you can install the package [`vue-async-computed`](https://github.com/foxbenjaminfox/vue-async-computed).
See [Integration of `vue-async-computed`](/guide/installation.html#integration-of-vue-async-computed).

```js
[...]

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
