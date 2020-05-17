# Field types

[[toc]]


## CharField

A `CharField` uses a `valueFormatter` to format any value (except `undefined` and `null`) to a `string` for display purpose.

As input element a textbox will be rendered (equal to default `Field` input).


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
