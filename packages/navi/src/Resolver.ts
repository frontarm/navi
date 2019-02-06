import { Env } from './Env'
import { joinPaths } from './URLTools'
import { NotFoundError } from './Errors'
import { NaviRequest } from './NaviRequest';

export type Resolvable<T, Context extends object = any, Info = any> = (
  request: NaviRequest,
  context: Context,
  infoPromise: PromiseLike<Info>
) => (T | PromiseLike<{ default: T } | T>)

export type Resolution<T> = {
  id: number
  status: Status
  promise: PromiseLike<T>
  error?: any
  value?: T
}

export type Status =
  | 'ready'
  | 'busy'
  | 'error'

export function reduceStatuses(x: Status, y: Status) {
  if (x === 'error' || y === 'error') {
    return 'error'
  }
  else if (x === 'busy' || y === 'busy') {
    return 'busy'
  }
  return 'ready'
}

export class Resolver {
  private nextId: number
  private results: WeakMap<Env, Map<Function, Resolution<any>>>
  private listenerIds: Map<Function, number[]>

  constructor() {
    this.listenerIds = new Map()
    this.nextId = 1
    this.results = new WeakMap()
  }

  listen(listener: () => void, resolutionIds: number[]) {
    this.listenerIds.set(listener, resolutionIds)
  }

  unlisten(listener: () => void) {
    this.listenerIds.delete(listener)
  }

  resolve<T, Info>(
    env: Env,
    resolvable: Resolvable<T>,
    infoResolvable?: Resolvable<Info>
  ): Resolution<T> {
    let matcherResults = this.results.get(env)
    if (!matcherResults) {
      matcherResults = new Map()
      this.results.set(env, matcherResults)
    }

    let currentResult = matcherResults.get(resolvable)
    if (currentResult) {
      return currentResult
    }

    let infoResolution = !infoResolvable ? { promise: Promise.resolve() } : (
      matcherResults.get(infoResolvable) || { promise: Promise.resolve() }
    ) 
    let id = this.nextId++
    let maybeValue = resolvable(env.request, env.context, infoResolution.promise)
    if (!isPromiseLike(maybeValue)) {
      let result: Resolution<T> = {
        id,
        status: 'ready',
        value: maybeValue,
        promise: Promise.resolve(maybeValue),
      }
      matcherResults.set(resolvable, result)
      return result
    }

    let promise = maybeValue.then(extractDefault)
    let result: Resolution<T> = {
      id,
      status: 'busy',
      promise,
    }
    matcherResults.set(resolvable, result)
    this.listenForChanges(promise, matcherResults, resolvable, id, joinPaths(env.request.mountpath, env.request.path))
    return result
  }

  listenForChanges<T>(
    promise: PromiseLike<T>,
    matcherResults: Map<Function, Resolution<T>>,
    resolvable: Resolvable<T>,
    id: number,
    fullPathname: string,
  ) {
    promise
      .then(
        value => {
          let currentResult = matcherResults!.get(resolvable)
          if (currentResult && currentResult.id === id) {
            matcherResults!.set(resolvable, {
              id: currentResult.id,
              status: 'ready',
              value: value,
              promise,
            })
            return true
          }
        },
        error => {
          let currentResult = matcherResults!.get(resolvable)

          if (error instanceof NotFoundError && !error.pathname) {
            error.pathname = fullPathname
          }

          if (currentResult && currentResult.id === id) {
            matcherResults!.set(resolvable, {
              id: currentResult.id,
              status: 'error',
              error: error || new Error(),
              promise,
            })

            return true
          }
        },
      )
      .then(didUpdate => {
        // Call any listeners that want to be notified of changes
        // to this resolvable
        if (didUpdate) {
          let listenerIds = Array.from(this.listenerIds.entries())
          for (let i = 0; i < listenerIds.length; i++) {
            let [listener, ids] = listenerIds[i]
            if (ids.indexOf(id) !== -1) {
              listener()
            }
          }
        }
      })
  }
}

// Not all promise libraries use the ES6 `Promise` constructor,
// so there isn't a better way to check if it's a promise :-(
function isPromiseLike<T>(
  x: PromiseLike<{ default: T } | T> | T,
): x is PromiseLike<{ default: T } | T> {
  return !!x && !!x['then']
}

export function extractDefault<T>(value: { default: T } | T): T {
  if (hasDefault(value)) {
    return value.default
  } else {
    return value
  }
}

function hasDefault<T>(value: { default: T } | T): value is { default: T } {
  return value && typeof value === 'object' && 'default' in (value as any)
}
