import { Resolvable } from '../Resolvable'
import { createChunk } from '../Chunks'
import { createChunksMatcher } from '../createChunksMatcher'
import { Matcher } from '../Matcher'

export function withTitle<Context extends object>(
  maybeResolvableTitle:
    | string
    | undefined
    | Resolvable<string | undefined, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createChunksMatcher(maybeResolvableTitle, child, (title, request) =>
    title ? [createChunk('title', request, { title })] : [],
  )
}
