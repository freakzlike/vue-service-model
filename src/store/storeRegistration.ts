import store from '@/store'
import { DefaultModule } from '@/store/types'

const registeredStores: Array<string> = []

const registerStore = (name: string, module: DefaultModule<any>) => {
  if (registeredStores.indexOf(name) === -1) {
    store.registerModule(name, module)
  }
}

export { registerStore }
