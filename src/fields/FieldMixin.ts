import { CreateElement, VNode } from 'vue'
import { ComponentModule } from '../types/components'
import { Field as jsField } from 'js-service-model'
import { FieldMixinInterface } from '../types/fields/Field'
import { FieldBind, FieldDef } from 'js-service-model/lib/types/fields/Field'

export type FieldMixin = (superclass: typeof jsField) => new(def?: FieldDef, fieldBind?: FieldBind) => jsField

export const FieldMixin: FieldMixin = (superclass) => class extends superclass implements FieldMixinInterface {
  get displayComponent (): Promise<ComponentModule> {
    return import('../components/BaseDisplayFieldRender')
  }

  displayRender (h: CreateElement, resolvedValue: any): VNode {
    return h('span', resolvedValue)
  }
}
