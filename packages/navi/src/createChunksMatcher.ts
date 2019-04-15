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

export function createChunksMatcher<T, Context extends object>(
  maybeResolvable: T | Resolvable<T, Context>,
  forceChildMatcher: Matcher<any> | undefined,
  getChunks: (value: T, request: NaviRequest<Context>) => Chunk[],
  exact?: boolean,
  processDuringCrawl?: boolean,
  predicate?: (request: NaviRequest) => boolean
): Matcher<Context> {
  function* chunksMatcherGenerator(
    request: NaviRequest,
    child?: MatcherGenerator<Context>
  ): MatcherIterator {
    let unmatchedPathnamePart = request.path
    if ((exact === undefined ? !child : exact) && unmatchedPathnamePart && unmatchedPathnamePart !== '/') {
      yield [createNotFoundChunk(request)]
    }
    else {
      let parentIterator =
        ((request.crawler && !processDuringCrawl) || (predicate && !predicate(request)))
        ? empty()
        : resolveChunks(
            maybeResolvable,
            request,
            (value: T) => getChunks(value, request)
          )
        
      yield* (child ? concatMatcherIterators(parentIterator, createMatcherIterator(child, request)) : parentIterator)
    }
  }

  return ((childGenerator?: MatcherGenerator<Context>) => (request: NaviRequest<Context>) =>
    chunksMatcherGenerator(request, forceChildMatcher ? forceChildMatcher(childGenerator) : childGenerator)
  ) as any
}

function* empty() {
  yield []
  return
}
