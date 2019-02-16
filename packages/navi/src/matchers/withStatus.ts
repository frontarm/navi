import { Resolvable } from '../Resolvable'
import { createSegmentsMatcher } from './createSegmentsMatcher'
import { createSegment } from '../Segments'
import { Matcher } from '../Matcher'

export function withStatus<Context extends object>(
  maybeResolvableStatus:
    | number
    | undefined
    | Resolvable<number | undefined, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createSegmentsMatcher(
    maybeResolvableStatus,
    child,
    (status, request) =>
      status ? [createSegment('status', request, { status })] : [],
  )
}
