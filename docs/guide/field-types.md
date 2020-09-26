# Field types

[[toc]]


## CharField

A `CharField` uses a `valueFormatter` to format any value (except `undefined` and `null`) to a `string` for display purpose.

As input element a textbox will be rendered (equal to default `RenderableField` input).


## BooleanField

A `BooleanField` uses a `valueFormatter` to format any value to either 'Yes' or 'No'.
You can customize the translations in the [configuration](/guide/configuration.html#i18n-translations).

As input element a checkbox will be rendered.

In case you want to use other terms for example 'Active' and 'Inactive' you can overwrite the `valueFormatter`.

```js
import {BooleanField} from 'vue-service-model'

class ActiveStatusField extends BooleanField {
  async valueFormatter () {
    return await this.value ? 'Active' : 'Inactive'
  }
}
```


## IntegerField

A `IntegerField` uses a `valueFormatter` to format any value (except `undefined` and `null`) to a `string` for display purpose.

As input element a textbox with `type="number"` will be rendered and the input value will be parsed to an integer.


## DecimalField

A `DecimalField` uses a `valueFormatter` to format any value (except `undefined` and `null`) to a `string` for display purpose.

As input element a textbox with `type="number"` will be rendered and the input value will be parsed to an float with precision.
Depending on `options.decimalPlaces` the `step` attribute on the Input element will be set.

### Options

```js
new DecimalField({
  options: {
    // Set decimal places for DecimalField.
    // Which will result in step="0.01"
    decimalPlaces: 2
  }
})
```

## ForeignKeyField

A `ForeignKeyField` can be used to handle a relation to another [ServiceModel](/guide/service-model/).
The value is the primary key of your related model.

```js
import {ServiceModel, Field, CharField, ForeignKeyField} from 'vue-service-model'

class User extends ServiceModel {
  static urls = 'https://jsonplaceholder.typicode.com/users/'

  static fieldsDef = {
    id: new Field({primaryKey: true}),
    name: new CharField()
  }
}

class Album extends ServiceModel {
  static urls = 'https://jsonplaceholder.typicode.com/albums/'

  static fieldsDef = {
    user: new ForeignKeyField({
      options: {
        model: User, // Related model
        fieldName: 'name' // Related field which should be used for display and input
      }    
    })
  }
}
```

You need to define the related model in `options.model` which has to inherit from [ServiceModel](/guide/service-model/).
The `options.fieldName` is used for representation. When you use [`DisplayField`](/guide/components.html#displayfield) with a
`ForeignKeyField` (`user` field in `Album`) then will internally render the [`DisplayField`](/guide/components.html#displayfield)
with the field `name` of your `User` model.

```js
const album = new Album({
  user: 1 // Primary key of user
})

const user = await album.val.user // Request: GET ../users/1/
// user is now an instance of the ServiceModel User

await user.val.name // Output: Leanne Graham

// Change the assigned user by passing the primary key
album.val.user = 3
```

::: warning
When using the default provided `inputRender` method. Be sure to use a Field which can be represent to a `string` with a `valueFormatter` 
(e.g. `CharField`). 
:::

### Options

```js
new ForeignKeyField({
  options: {
    // Related model
    model: User,
    // Related field which should be used for display and input
    fieldName: 'name'
  }
})
```