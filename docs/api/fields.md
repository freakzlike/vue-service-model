# Fields API

```typescript
class Field {
  // Constructor takes field definition
  constructor (def: FieldDef, fieldBind?: FieldBind)

  // Clone field instance
  public clone (): Field

  // Returns field name (Which has been set as key at fieldsDef.
  // Will throw FieldNotBoundException in case field has not been bound
  public get name (): string

  // Returns either attributeName from FieldDef or field name
  public get attributeName (): string

  // Returns field definition
  public get definition (): FieldDef

  // Assigned model
  // Will throw FieldNotBoundException in case field has not been bound to a model
  public get model (): BaseModel

  // Return bound data or data from bound model
  // Will throw FieldNotBoundException if field is not bound to data or model 
  public get data (): Dictionary<any>

  // Property mapper for getValue()
  public get value (): any

  // Returns async field value from data by calling valueGetter with data of assigned model
  public async getValue (): Promise<any>

  // Property mapper for setValue()
  public set value (value: any)

  // Sets field value to model data by calling valueSetter with data of assigned model
  public setValue (value: any): void

  // Parses raw value with valueParser and sets field value by calling valueSetter
  public async setParseValue (rawValue: any): Promise<any>

  // Returns async field label from field definition
  public get label (): Promise<string>

  // Returns async field options with validation and default values depending on field type
  public get options (): Promise<FieldTypeOptions>

  // Validate field options and set default values depending on field type
  protected async validateOptions (options: FieldTypeOptions): Promise<FieldTypeOptions>

  // Returns boolean whether field is a primary key
  public get isPrimaryKey (): boolean

  // Returns boolean whether attribute is an nested data structure
  public get isNestedAttribute (): boolean

  // Retrieve value from data structure according to attributeName
  // Uses nested syntax from attributeName (e.g. "address.city" -> {address: {city: 'New York'}})
  // Will return null if value is not available
  public valueGetter (data: any): any

  // Set value to data by using attributeName
  // Will create nested structure from attributeName (e.g. "address.city" -> {address: {city: 'New York'}})
  public valueSetter (value: any, data: Dictionary<any>): void

  // Parse a raw value and return the parsed value with valid data type
  public async valueParser (rawValue: any): Promise<any>

  // Map value from a data structure to another data structure.
  // Uses valueGetter and valueSetter
  public mapFieldValue (fromData: Dictionary<any>, toData: Dictionary<any>): void
}
```

## RenderableField

```typescript
class RenderableField extends Field {
  // Display component to render when displaying value with <display-field/>
  // For more information see Field - Rendering 
  public get displayComponent (): Promise<ComponentModule>

  // Async function to prepare before displayRender gets called
  // Can return any data which needs to be resolved for displayRender
  // renderProps can be passed from DisplayField component 
  public async prepareDisplayRender (renderProps?: object | null): Promise<any>

  // Simple Vue render function when using default displayComponent when displaying value with <display-field/>
  // For more information see Field - Rendering 
  public displayRender (h: CreateElement, renderData: any): VNode

  // Input component to render when showing input for field with <input-field/>
  // For more information see Field - Rendering 
  public get inputComponent (): Promise<ComponentModule>

  // Async function to prepare before inputRender gets called
  // Can return any data which needs to be resolved for inputRender
  // renderProps can be passed from InputField component
  public async prepareInputRender (inputProps: InputProps, renderProps?: object | null): Promise<InputRenderData>

  // Simple Vue render function when using default inputComponent for input of field value with <input-field/>
  // For more information see Field - Rendering 
  public inputRender (h: CreateElement, renderData: InputRenderData): VNode
}
```

## FieldDef

```typescript
interface FieldDef {
  // String which key should be used to retrieve value from.
  // See Attribute name for more information
  // Optional: default uses key from fieldsDef
  attributeName?: string

  // Label of field. See Field label for more information
  // Optional: Can either be a string, function or promise
  label?: LazyValue<string>

  // Boolean flag whether field is a primary key
  // Optional: default is false
  primaryKey?: boolean

  // Optional field type specific options.
  // Can either be an object, a function or a promise.
  // See field Types
  options?: LazyValue<FieldTypeOptions>
}
```

## FieldBind

```typescript
interface FieldBind {
  // Field name which has been set as key at fieldsDef
  name?: string

  // Model to bind field to
  // Beware of manual bind your field to a model afterwards.
  // The field will not be available by model.fields or model.getField()
  model?: BaseModel

  // Data to retrieve field value from
  // If not set then model.data will be used
  data?: Dictionary<any>

  // Value which should be bound to field
  // When using value then model and data will be ignored
  // A custom data object will be created to keep the field reactive
  value?: any
}
```

## InputProps

```typescript
interface InputProps {
  // Input flag for disabled input
  disabled: boolean

  // Input flag for readonly input
  readonly: boolean
}
```

## InputRenderData

```typescript
interface InputRenderData {
  // Resolved value of field
  value: any

  // Input properties
  inputProps: InputProps
}
```