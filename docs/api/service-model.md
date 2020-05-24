# ServiceModel API

```typescript
class ServiceModel extends BaseModel {
  // Default URL definition for backend APIs
  // Fill either LIST/DETAIL or BASE url or use other urls by overwriting getListUrl/getDetailUrl
  // Can be set as string which is equal to { BASE: ... }
  protected static urls: {
    BASE: string | null
    LIST: string | null
    DETAIL: string | null
  } | string

  // List of parent names to be used in url
  // Required if using parents
  protected static parentNames: string[] = []

  // Duration to cache requested data in seconds. 0: no cache. null: Cache forever
  protected static cacheDuration: number | null = 30

  // Constructor optionally takes model data and/or parents
  constructor (data: Dictionary<any> = {}, parents: ServiceParent = {})

  // Returns instance of ServiceStore for caching
  public static get store (): ServiceStore

  // Function to return list url of model according to parents
  public static async getListUrl (parents?: ServiceParent): Promise<string>

  // Function to return detail url of model according to parents
  public static async getDetailUrl (pk: PrimaryKey, parents?: ServiceParent): Promise<string>

  // Returns instance of ModelManager
  public static get objects (): ModelManager

  // Return model parents 
  public get parents (): ServiceParent

  // Set deep copy of parents to model instance
  public set parents (parents: ServiceParent)

  // Map data by field names for partial updates
  public async mapPartialUpdateFields (data: Dictionary<any>, updateFields: string[]): Promise<Dictionary<any>>

  // Reload model data from service. Overwrites changes made to model data
  // Returns true if successful
  public async reload (): Promise<boolean>

  // Call either .create() or .update() by checking whether primary key is set or not
  // Returns true if create has been called
  public async save (): Promise<boolean>

  // Create current model instance by calling objects.create().
  // Updates model data from response if set
  // Returns true if create has been called
  public async create (): Promise<boolean>

  // Update current model instance by calling objects.update()
  // Updates model data from response if set
  // Returns true if successful
  public async update (): Promise<boolean>

  // Delete current model from service by calling objects.delete()
  // Returns true if successful
  public async delete (): Promise<boolean>
}
```