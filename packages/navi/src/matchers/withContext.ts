import { Resolvable } from '../Resolver'
import { Segment, createNotReadySegment, createSegment } from '../Segments'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
  MatcherOptions,
  createMatcher,
} from '../Matcher'

export function withContext<ParentContext extends object=any, ChildContext extends object=any>(
  childContextMaybeResolvable: ChildContext | Resolvable<ChildContext, ParentContext>,
  forceChild?: Matcher<ChildContext>
): Matcher<ParentContext, ChildContext> {
  if (process.env.NODE_ENV !== 'production') {
    if (childContextMaybeResolvable === undefined) {
      console.warn(
        `The first argument to createContext() should be the child context, but it was undefined. If you want to define an empty context, instead pass null.`,
      )
    }
  }

  let childContextResolvable: Resolvable<ChildContext, ParentContext> = typeof childContextMaybeResolvable === 'function'
    ? (childContextMaybeResolvable as any)
    : () => childContextMaybeResolvable

  function* contextMatcherGenerator(
    options: MatcherOptions<ParentContext>,
    child: MatcherGenerator<ChildContext>,
  ): MatcherIterator {
    let { env, resolver } = options
    let childIterator: MatcherIterator | undefined
    let childResult: IteratorResult<Segment[]> | undefined
    let segments: Segment[] = []
    do {
      let childContextResolution = resolver.resolve(env, childContextResolvable)
      let { status, value: childContext } = childContextResolution
      if (status !== 'ready') {
        segments = [createNotReadySegment(env.request, childContextResolution, options.appendFinalSlash)]
        yield segments
        if (status === 'error') {
          return
        }
        else {
          // Don't create the child generator until we know what it's context should be
          continue
        }
      }

      if (!childIterator) {
        childIterator = child({
          ...options,
          env: {
            request: env.request,
            context: childContext! || {}
          },
        })
      }
      if (!childResult || !childResult.done) {
        childResult = childIterator.next()
        segments = childResult.value || []
      }
      if (segments.length === 0) {
        segments.push(createSegment('null', env.request))
      }
      yield segments
    } while (segments.filter(isBusy).length)
  }

  return createMatcher((child: MatcherGenerator<ChildContext>) => options =>
    contextMatcherGenerator(options, forceChild ? forceChild() : child),
  )
}

function isBusy(segment: Segment) {
  return segment.type === 'busy'
}