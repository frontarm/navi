import { Resolvable } from '../Resolvable'
import { createSegmentsMatcher } from '../createSegmentsMatcher'
import { createSegment } from '../Segments'
import { Matcher } from '../Matcher'

export function withView<Context extends object, View>(
  maybeResolvableView: View | Resolvable<View, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createSegmentsMatcher(
    maybeResolvableView,
    child,
    ((view, request) => view ? [createSegment('view', request, { view })] : []),
    (request) => request.method !== 'HEAD'
  )
}
