import { Resolvable } from '../Resolvable'
import { createChunksMatcher } from '../createChunksMatcher'
import { createChunk } from '../Chunks'
import { Matcher } from '../Matcher'

export function withStatus<Context extends object>(
  maybeResolvableStatus:
    | number
    | undefined
    | Resolvable<number | undefined, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createChunksMatcher(
    maybeResolvableStatus,
    child,
    (status, request) =>
      status ? [createChunk('status', request, { status })] : [],
  )
}
