import { Resolution, Resolvable } from '../Resolver'
import { createNotReadySegment } from '../Segments'
import {
  Matcher,
  MatcherGenerator,
  MatcherGeneratorClass,
  MatcherResult,
  MatcherOptions,
  createMatcher,
} from '../Matcher'
import { Env } from '../Env'


export interface ContextMatcherGeneratorClass<ParentContext extends object = any, ChildContext extends object = any>
  extends MatcherGeneratorClass<ParentContext, ContextMatcherGenerator<ParentContext, ChildContext>> {
  
  new (options: MatcherOptions<ParentContext>): ContextMatcherGenerator<
    ParentContext,
    ChildContext
  >

  childMatcherGeneratorClass: MatcherGeneratorClass<ChildContext>
  childContextResolvable: Resolvable<ChildContext, ParentContext>
}


class ContextMatcherGenerator<ParentContext extends object, ChildContext extends object> extends MatcherGenerator<ParentContext> {
  last?: {
    childContext?: ChildContext
    matcherGenerator?: MatcherGenerator<any>
  };

  ['constructor']: ContextMatcherGeneratorClass<ParentContext, ChildContext>
  constructor(options: MatcherOptions<ParentContext>) {
    super(options, true)
  }

  protected execute(): MatcherResult {
    let childContextResolution: Resolution<ChildContext> =
      this.resolver.resolve(
        this.env,
        this.constructor.childContextResolvable
      )
    if (childContextResolution.status !== 'ready') {
      return {
        resolutionIds: [childContextResolution.id],
        segments: [createNotReadySegment(this.env.request, childContextResolution.error, this.appendFinalSlash)]
      }
    }

    // Need to memoize env, as its the key for memoization by the resolver
    let childContext = childContextResolution.value!
    if (!this.last || this.last.childContext !== childContext) {
      let childEnv: Env<ChildContext> = {
        request: this.env.request,
        context: childContext
      }
      this.last = {
        childContext,
        matcherGenerator: new this.constructor.childMatcherGeneratorClass({
          env: childEnv,
          resolver: this.resolver,
          appendFinalSlash: this.appendFinalSlash,
        })
      }
    }

    return this.last.matcherGenerator!.getResult()
  }
}

export function withContext<ParentContext extends object=any, ChildContext extends object=any>(
  childContextMaybeResolvable: ChildContext | Resolvable<ChildContext, ParentContext>,
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

  return createMatcher((childMatcherGeneratorClass: MatcherGeneratorClass<ChildContext>): ContextMatcherGeneratorClass<ParentContext, ChildContext> =>
    class extends ContextMatcherGenerator<ParentContext, ChildContext> {
      static childMatcherGeneratorClass = childMatcherGeneratorClass
      static childContextResolvable = childContextResolvable
    }
  )
}
