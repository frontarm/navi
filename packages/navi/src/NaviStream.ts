interface Chunk {
  type: string | number | Symbol
}

export interface AsyncNaviStream<C extends Chunk = any> extends AsyncIterableIterator<C> {}
export interface SyncNaviStream<C extends Chunk = any> extends IterableIterator<C> {}

export type NaviStream<C extends Chunk = any> =
  | AsyncNaviStream<C>
  | SyncNaviStream<C>

export function of<C extends Chunk = any>(...chunks: C[]): SyncNaviStream<C> {
  return chunks[Symbol.iterator]()
}

export function fromIterator<ValueChunk extends Chunk = any, ErrorChunk extends Chunk = any>(
  iterator:
    | Iterator<ValueChunk> 
    | AsyncIterator<ValueChunk>,
  mapErrorToChunks?: (error: any) => ErrorChunk[],
): NaviStream<ValueChunk | ErrorChunk> {
  if (mapErrorToChunks === undefined) {
    mapErrorToChunks = createErrorChunk as any
  }
  try {
    let firstValue = iterator.next()
    if (isPromiseLike(firstValue)) {
      return fromAsyncIterator(firstValue, iterator as AsyncNaviStream<ValueChunk>, mapErrorToChunks!)
    }
    else {
      return fromSyncIterator(firstValue, iterator as SyncNaviStream<ValueChunk>, mapErrorToChunks!)
    }
  }
  catch (error) {
    let errorChunks = mapErrorToChunks!(error)
    if (iterator.return) {
      iterator.return()
    }
    return of(...errorChunks)
  }
}

async function* fromAsyncIterator<ValueChunk extends Chunk = any, ErrorChunk extends Chunk = any>(
  firstValuePromise: PromiseLike<IteratorResult<ValueChunk>>,
  iterator: AsyncIterator<ValueChunk>,
  mapErrorToChunks: (error: any) => ErrorChunk[],
): AsyncNaviStream<ValueChunk | ErrorChunk> {
  try {
    let value = await firstValuePromise
    while (!value.done) {
      if (Array.isArray(value.value)) {
        yield* value.value
      }
      else {
        yield value.value
      }
      value = await iterator.next()
    }
    return value.value
  }
  catch (error) {
    yield* mapErrorToChunks(error)
  }
  finally {
    if (iterator.return) {
      iterator.return()
    }
  }
}

function* fromSyncIterator<ValueChunk extends Chunk = any, ErrorChunk extends Chunk = any>(
  firstValuePromise: IteratorResult<ValueChunk>,
  iterator: Iterator<ValueChunk>,
  mapErrorToChunks: (error: any) => ErrorChunk[],
): SyncNaviStream<ValueChunk | ErrorChunk> {
  try {
    let value = firstValuePromise
    while (!value.done) {
      if (Array.isArray(value.value)) {
        yield* value.value
      }
      else {
        yield value.value
      }
      value = iterator.next()
    }
    return value.value
  }
  catch (error) {
    yield* mapErrorToChunks(error)
  }
  finally {
    if (iterator.return) {
      iterator.return()
    }
  }
}

export function fromPromise<T, ValueChunk extends Chunk = any, ErrorChunk extends Chunk = any>(
  promise: PromiseLike<T>,
  mapValueToChunks: (value: T) => ValueChunk[],
  mapErrorToChunks?: (error: any) => ErrorChunk[],
  onCancel?: () => void,
): AsyncNaviStream<ValueChunk | ErrorChunk> {
  // TODO
}

export function fromMaybePromise<T, ValueChunk extends Chunk = any, ErrorChunk extends Chunk = any>(
  maybePromise: T | PromiseLike<T>,
  mapValueToChunks: (value: T) => ValueChunk[],
  mapErrorToChunks?: (error: any) => ErrorChunk[],
  onCancel?: () => void,
): NaviStream<ValueChunk | ErrorChunk> {
  if (isPromiseLike(maybePromise)) {
    return fromPromise(maybePromise, mapValueToChunks, mapErrorToChunks, onCancel)
  }
  else {
    return of(...mapValueToChunks(maybePromise))
  }
}

export function merge<C extends Chunk = any>(...maybePromiseStreams: (NaviStream<C> | PromiseLike<NaviStream<C>>)[]): NaviStream<C> {
  // TODO:
  // - if all streams are sync and immediately available, output a sync stream
  // - otherwise output an async stream

  let xResult: IteratorResult<Chunk[]>
  let yResult: IteratorResult<Chunk[]>
  let xChunks: Chunk[] = []
  let yChunks: Chunk[] = []
  do {
    xResult = x.next()
    if (!xResult.done) {
      xChunks = xResult.value || []
    }
    yResult = y.next()
    if (!yResult.done) {
      yChunks = yResult.value || []
    }
    yield xChunks.concat(yChunks)
  } while (!xResult.done || !yResult.done)
}

function isPromiseLike(x: any): x is PromiseLike<any> {
  return typeof x.then === 'function'
}

function createErrorChunk(error: any) {
  return {
    type: 'error',
    error,
  }
}