import { Crawler } from '../Crawler'
import { Matcher, MatcherGenerator, MatcherIterator, createMatcherIterator } from '../Matcher'
import { NaviRequest } from '../NaviRequest'
import resolveChunks from '../Resolvable'
import concat from '../utils/concat'

export interface CrawlablePatterns<Context extends object = any> {
  [pattern: string]: string[] | ((request: NaviRequest<Context>, context: Context) => string[] | Promise<string[]>),
}

export function withCrawlerPatterns<Context extends object = any>(
  crawlablePatterns: CrawlablePatterns<Context>,
  forceChild?: Matcher<Context>,
): Matcher<Context> {
  let crawlerResolvable = (request: NaviRequest<Context>): Crawler =>
    async (pattern: string, parentRequest) => {
      let expander = crawlablePatterns[pattern]
      if (parentRequest.mountpath !== request.mountpath || !expander) {
        return request.crawler!(pattern, parentRequest)
      }
      else {
        let expansions: string[] = 
          Array.isArray(expander)
            ? expander
            : await expander(request, request.context)
        
        return concat(await Promise.all(expansions.map(pattern => request.crawler!(pattern, parentRequest))))
      }
    }

  function* contextMatcherGenerator(
    request: NaviRequest<Context>,
    child: MatcherGenerator<Context>
  ): MatcherIterator {
    if (!request.crawler) {
      yield* createMatcherIterator(child, request)
    }
    else {
      yield* resolveChunks(
        crawlerResolvable,
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