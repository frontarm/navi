import { RouterConfig } from "./RouterConfig"

export type AsyncObjectContainer<T> = {
    type: 'AsyncObjectContainer',
    status?: 'ready' | 'busy' | 'error',
    getter: (routerConfig: RouterConfig) => Promise<T> | T,
    promise?: Promise<T>,
    error?: any,

    // Note that this value may actually be undefined, but I've left the
    // undefined type out as it allows us to access the type using TypeScript
    // mapped types, and this should never be visible to the user anyway.
    value: T
}
