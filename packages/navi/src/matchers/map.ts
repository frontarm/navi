import resolve from '../resolve'
import {
  Matcher,
  MatcherIterator,
  ResolvableMatcher,
  MatcherOptions,
} from '../Matcher'

export function map<Context extends object, M extends Matcher<Context>>(
  resolvableMatcher: ResolvableMatcher<Context, M>,
): Matcher<Context> {
  return () => function* mapMatcherGenerator(
    options: MatcherOptions<Context>,
  ): MatcherIterator {
    yield* resolve(
      resolvableMatcher,
      options.env.request,
      options.env.context,
      (childMatcher) => childMatcher()(options),
      options.appendFinalSlash
    )
  }
}
