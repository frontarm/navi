import { Resolvable } from './Resolvable'
import { Chunk } from './Chunks'
import { NaviRequest } from './NaviRequest'

export type Matcher<
  ParentContext extends object,
  ChildContext extends object = ParentContext
> = (child?: MatcherGenerator<ChildContext>) => MatcherGenerator<ParentContext>

export interface ResolvableMatcher<
  Context extends object = any
> extends Resolvable<Matcher<Context>, Context> {}

export type MatcherGenerator<Context extends object> = (
  request: NaviRequest,
  context: Context
) => MatcherIterator

export type MatcherIterator = IterableIterator<Chunk[]>


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
