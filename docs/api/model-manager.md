# ModelManager

```typescript
class ModelManager {
  // Retrieve specific model instance from service
  public async detail (pk: PrimaryKey, params?: RetrieveInterfaceParams): Promise<ServiceModel>

  // Retrieve list of model instances from service
  public async list (params?: RetrieveInterfaceParams): Promise<Array<ServiceModel>>

  // Create single instance
  public async create (data: any, params?: CreateInterfaceParams): Promise<any>

  // Update single instance
  public async update (pk: PrimaryKey, data: any, params?: UpdateInterfaceParams): Promise<any>

  // Delete single instance
  public async delete (pk: PrimaryKey, params?: DeleteInterfaceParams): Promise<null>

  // Build config for axios retrieve request
  // Gets called from `sendListRequest` and `sendDetailRequest` to return the request configuration for axios
  public async buildRetrieveRequestConfig (params?: RetrieveInterfaceParams): Promise<any>

  // Send actual detail service request and map data before caching
  // Gets called when doing a detail with objects.detail()
  public async sendDetailRequest (
    options: ServiceStoreOptions,
    url: string,
    pk: PrimaryKey,
    params?: RetrieveInterfaceParams
  ): Promise<ResponseData>

  // Map raw response data from detail service request before cache
  // Gets called from sendDetailRequest with the response data before the data will be cached
  public async mapDetailResponseBeforeCache (
    options: ServiceStoreOptions,
    data: Array<ResponseData>,
    url: string,
    pk: PrimaryKey,
    params?: RetrieveInterfaceParams
  ): Promise<ResponseData>

  // Send actual list service request and map data before caching
  // Gets called when doing a list request with objects.list()
  public async sendListRequest (
    options: ServiceStoreOptions,
    url: string,
    params?: RetrieveInterfaceParams
  ): Promise<Array<ResponseData>>

  // Map raw response data from list service request before cache
  // Gets called from sendListRequest with the response data before the data will be cached
  public async mapListResponseBeforeCache (
    options: ServiceStoreOptions,
    data: Array<ResponseData>,
    url: string,
    params?: RetrieveInterfaceParams
  ): Promise<Array<ResponseData>>

  // Send actual create (POST) service request
  // Gets called when doing a create request with objects.create()
  public async sendCreateRequest (url: string, data: any, params?: CreateInterfaceParams): Promise<any>

  // Send actual update (PUT) service request
  // Gets called when doing an update request with objects.update()
  public async sendUpdateRequest (url: string, pk: PrimaryKey, data: any, params?: UpdateInterfaceParams): Promise<any>

  // Send actual delete (DELETE) service request
  // Gets called when doing a delete request with objects.delete()
  public async sendDeleteRequest (url: string, pk: PrimaryKey, params?: DeleteInterfaceParams): Promise<null>

  // Receive error from service and map to api exceptions
  public async handleResponseError (error: any)
}
```