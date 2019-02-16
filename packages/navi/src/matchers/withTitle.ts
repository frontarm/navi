import { Resolvable } from '../Resolvable'
import { createSegment } from '../Segments'
import { createSegmentsMatcher } from '../createSegmentsMatcher'
import { Matcher } from '../Matcher'

export function withTitle<Context extends object>(
  maybeResolvableTitle:
    | string
    | undefined
    | Resolvable<string | undefined, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createSegmentsMatcher(maybeResolvableTitle, child, (title, request) =>
    title ? [createSegment('title', request, { title })] : [],
  )
}
