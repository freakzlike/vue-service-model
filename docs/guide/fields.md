# Fields

[[toc]]

## Field definition

When instantiating a new field you can provide a specific definition for the field.

```js
class Album extends BaseModel {
  [...]

  static fieldsDef = {
    id: new Field({primaryKey: true}),
    title: new Field({label: 'Album title'})
  }
}
```

Field definition structure:
```js
{
  // String which key should be used to retrieve value from. See Attribute name for more information
  // Optional: default uses key from fieldsDef 
  attributeName: 'title',

  // Label of field. See Field label and hint for more information
  // Optional: Can either be a string, function or promise
  label: () => Promise.resolve('Title'),

  // Hint of field. See Field label and hint for more information
  // Optional: Can either be a string, function or promise
  hint: 'Title of album',

  // Boolean flag whether field is a primary key
  // Optional: default is false
  primaryKey: true
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

### Field label and hint (`label`, `hint`)

With the `label` property you can set a descriptive name for your field. `hint` is used to provide a detail description of your field. `label` and `hint` can either be a `string` or a `function` which should return a `string` or a `Promise`.
You can access your label/hint with the `label`/`hint` property of your field instance which will always return a `Promise`.

```js
class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    first_name: new Field({
      label: 'First name',
      hint: () => 'First name of the employee'
    })
  }
}

[...]

const firstNameField = myObj.getField('first_name')

await firstNameField.label // output: First name
await firstNameField.hint // output: First name of the employee
```

## Field API

```typescript
class Field {
  // Constructor takes field definition
  constructor (def: FieldDef)

  // Clone field instance
  public clone (): Field

  // Returns field name (Which has been set as key at fieldsDef.
  // Will throw FieldNotBoundException in case field has not been bound to a model
  public get name (): string

  // Returns either attributeName from fieldsDef or field name
  public get attributeName (): string

  // Returns field definition
  public get definition (): FieldDef

  // Assigned model
  // Will throw FieldNotBoundException in case field has not been bound to a model
  public get model (): BaseModel

  // Returns async field value from data by calling valueGetter with data of assigned model
  public get value (): any

  // Sets field value to model data by calling valueSetter with data of assigned model
  public set value (value: any)

  // Returns async field label from field definition
  public get label (): Promise<string>

  // Returns async field hint from field definition
  public get hint (): Promise<string>

  // Returns boolean whether field is a primary key
  public get isPrimaryKey (): boolean

  // Retrieve value from data structure according to attributeName
  // Uses nested syntax from attributeName (e.g. "address.city" -> {address: {city: 'New York'}})
  // Will return null if value is not available
  public valueGetter (data: any): any

  // Set value to data by using attributeName
  // Will create nested structure from attributeName (e.g. "address.city" -> {address: {city: 'New York'}})
  public valueSetter (value: any, data: Dictionary<any>): void

  // Display component to render when displaying value with <display-field/>
  // For more information see Field - Rendering 
  public get displayComponent (): Promise<ComponentModule>

  // Simple Vue render function when using default displayComponent when displaying value with <display-field/>
  // For more information see Field - Rendering 
  public displayRender (h: CreateElement, resolvedValue: any): VNode

  // Input component to render when showing input for field with <input-field/>
  // For more information see Field - Rendering 
  public get inputComponent (): Promise<ComponentModule>

  // Simple Vue render function when using default inputComponent for input of field value with <input-field/>
  // For more information see Field - Rendering 
  public inputRender (h: CreateElement, resolvedValue: any): VNode

}
```

## Custom/Computed fields

In case you want to define your own field class you just need to extend from `Field`. By overwriting the `valueGetter` method you are able to map the field value by yourself and create computed values.

```js
class FullNameField extends Field {
  valueGetter (data) {
    return data ? data.first_name + ' ' + data.last_name : null
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

## Field types

Different field types will be added with future releases.

## Rendering

By using the [`DisplayField`](#displayfield) component you can render the value of a field for displaying purpose
and [`InputField`](#inputfield) when you want to render the input component for this field.
To customize the different output which should be rendered you can either set a `displayRender`/`inputRender` or a custom `displayComponent`/`inputComponent`.

The `displayRender`/`inputRender` can be used for small changes of the output and is a simple render function (See [Vue.js render function](https://vuejs.org/v2/guide/render-function.html)).

```js
class RedTextField extends Field {
  // Render a red text for display
  displayRender (h, resolvedValue) {
    return h('span', {
      style: {
        color: 'red'
      }
    }, resolvedValue)
  }

  // Render an text input field for input
  inputRender (h, resolvedValue) {
    return h('input', {
      attrs: {
        type: 'text',
        value: resolvedValue
      },
      on: {
        input: (event) => {
          // Set input value to field.value
          this.value = event.target.value
        }
      }
    })
  }
}
```

In case you need to do more specific rendering you can also set your own component which will be rendered when using [`DisplayField`](/guide/components.html#displayfield) on your custom field.
If you want to change the input component you can extend from `BaseInputFieldRender` and overwrite the `inputComponent` method of your field.
For easy usage with async values if recommend you to take a look at [vue-async-computed](https://github.com/foxbenjaminfox/vue-async-computed).

```js
// CustomField.js
class CustomField extends Field {
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
    asyncComputed: {
      fieldValue () {
        return this.field.value      
      }  
    }
  }
</script>
```