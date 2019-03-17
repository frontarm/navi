import { joinPaths } from './URLTools'
import { NotFoundError } from './Errors'
import { NaviRequest } from './NaviRequest'
import { Chunk, createChunk } from './Chunks'

export type Resolvable<T, Context extends object = any, U = any> = (
  request: NaviRequest<Context>,
  context: Context,
  arg?: U
) => (T | PromiseLike<{ default: T } | T>)

export default function* resolveChunks<T>(
  maybeResolvable: T | Resolvable<T>,
  request: NaviRequest,
  createChunks: (value: T) => Chunk[] | IterableIterator<Chunk[]>
): IterableIterator<Chunk[]> {
  let resolvable: Resolvable<T> =
    typeof maybeResolvable === 'function'
      ? (maybeResolvable as any)
      : () => maybeResolvable

  let maybeValue
  try {
    maybeValue = resolvable(request, request.context)
  }
  catch (e) {
    maybeValue = Promise.reject(e)
  }

  let result: Chunk[] | IterableIterator<Chunk[]> | undefined
  if (!isPromiseLike(maybeValue)) {
    result = createChunks(maybeValue)
  }
  else {
    let promise = maybeValue.then(extractDefault)
    let unwrappedPromise = unwrapPromise(promise)
    let busyChunks = [createChunk('busy', request, { promise })] as Chunk[]

    while (!unwrappedPromise.outcome) {
      yield busyChunks
    }

    if (unwrappedPromise.outcome === 'rejected') {
      let error = unwrappedPromise.error
      if (error instanceof NotFoundError && !error.pathname) {
        error.pathname = joinPaths(request.mountpath, request.path)
      }
      yield [createChunk('error', request, { error })]
    }
    else {
      result = createChunks(unwrappedPromise.value!)
    }
  }

  if (result) {
    if (Array.isArray(result)) {
      yield result.length ? result : []
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
export function isPromiseLike<T>(
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
