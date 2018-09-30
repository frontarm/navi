import { Env } from './Env'
import { joinPaths } from './URLTools'
import { NotFoundError } from './Errors'

export type Resolvable<T, Context extends object = any> = (
  env: Env<Context>,
) => PromiseLike<{ default: T } | T> | T

export type Resolution<T> = {
  id: number
  status: Status
  error?: any
  value?: T
}

export enum Status {
  Ready = 'ready',
  Busy = 'busy',
  Error = 'error',
}

export const undefinedResolver = () => undefined

export class Resolver {
  private nextId: number
  private results: WeakMap<Env<any>, Map<Function, Resolution<any>>>
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

  resolve<T>(
    env: Env<any>,
    resolvable: Resolvable<T>,
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

    let id = this.nextId++
    let maybeValue = resolvable(env)
    if (!isPromiseLike(maybeValue)) {
      let result: Resolution<T> = {
        id,
        status: Status.Ready,
        value: maybeValue,
      }
      matcherResults.set(resolvable, result)
      return result
    }

    let result: Resolution<T> = {
      id,
      status: Status.Busy,
    }
    matcherResults.set(resolvable, result)
    this.listenForChanges(maybeValue, matcherResults, resolvable, id, joinPaths(env.pathname, env.unmatchedPathnamePart))
    return result
  }

  listenForChanges<T>(
    maybeValue: PromiseLike<T>,
    matcherResults: Map<Function, Resolution<T>>,
    resolvable: Resolvable<T>,
    id: number,
    fullPathname: string,
  ) {
    maybeValue
      .then(
        value => {
          let currentResult = matcherResults!.get(resolvable)
          if (currentResult && currentResult.id === id) {
            matcherResults!.set(resolvable, {
              id: currentResult.id,
              status: Status.Ready,
              value: extractDefault(value),
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
              status: Status.Error,
              error: error || new Error(),
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

function extractDefault<T>(value: { default: T } | T): T {
  if (hasDefault(value)) {
    return value.default
  } else {
    return value
  }
}

function hasDefault<T>(value: { default: T } | T): value is { default: T } {
  return value && typeof value === 'object' && 'default' in (value as any)
}
