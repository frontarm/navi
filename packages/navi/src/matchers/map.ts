import resolveSegments from '../Resolvable'
import {
  Matcher,
  MatcherIterator,
  ResolvableMatcher,
} from '../Matcher'
import { NaviRequest } from '../NaviRequest'

export function map<Context extends object, M extends Matcher<Context>>(
  resolvableMatcher: ResolvableMatcher<Context, M>,
): Matcher<Context> {
  return () => function* mapMatcherGenerator(
    request: NaviRequest,
    context: Context
  ): MatcherIterator {
    yield* resolveSegments(
      resolvableMatcher,
      request,
      context,
      (childMatcher) => childMatcher()(request, context)
    )
  }
}
