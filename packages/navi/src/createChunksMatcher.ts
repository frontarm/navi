import resolveChunks, { Resolvable } from './Resolvable'
import { Chunk, createNotFoundChunk } from './Chunks'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
  concatMatcherIterators,
  createMatcherIterator
} from './Matcher'
import { NaviRequest } from './NaviRequest'
import { Crawler } from './Crawler'

export function createChunksMatcher<T, Context extends object>(
  maybeResolvable: T | Resolvable<T, Context>,
  forceChildMatcher: Matcher<any> | undefined,
  getChunks: (value: T, request: NaviRequest<Context>) => Chunk[],
  exact?: boolean,
  processDuringCrawl?: boolean
): Matcher<Context> {
  function* chunksMatcherGenerator(
    request: NaviRequest,
    crawler: null | Crawler,
    child?: MatcherGenerator<Context>
  ): MatcherIterator {
    let unmatchedPathnamePart = request.path
    if ((!child || exact) && unmatchedPathnamePart && unmatchedPathnamePart !== '/') {
      yield [createNotFoundChunk(request)]
    }
    else {
      let parentIterator =
        (crawler && !processDuringCrawl)
          ? empty()
          : resolveChunks(
              maybeResolvable,
              request,
              (value: T) => getChunks(value, request)
            )
        
      yield* (child ? concatMatcherIterators(parentIterator, createMatcherIterator(child, request, crawler)) : parentIterator)
    }
  }

  return ((childGenerator?: MatcherGenerator<Context>) => (request: NaviRequest<Context>, crawler: null | Crawler) =>
    chunksMatcherGenerator(request, crawler, forceChildMatcher ? forceChildMatcher(childGenerator) : childGenerator)
  ) as any
}

function* empty() {
  yield []
  return
}
