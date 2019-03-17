import { Crawler } from '../Crawler'
import { Matcher, MatcherGenerator, MatcherIterator, createMatcherIterator } from '../Matcher'
import { NaviRequest } from '../NaviRequest'
import resolveChunks, { Resolvable } from '../Resolvable'

export function withCrawler<Context extends object = any>(
  crawlerMaybeResolvable:
    | Crawler
    | Resolvable<Crawler, Context>,
  forceChild?: Matcher<Context>,
): Matcher<Context> {
  function* contextMatcherGenerator(
    request: NaviRequest<Context>,
    child: MatcherGenerator<Context>
  ): MatcherIterator {
    if (!request.crawler) {
      yield* createMatcherIterator(child, request)
    }
    else {
      yield* resolveChunks(
        crawlerMaybeResolvable,
        request,
        crawler =>
          createMatcherIterator(
            child,
            { ...request, crawler },
          )
      )
    }
  }

  return (child: MatcherGenerator<Context>) => (request: NaviRequest) =>
    contextMatcherGenerator(request, forceChild ? forceChild(child) : child)
}