import { joinPaths } from './URLTools'
import { NotFoundError } from './Errors'
import { NaviRequest } from './NaviRequest'
import { Segment, createSegment } from './Segments'

export type Resolvable<T, Context extends object = any, U = any> = (
  request: NaviRequest,
  context: Context,
  arg?: U
) => (T | PromiseLike<{ default: T } | T>)

export default function* resolveSegments<T>(
  maybeResolvable: T | Resolvable<T>,
  request: NaviRequest,
  context: any,
  createSegments: (value: T) => Segment[] | IterableIterator<Segment[]>,
  ensureTrailingSlash = true
): IterableIterator<Segment[]> {
  let resolvable: Resolvable<T> =
    typeof maybeResolvable === 'function'
      ? (maybeResolvable as any)
      : () => maybeResolvable

  let maybeValue
  try {
    maybeValue = resolvable(request, context)
  }
  catch (e) {
    maybeValue = Promise.reject(e)
  }

  let result: Segment[] | IterableIterator<Segment[]> | undefined
  if (!isPromiseLike(maybeValue)) {
    result = createSegments(maybeValue)
  }
  else {
    let promise = maybeValue.then(extractDefault)
    let unwrappedPromise = unwrapPromise(promise)
    let busySegments = [createSegment('busy', request, { promise }, ensureTrailingSlash)] as Segment[]

    while (!unwrappedPromise.outcome) {
      yield busySegments
    }

    if (unwrappedPromise.outcome === 'rejected') {
      let error = unwrappedPromise.error
      if (error instanceof NotFoundError && !error.pathname) {
        error.pathname = joinPaths(request.mountpath, request.path)
      }
      yield [createSegment('error', request, { error }, ensureTrailingSlash)]
    }
    else {
      result = createSegments(unwrappedPromise.value!)
    }
  }

  if (result) {
    if (Array.isArray(result)) {
      yield result.length ? result : [createSegment('null', request)]
    }
    else {
      yield* result
    }
  }
}

interface UnwrappedPromise<T> {
  value?: T
  error?: any
  outcome?: 'rejected' | 'resolved'
}

function unwrapPromise<T>(promise: PromiseLike<T>): UnwrappedPromise<T> {
  let result: UnwrappedPromise<T> = {}
  promise.then(
    value => {
      result.value = value
      result.outcome = 'resolved'
    },
    error => {
      result.error = error
      result.outcome = 'rejected'
    }
  )
  return result
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
