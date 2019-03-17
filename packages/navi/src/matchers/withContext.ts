import resolveChunks, { Resolvable } from '../Resolvable'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
  createMatcherIterator,
} from '../Matcher'
import { NaviRequest } from '../NaviRequest'

export function withContext<
  ParentContext extends object = any,
  ChildContext extends object = any
>(
  childContextMaybeResolvable:
    | ChildContext
    | Resolvable<ChildContext, ParentContext>,
  forceChild?: Matcher<ChildContext>,
): Matcher<ParentContext, ChildContext> {
  if (process.env.NODE_ENV !== 'production') {
    if (childContextMaybeResolvable === undefined) {
      console.warn(
        `The first argument to withContext() should be the child context, but it was undefined. If you want to define an empty context, instead pass null.`,
      )
    }
  }

  function* contextMatcherGenerator(
    request: NaviRequest<ParentContext>,
    child: MatcherGenerator<ChildContext>
  ): MatcherIterator {
    yield* resolveChunks(
      childContextMaybeResolvable,
      request,
      childContext =>
        createMatcherIterator(
          child,
          {
            ...request,
            context: childContext! || {}
          },
        )
    )
  }

  return (child: MatcherGenerator<ChildContext>) => (request: NaviRequest) =>
    contextMatcherGenerator(request, forceChild ? forceChild(child) : child)
}
