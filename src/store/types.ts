import { Module } from 'vuex/types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RootState {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DefaultState {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DefaultModule<S> extends Module<S, RootState> {
}
