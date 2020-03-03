import { Module } from 'vuex/types'

export interface RootState {
}

export interface DefaultState {
}

export interface DefaultModule<S> extends Module<S, RootState> {
}
