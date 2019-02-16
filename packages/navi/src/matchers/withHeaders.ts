import { Resolvable } from '../Resolvable'
import { createSegmentsMatcher } from '../createSegmentsMatcher'
import { createSegment } from '../Segments'
import { Matcher } from '../Matcher'

export function withHeaders<Context extends object>(
  maybeResolvableHeaders:
    | undefined
    | { [name: string]: string }
    | Resolvable<undefined | { [name: string]: string }, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createSegmentsMatcher(
    maybeResolvableHeaders,
    child,
    (headers, request) =>
      headers ? [createSegment('headers', request, { headers })] : [],
  )
}
