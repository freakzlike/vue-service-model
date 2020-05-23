# Fields API

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

  // Returns async field options with validation and default values depending on field type
  public get options (): Promise<FieldTypeOptions>

  // Validate field options and set default values depending on field type
  protected async validateOptions (options: FieldTypeOptions): Promise<FieldTypeOptions>

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

  // Async function to prepare before displayRender gets called
  // Can return any data which needs to be resolved for displayRender
  public async prepareDisplayRender (): Promise<any>

  // Simple Vue render function when using default displayComponent when displaying value with <display-field/>
  // For more information see Field - Rendering 
  public displayRender (h: CreateElement, renderData: any): VNode

  // Input component to render when showing input for field with <input-field/>
  // For more information see Field - Rendering 
  public get inputComponent (): Promise<ComponentModule>

  // Async function to prepare before inputRender gets called
  // Can return any data which needs to be resolved for inputRender
  public async prepareInputRender (): Promise<any>

  // Simple Vue render function when using default inputComponent for input of field value with <input-field/>
  // For more information see Field - Rendering 
  public inputRender (h: CreateElement, renderData: any): VNode

}
```
