import resolveSegments, { Resolvable } from '../Resolvable'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
} from '../Matcher'
import { NaviRequest } from '../NaviRequest';

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
    request: NaviRequest,
    context: ParentContext,
    child: MatcherGenerator<ChildContext>,
    appendFinalSlash?: boolean,
  ): MatcherIterator {
    yield* resolveSegments(
      childContextMaybeResolvable,
      request,
      context,
      childContext =>
        child(
          request,
          childContext! || {},
          appendFinalSlash
        ),
      appendFinalSlash,
    )
  }

  return (child: MatcherGenerator<ChildContext>) => (request: NaviRequest, context: ParentContext, appendFinalSlash?: boolean) =>
    contextMatcherGenerator(request, context, forceChild ? forceChild() : child, appendFinalSlash)
}
