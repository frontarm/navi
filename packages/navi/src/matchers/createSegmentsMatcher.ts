import resolve, { Resolvable } from '../resolve'
import { Segment, createNotFoundSegment, createSegment } from '../Segments'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
  MatcherOptions,
  concatMatcherIterators
} from '../Matcher'
import { NaviRequest } from '../NaviRequest';

export function createSegmentsMatcher<T, Context extends object>(
  maybeResolvable: T | Resolvable<T, Context>,
  forceChildMatcher: Matcher<any> | undefined,
  getSegments: (value: T, request: NaviRequest) => Segment[],
): Matcher<Context> {
  function* segmentsMatcherGenerator(
    options: MatcherOptions<Context>,
    child?: MatcherGenerator<Context>,
  ): MatcherIterator {
    let unmatchedPathnamePart = options.env.request.path
    if (!child && unmatchedPathnamePart && unmatchedPathnamePart !== '/') {
      yield [createNotFoundSegment(options.env.request)]
    }
    else {
      let parentIterator = resolve(
        maybeResolvable,
        options.env.request,
        options.env.context,
        (value: T) => getSegments(value, options.env.request),
        options.appendFinalSlash
      )
      
      yield* (child ? concatMatcherIterators(parentIterator, child(options)) : parentIterator)
    }
  }

  return (childGenerator?: MatcherGenerator<Context>) => options =>
    segmentsMatcherGenerator(options, forceChildMatcher ? forceChildMatcher() : childGenerator)
}
