import resolveSegments, { Resolvable } from './Resolvable'
import { Segment, createNotFoundSegment } from './Segments'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
  concatMatcherIterators
} from './Matcher'
import { NaviRequest } from './NaviRequest';

export function createSegmentsMatcher<T, Context extends object>(
  maybeResolvable: T | Resolvable<T, Context>,
  forceChildMatcher: Matcher<any> | undefined,
  getSegments: (value: T, request: NaviRequest) => Segment[],
  shouldResolve?: (request: NaviRequest) => boolean
): Matcher<Context> {
  function* segmentsMatcherGenerator(
    request: NaviRequest,
    context: Context,
    child?: MatcherGenerator<Context>
  ): MatcherIterator {
    let unmatchedPathnamePart = request.path
    if (!child && unmatchedPathnamePart && unmatchedPathnamePart !== '/') {
      yield [createNotFoundSegment(request)]
    }
    else {
      let parentIterator =
        (shouldResolve && !shouldResolve(request))
          ? empty()
          : resolveSegments(
              maybeResolvable,
              request,
              context,
              (value: T) => getSegments(value, request)
            )
        
      yield* (child ? concatMatcherIterators(parentIterator, child(request, context)) : parentIterator)
    }
  }

  return (childGenerator?: MatcherGenerator<Context>) => (request: NaviRequest, context: Context) =>
    segmentsMatcherGenerator(request, context, forceChildMatcher ? forceChildMatcher() : childGenerator)
}

function* empty() {
  yield []
  return
}