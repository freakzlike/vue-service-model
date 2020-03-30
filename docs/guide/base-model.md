# BaseModel

[[toc]]

A `BaseModel` can be used to handle data from any source by passing the data when instantiating the model.

```js
import {BaseModel, Field} from 'vue-service-model'

class MyModel extends BaseModel {
  // Definition of model fields (optional)
  static fieldsDef = {
    title: new Field()
  }
}

const obj = new MyModel({title: 'My title'})
```

Retrieve data of the model instance.
```js
obj.data // output: {title: 'My title'}
```

Retrieve value from a single field.
```js
// Retrieve value for field 'title'
await obj.val.title // output: My title
```

Set value of a field
```js
obj.val.title = 'New title'
```

## Model fields (`fieldsDef`)

You can set your model fields with the static property `fieldsDef` with a plain object with your fieldname as key and the field instance as value. 
Nested `fieldsDef` is currently not supported.

```js
class MyModel extends BaseModel {
  [...]

  static fieldsDef = {
    first_name: new Field(),
    last_name: new Field()
  }
}

const myObj = new MyModel({
  first_name: 'Joe',
  last_name: 'Bloggs'
})

await myObj.val.first_name // output: Joe
await myObj.val.last_name // output: Bloggs
```

## BaseModel API

```typescript
class BaseModel {
  // Constructor takes model data
  constructor (data: Dictionary<any> = {})

  // Data containing values
  public get data (): Dictionary<any>
  public set data (value: Dictionary<any>)

  // Bound dictionary of fields by field name
  public get fields (): Dictionary<Field>

  // Getter with values to return data of model
  // Can be accessed as object (e.g. for field name 'description': val.description)
  //
  // Retrieve value of field title:
  // await obj.val.title
  // Set value of field title:
  // obj.val.title = 'New title'
  public get val (): Dictionary<any>

  // Return primary key of model instance or null if not set
  // Primary key field can be defined with FieldDef attribute 'primaryKey: true'
  public get pk (): string | number | null

  // Return field by name.
  // Throws NotDeclaredFieldException if field name is not in fields
  public getField (fieldName: string): Field
}
```