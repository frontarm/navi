import { Resolvable } from '../Resolvable'
import { createChunksMatcher } from '../createChunksMatcher'
import { createChunk } from '../Chunks'
import { Matcher } from '../Matcher'

export function withData<Context extends object, Data>(
  maybeResolvableData: Data | Resolvable<Data, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createChunksMatcher(
    maybeResolvableData,
    child,
    (data, request) => (data ? [createChunk('data', request, { data })] : [])
  )
}
