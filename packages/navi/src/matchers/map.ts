import resolveChunks from '../Resolvable'
import {
  Matcher,
  MatcherIterator,
  ResolvableMatcher,
  createMatcherIterator,
  MatcherGenerator,
} from '../Matcher'
import { NaviRequest } from '../NaviRequest'

export function map<Context extends object>(
  resolvableMatcher: ResolvableMatcher<Context>,
): Matcher<Context> {
  return (child: MatcherGenerator<any>) => function* mapMatcherGenerator(
    request: NaviRequest
  ): MatcherIterator {
    yield* resolveChunks(
      resolvableMatcher,
      request,
      (childMatcher) => createMatcherIterator(childMatcher(child), request)
    )
  }
}
