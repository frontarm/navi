import { Env } from './Env'
import { joinPaths } from './URLTools'
import { NotFoundError } from './Errors'
import { NaviRequest } from './NaviRequest';

export type Resolvable<T, Context extends object = any, U = any> = (
  request: NaviRequest,
  context: Context,
  arg?: U
) => (T | PromiseLike<{ default: T } | T>)

export type Resolution<T> = {
  status: Status
  promise?: PromiseLike<T>
  error?: any
  value?: T
}

export type Status =
  | 'ready'
  | 'busy'
  | 'error'

export class Resolver {
  private results: WeakMap<Env, Map<Function, Resolution<any>>>

  constructor() {
    this.results = new WeakMap()
  }

  resolve<T>(
    env: Env,
    resolvable: Resolvable<T>
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

    let maybeValue
    try {
      maybeValue = resolvable(env.request, env.context)
    }
    catch (e) {
      maybeValue = Promise.reject(e)
    }
    if (!isPromiseLike(maybeValue)) {
      let result: Resolution<T> = {
        status: 'ready',
        value: maybeValue,
      }
      matcherResults.set(resolvable, result)
      return result
    }

    let promise = maybeValue.then(extractDefault)
    let result: Resolution<T> = {
      status: 'busy',
      promise,
    }
    matcherResults.set(resolvable, result)
    promise.then(
      value => {
        matcherResults!.set(resolvable, {
          status: 'ready',
          value: value,
          promise,
        })
      },
      error => {
        if (error instanceof NotFoundError && !error.pathname) {
          error.pathname = joinPaths(env.request.mountpath, env.request.path)
        }

        matcherResults!.set(resolvable, {
          status: 'error',
          error: error || new Error(),
          promise,
        })
      },
    )
    return result
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
