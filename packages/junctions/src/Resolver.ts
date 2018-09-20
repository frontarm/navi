import { RouterEnv } from './Env';
import { Router, RouterEvent } from './Router';
import { Junction } from './Junction';

export type Resolvable<
    T,
    Context=any
> = (env: RouterEnv<Context>) => PromiseLike<T> | T

export enum ResolverStatus {
    Ready = 'Ready',
    Busy = 'Busy',
    Error = 'Error',
}

export type ResolverResult<T> = {
    id?: number
    status: ResolverStatus,
    error?: any
    value?: T
}

export type ResolverListener = () => void

export class Resolver<Context=any> {
    private env: RouterEnv<Context>
    private onEvent: (event: RouterEvent) => void
    private nextId: number
    private results: Map<Function, ResolverResult<any>>
    private listenerResolvables: Map<Function, Function[]>

    constructor(initialEnv: RouterEnv<Context>, onEvent: (event: RouterEvent) => void) {
        this.listenerResolvables = new Map
        this.nextId = 1
        this.onEvent = onEvent
        this.results = new Map()
        this.setEnv(initialEnv)
    }

    setEnv(env: RouterEnv<Context>) {
        this.env = env

        // clear any context dependent results from results
        let allResolvables = Array.from(this.results.keys())
        let clearedResolvables: Function[] = []
        for (let i = 0; i < allResolvables.length; i++) {
            let resolvable = allResolvables[i]
            if (resolvable.length > 0) {
                clearedResolvables.push(resolvable)
                this.results.delete(resolvable)
            }
        }
        
        // notify any listeners for the cleared resolvables
        let listenerResolvables = Array.from(this.listenerResolvables.entries())
        for (let i = 0; i < listenerResolvables.length; i++) {
            let [listener, resolvables] = listenerResolvables[i]
            if (clearedResolvables.find(clearedResolvable => resolvables.indexOf(clearedResolvable) !== -1)) {
                listener()
            }
        }
    }

    listen(listener: ResolverListener, resolvables: Resolvable<any>[]) {
        this.listenerResolvables.set(listener, resolvables)
    }

    unlisten(listener: ResolverListener) {
        this.listenerResolvables.delete(listener)
    }

    resolve<T>(resolvable: Resolvable<T, Context>, event: RouterEvent): ResolverResult<T> {
        let currentResult = this.results.get(resolvable)

        if (currentResult) {
            return currentResult
        }

        let id = this.nextId++
        let maybeValue = resolvable(this.env)
        if (!isPromiseLike(maybeValue)) {
            let result: ResolverResult<T> = {
                id,
                status: ResolverStatus.Ready,
                value: maybeValue,
            }
            this.results.set(resolvable, result)
            return result
        }

        this.onEvent({
            ...event,
            type: event['type'] + 'Start',
        })

        let result: ResolverResult<T> = {
            id,
            status: ResolverStatus.Busy,
        }
        this.results.set(resolvable, result)

        maybeValue
            .then(
                value => {
                    let currentResult = this.results.get(resolvable)
                    if (currentResult && currentResult.id === id) {
                        this.results.set(resolvable, {
                            id: currentResult.id,
                            status: ResolverStatus.Ready,
                            value,
                        })
                        return true
                    }
                },
                error => {
                    let currentResult = this.results.get(resolvable)
                    if (currentResult && currentResult.id === id) {
                        this.results.set(resolvable, {
                            id: currentResult.id,
                            status: ResolverStatus.Error,
                            error,
                        })
                        return true
                    }
                }
            )
            .then(didUpdate => {
                this.onEvent({
                    ...event,
                    type: event['type'] + 'End',
                })

                // Call any listeners that want to be notified of changes
                // to this resolvable
                if (didUpdate) {
                    let listenerResolvables = Array.from(this.listenerResolvables.entries())
                    for (let i = 0; i < listenerResolvables.length; i++) {
                        let [listener, resolvables] = listenerResolvables[i]
                        if (resolvables.indexOf(resolvable) !== -1) {
                            listener()
                        }
                    }
                }
            })
        
        return result
    }
}

// Not all promise libraries use the ES6 `Promise` constructor,
// so there isn't a better way to check if it's a promise :-(
function isPromiseLike<T>(x: PromiseLike<T> | T): x is PromiseLike<T> {
    return !!x && !!(x['then'])
}