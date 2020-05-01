import { ModelManager } from './models/ModelManager'
import { PrimaryKey, RetrieveInterfaceParams } from './types/models/ModelManager'

export interface Config {
  events: {
    onSendDetailRequest?: (params: {
      modelManager: ModelManager,
      url: string,
      pk: PrimaryKey,
      params?: RetrieveInterfaceParams
    }) => void
  }
}

export declare const config: Config
