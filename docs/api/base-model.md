# BaseModel API

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

  // Return unbound static field by name.
  // Throws NotDeclaredFieldException if field name is not in fields
  public static getField (fieldName: string): Field

  // Return bound field by name.
  // Throws NotDeclaredFieldException if field name is not in fields
  public getField (fieldName: string): Field
}
```