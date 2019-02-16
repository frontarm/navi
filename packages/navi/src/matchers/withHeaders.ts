import { Resolvable } from '../Resolvable'
import { createChunksMatcher } from '../createChunksMatcher'
import { createChunk } from '../Chunks'
import { Matcher } from '../Matcher'

export function withHeaders<Context extends object>(
  maybeResolvableHeaders:
    | undefined
    | { [name: string]: string }
    | Resolvable<undefined | { [name: string]: string }, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createChunksMatcher(
    maybeResolvableHeaders,
    child,
    (headers, request) =>
      headers ? [createChunk('headers', request, { headers })] : [],
  )
}
