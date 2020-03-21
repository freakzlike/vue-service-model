import { CreateElement, VNode } from 'vue'
import { ComponentModule } from '../components'

export * from 'js-service-model/lib/types/fields/Field'

export interface FieldMixinInterface {
  displayComponent: Promise<ComponentModule>

  displayRender (h: CreateElement, resolvedValue: any): VNode
}
