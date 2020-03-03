import Vue from 'vue'
import Dictionary from '../types/Dictionary'
import { ActionTree, MutationTree } from 'vuex/types'
import { DefaultModule, DefaultState, RootState } from '../store/types'

/**
 * Internal cached data structure
 */
interface ServiceStoreStateData {
  /**
   * Contains UNIX Timestamp when the cache will expire
   */
  expires?: number;
  /**
   * Actual cached data
   */
  data: any;
}

/**
 * Interface for state
 */
interface ServiceStoreState extends DefaultState {
  /**
   * Dictionary of cached data structure by options.key
   */
  _data: Dictionary<ServiceStoreStateData>;
  /**
   * Dictionary of started requests by options.key
   */
  _requests: Dictionary<Promise<any>>;
  /**
   * Default cache duration in seconds.
   * 0: no cache
   * null: Cache does not expire
   */
  cacheDuration: number | null;
}

/**
 * Interface for input options
 */
interface ServiceStoreOptions {
  /**
   * key to identify equal requests and data from cache
   */
  key: string;
  /**
   * Callback to perform actual service request. Should return result data which will be cached
   */
  sendRequest: (options: ServiceStoreOptions, ...args: Array<any>) => Promise<any>;
  /**
   * Additional arguments for the sendRequest callback
   */
  args?: Array<any>;
}

type ServiceStore = DefaultModule<ServiceStoreState>

/**
 * Factory to create ServiceStore
 */
const ServiceStoreFactory = (cacheDuration: number | null): ServiceStore => {
  /**
   * Default state
   */
  const state: () => ServiceStoreState = () => ({
    _data: {},
    _requests: {},
    cacheDuration
  })

  /**
   * actions
   */
  const actions: ActionTree<ServiceStoreState, RootState> = {
    /**
     * Get data of options.key either from cache or by calling options.sendRequest
     * @param {state, dispatch}
     * @param options
     */
    async getData ({ state, dispatch }, options: ServiceStoreOptions): Promise<any> {
      const key = options.key

      // Retrieve data from cache
      if (Object.prototype.hasOwnProperty.call(state._data, key)) {
        const data = state._data[key]
        // Cache expired
        if (!data.expires || data.expires > Date.now()) {
          return data.data
        }
      }

      return dispatch('loadData', options)
    },

    /**
     * Loads data by calling options.sendRequest. If request of same key has already started return attach to this request
     * @param {state, dispatch}
     * @param options
     */
    async loadData ({ state, commit }, options: ServiceStoreOptions): Promise<any> {
      const key = options.key

      // Request with key has already been started
      if (Object.prototype.hasOwnProperty.call(state._requests, key) && state._requests[key] !== null) {
        return state._requests[key]
      }

      // Actual request and save result in cache
      const request = options.sendRequest(options, ...(options.args || [])).then(data => {
        commit('_setData', { data, key })

        return data
      })

      commit('_setRequest', { request, key })
      return request
    }
  }

  /**
   * mutations
   */
  const mutations: MutationTree<ServiceStoreState> = {
    /**
     * Save data in cache if required
     * @param state
     * @param {data, key}
     * @private
     */
    _setData (state: ServiceStoreState, { data, key }: { data: Dictionary<any>; key: string }) {
      if (state.cacheDuration !== 0) {
        const _data: ServiceStoreStateData = { data }

        if (state.cacheDuration !== null) {
          _data.expires = Date.now() + (state.cacheDuration * 1000)
        }

        Vue.set(state._data, key, _data)
      }

      Vue.delete(state._requests, key)
    },

    /**
     * Save started request promise
     * @param state
     * @param {request, key}
     * @private
     */
    _setRequest (state, { request, key }: { request: Promise<any>; key: string }) {
      Vue.set(state._requests, key, request)
    },

    /**
     * Clean up data and remove expired cache
     * @param state
     */
    clean (state) {
      let key
      const expiredTime = Date.now()
      for (key of Object.keys(state._data)) {
        const expires = state._data[key].expires
        if (expires && expires < expiredTime) {
          Vue.delete(state._data, key)
        }
      }
    }
  }

  return {
    namespaced: true,
    state,
    actions,
    mutations
  }
}

export { ServiceStoreFactory, ServiceStore, ServiceStoreOptions }
