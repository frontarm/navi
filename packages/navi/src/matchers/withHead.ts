import { Resolvable } from '../Resolvable'
import { createChunksMatcher } from '../createChunksMatcher'
import { createChunk } from '../Chunks'
import { Matcher } from '../Matcher'

export function withHead<Context extends object, Head>(
  maybeResolvableHead: Head | Resolvable<Head, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createChunksMatcher(
    maybeResolvableHead,
    child,
    (head, request) => head ? [createChunk('head', request, { head })] : [],
  )
}
