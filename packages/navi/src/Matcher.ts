import { Resolvable } from './Resolvable'
import { Chunk } from './Chunks'
import { NaviRequest } from './NaviRequest'
import { joinPaths } from './URLTools'

export type Matcher<
  ParentContext extends object,
  ChildContext extends object = ParentContext
> = (child?: MatcherGenerator<ChildContext>) => MatcherGenerator<ParentContext>

export interface ResolvableMatcher<
  Context extends object = any
> extends Resolvable<Matcher<Context>, Context> {}

export type MatcherGenerator<Context extends object> = (request: NaviRequest<Context>) => MatcherIterator

export type MatcherIterator = IterableIterator<Chunk[]>

export function createMatcherIterator<Context extends object>(
  matcherGenerator: MatcherGenerator<Context>, request: NaviRequest<Context>, pattern = ''
): MatcherIterator {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof matcherGenerator !== 'function') {
      console.error(
        `A matcher at the URL "${joinPaths(
          request.mountpath,
          pattern,
        )}" is invalid. A generator function was expected, but "${String(matcherGenerator)}" was received.`,
      )
    }
  }

  return matcherGenerator(request)
}

export function* concatMatcherIterators(x: MatcherIterator, y: MatcherIterator) {
  let xResult: IteratorResult<Chunk[]>
  let yResult: IteratorResult<Chunk[]>
  let xChunks: Chunk[] = []
  let yChunks: Chunk[] = []
  do {
    xResult = x.next()
    if (!xResult.done) {
      xChunks = xResult.value || []
    }
    yResult = y.next()
    if (!yResult.done) {
      yChunks = yResult.value || []
    }
    yield xChunks.concat(yChunks)
  } while (!xResult.done || !yResult.done)
}
