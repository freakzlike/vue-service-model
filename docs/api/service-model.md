# ServiceModel API

```typescript
class ServiceModel extends BaseModel {
  // Default URL definition for backend APIs
  // Fill either LIST/DETAIL or BASE url or use other urls by overwriting getListUrl/getDetailUrl
  protected static urls: {
    BASE: string | null
    LIST: string | null
    DETAIL: string | null
  }

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

  // Reload model data from service. Overwrites changes made to model data
  // Returns true if successful
  public async reload (): Promise<boolean>
}
```