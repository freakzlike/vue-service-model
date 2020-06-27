import { ModelManager } from './models/ModelManager'
import {
  PrimaryKey,
  RetrieveInterfaceParams,
  CreateInterfaceParams,
  UpdateInterfaceParams,
  DeleteInterfaceParams
} from './types/models/ModelManager'
import { LazyValue } from './types/LazyValue'

export type TranslationKey = LazyValue<string>

export interface Config {
  useAsyncComputed?: boolean

  /**
   * i18n translations
   */
  i18n?: {
    no?: TranslationKey,
    yes?: TranslationKey
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

export declare function setConfig (_config: Config): void

export declare function getConfig (): Config
