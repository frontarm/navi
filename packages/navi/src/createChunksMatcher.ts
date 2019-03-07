import resolveChunks, { Resolvable } from './Resolvable'
import { Chunk, createNotFoundChunk } from './Chunks'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
  concatMatcherIterators,
  createMatcherIterator
} from './Matcher'
import { NaviRequest } from './NaviRequest';

export function createChunksMatcher<T, Context extends object>(
  maybeResolvable: T | Resolvable<T, Context>,
  forceChildMatcher: Matcher<any> | undefined,
  getChunks: (value: T, request: NaviRequest) => Chunk[],
  shouldResolve?: (request: NaviRequest) => boolean,
  exact?: boolean,
): Matcher<Context> {
  function* chunksMatcherGenerator(
    request: NaviRequest,
    context: Context,
    child?: MatcherGenerator<Context>
  ): MatcherIterator {
    let unmatchedPathnamePart = request.path
    if ((!child || exact) && unmatchedPathnamePart && unmatchedPathnamePart !== '/') {
      yield [createNotFoundChunk(request)]
    }
    else {
      let parentIterator =
        (shouldResolve && !shouldResolve(request))
          ? empty()
          : resolveChunks(
              maybeResolvable,
              request,
              context,
              (value: T) => getChunks(value, request)
            )
        
      yield* (child ? concatMatcherIterators(parentIterator, createMatcherIterator(child, request, context)) : parentIterator)
    }
  }

  return ((childGenerator?: MatcherGenerator<Context>) => (request: NaviRequest, context: Context) =>
    chunksMatcherGenerator(request, context, forceChildMatcher ? forceChildMatcher() : childGenerator)
  ) as any
}

function* empty() {
  yield []
  return
}