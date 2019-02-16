import { Resolvable } from '../Resolvable'
import { createSegmentsMatcher } from './createSegmentsMatcher'
import { createSegment } from '../Segments'
import { Matcher } from '../Matcher'

export function withData<Context extends object, Data>(
  maybeResolvableData: Data | Resolvable<Data, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  return createSegmentsMatcher(
    maybeResolvableData,
    child,
    (data, request) => (data ? [createSegment('data', request, { data })] : [])
  )
}
