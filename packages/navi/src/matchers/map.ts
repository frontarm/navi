import { Resolution } from '../Resolver'
import { Segment, createNotReadySegment } from '../Segments'
import {
  Matcher,
  MatcherIterator,
  ResolvableMatcher,
  MatcherOptions,
  createMatcher,
} from '../Matcher'

export function map<Context extends object, M extends Matcher<Context>>(
  resolvableMatcher: ResolvableMatcher<Context, M>,
): Matcher<Context> {
  function* mapMatcherGenerator(
    options: MatcherOptions<Context>,
  ): MatcherIterator {
    let { appendFinalSlash, env, resolver } = options

    let childIterator: MatcherIterator | undefined
    let childResult: IteratorResult<Segment[]> | undefined
    let segments: Segment[]
    do {
      let childMatcherResolution: Resolution<Matcher<Context>> | undefined
      if (!childIterator) {
        let childMatcher: Matcher<Context> | undefined
        childMatcherResolution = resolver.resolve(
          env,
          resolvableMatcher,
        )
        childMatcher = childMatcherResolution.value
        if (childMatcher) {
          childIterator = childMatcher()(options)
        }
      }

      if (childIterator && (!childResult || !childResult.done)) {
        childResult = childIterator.next()
      }

      segments = !childIterator
        ? [
            createNotReadySegment(
              options.env.request,
              childMatcherResolution!,
              appendFinalSlash,
            ),
          ]
        : (childResult && childResult.value) || []

      yield segments
    } while (segments.filter(isBusy).length)
  }

  return createMatcher(() => mapMatcherGenerator)
}

function isBusy(segment: Segment) {
  return segment.type === 'busy'
}
