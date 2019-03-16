import resolveChunks from '../Resolvable'
import {
  Matcher,
  MatcherIterator,
  ResolvableMatcher,
  createMatcherIterator,
  MatcherGenerator,
} from '../Matcher'
import { NaviRequest } from '../NaviRequest'
import { Crawler } from '../Crawler';

export function map<Context extends object>(
  resolvableMatcher: ResolvableMatcher<Context>,
): Matcher<Context> {
  return (child: MatcherGenerator<any>) => function* mapMatcherGenerator(
    request: NaviRequest,
    crawler: null | Crawler
  ): MatcherIterator {
    yield* resolveChunks(
      resolvableMatcher,
      request,
      (childMatcher) => createMatcherIterator(childMatcher(child), request, crawler)
    )
  }
}
