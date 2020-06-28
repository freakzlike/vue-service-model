# Configuration API

```typescript
interface Config {
  /**
   * Use vue-async-computed function in components
   */
  useAsyncComputed?: boolean // Default: false

  /**
   * i18n translations
   * A TranslationKey can either be a string, a function returning a
   * string or a promise resolving a string 
   */
  i18n?: {
    no?: TranslationKey, // Default: No
    yes?: TranslationKey // Default: Yes
  }

  /**
   * Events
   */
  events?: {
    /**
     * Gets called on every ModelManager.sendDetailRequest
     */
    onSendDetailRequest?: (params: {
      modelManager: ModelManager,
      url: string,
      pk: PrimaryKey,
      params?: RetrieveInterfaceParams
    }) => void

    /**
     * Gets called on every ModelManager.sendListRequest
     */
    onSendListRequest?: (params: {
      modelManager: ModelManager,
      url: string,
      params?: RetrieveInterfaceParams
    }) => void

    /**
     * Gets called on every ModelManager.sendCreateRequest
     */
    onSendCreateRequest?: (params: {
      modelManager: ModelManager,
      url: string,
      data: any,
      params?: CreateInterfaceParams
    }) => void

    /**
     * Gets called on every ModelManager.sendUpdateRequest
     */
    onSendUpdateRequest?: (params: {
      modelManager: ModelManager,
      url: string,
      pk: PrimaryKey,
      data: any,
      params?: UpdateInterfaceParams
    }) => void

    /**
     * Gets called on every ModelManager.sendPartialUpdateRequest
     */
    onSendPartialUpdateRequest?: (params: {
      modelManager: ModelManager,
      url: string,
      pk: PrimaryKey,
      data: any,
      params?: UpdateInterfaceParams
    }) => void

    /**
     * Gets called on every ModelManager.sendDeleteRequest
     */
    onSendDeleteRequest?: (params: {
      modelManager: ModelManager,
      url: string,
      pk: PrimaryKey,
      params?: DeleteInterfaceParams
    }) => void

    /**
     * Gets called on every ModelManager.handleResponseError
     */
    onResponseError?: (params: {
      modelManager: ModelManager,
      error: any
    }) => void
  }
}
```
