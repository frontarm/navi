import resolve, { Resolvable } from '../resolve'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
  MatcherOptions,
} from '../Matcher'

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
    options: MatcherOptions<ParentContext>,
    child: MatcherGenerator<ChildContext>,
  ): MatcherIterator {
    yield* resolve(
      childContextMaybeResolvable,
      options.env.request,
      options.env.context,
      childContext =>
        child({
          ...options,
          env: {
            request: options.env.request,
            context: childContext! || {},
          },
        }),
      options.appendFinalSlash,
    )
  }

  return (child: MatcherGenerator<ChildContext>) => options =>
    contextMatcherGenerator(options, forceChild ? forceChild() : child)
}
