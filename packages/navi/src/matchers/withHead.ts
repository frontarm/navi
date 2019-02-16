import { Resolvable } from '../Resolvable'
import { createSegmentsMatcher } from '../createSegmentsMatcher'
import { createSegment } from '../Segments'
import { Matcher } from '../Matcher'

export function withHead<Context extends object, Head>(
  maybeResolvableHead: Head | Resolvable<Head, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createSegmentsMatcher(
    maybeResolvableHead,
    child,
    (head, request) => head ? [createSegment('head', request, { head })] : [],
    (request) => request.method !== 'HEAD',
  )
}
