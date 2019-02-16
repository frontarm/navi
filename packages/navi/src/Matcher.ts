import { Resolvable } from './resolve'
import { Segment } from './Segments'
import { NaviRequest } from './NaviRequest'

export type Matcher<
  ParentContext extends object,
  ChildContext extends object = ParentContext
> = (child?: MatcherGenerator<ChildContext>) => MatcherGenerator<ParentContext>

export interface ResolvableMatcher<
  Context extends object = any,
  M extends Matcher<Context> = Matcher<Context>
> extends Resolvable<M, Context> {}

export type MatcherGenerator<Context extends object> = (
  request: NaviRequest,
  context: Context,
  appendFinalSlash?: boolean
) => MatcherIterator

export type MatcherIterator = IterableIterator<Segment[]>


export function* concatMatcherIterators(x: MatcherIterator, y: MatcherIterator) {
  let xResult: IteratorResult<Segment[]>
  let yResult: IteratorResult<Segment[]>
  let xSegments: Segment[] = []
  let ySegments: Segment[] = []
  do {
    xResult = x.next()
    if (!xResult.done) {
      xSegments = xResult.value || []
    }
    yResult = y.next()
    if (!yResult.done) {
      ySegments = yResult.value || []
    }
    yield xSegments.concat(ySegments)
  } while (!xResult.done || !yResult.done)
}
