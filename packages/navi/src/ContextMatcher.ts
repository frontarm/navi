import { Resolution, Resolvable } from './Resolver'
import { Segment, createNotReadySegment } from './Segments'
import {
  Matcher,
  MatcherBase,
  MatcherResult,
  MatcherClass,
  MatcherOptions,
} from './Matcher'
import { Env } from './Env'


export interface ContextMatcher<ParentContext extends object = any, ChildContext extends object = any>
  extends MatcherClass<ParentContext, ContextMatcherImplementation<ParentContext, ChildContext>> {
  type: 'context'

  new (options: MatcherOptions<ParentContext>): ContextMatcherImplementation<
    ParentContext,
    ChildContext
  >

  childMatcher: Matcher<ChildContext>
  childContextResolvable: Resolvable<ChildContext, ParentContext, ChildContext>
}


export class ContextMatcherImplementation<ParentContext extends object, ChildContext extends object> extends MatcherBase<ParentContext> {
  static isMatcher = true;
  static type: 'context' = 'context';

  last?: {
    childContext?: ChildContext
    matcherInstance?: MatcherBase<any>
  };

  ['constructor']: ContextMatcher<ParentContext, ChildContext>
  constructor(options: MatcherOptions<ParentContext>) {
    super(options, true)
  }

  protected execute(): MatcherResult<Segment> {
    let childContextResolution: Resolution<ChildContext> =
      this.resolver.resolve(
        this.env,
        this.constructor.childContextResolvable,
        undefined,
        this.last && this.last.childContext
      )
    if (childContextResolution.status !== 'ready') {
      return {
        resolutionIds: [childContextResolution.id],
        segments: [createNotReadySegment(this.env.request, childContextResolution.error, this.appendFinalSlash)]
      }
    }

    // Need te memoize env, as its the key for memoization by the resolver
    let childContext = childContextResolution.value!
    if (!this.last || this.last.childContext !== childContext) {
      let childEnv: Env<ChildContext> = {
        request: this.env.request,
        context: childContext
      }
      this.last = {
        childContext,
        matcherInstance: new this.constructor.childMatcher({
          env: childEnv,
          resolver: this.resolver,
          appendFinalSlash: this.appendFinalSlash,
        })
      }
    }

    return this.last.matcherInstance!.getResult()
  }
}

export function withContext<ParentContext extends object=any, ChildContext extends object=any>(
  childContextResolvable: Resolvable<ChildContext, ParentContext, ChildContext>,
  childMatcher: Matcher<ChildContext>
): ContextMatcher<ParentContext, ChildContext> {
  if (process.env.NODE_ENV !== 'production') {
    if (childContextResolvable === undefined) {
      console.warn(
        `The first argument to createContext() should be the child context, but it was undefined. If you want to define an empty context, instead pass null.`,
      )
    }
  }

  return class extends ContextMatcherImplementation<ParentContext, ChildContext> {
    static childMatcher = childMatcher
    static childContextResolvable = childContextResolvable
  }
}

export function isValidContextMatcher(x: any): x is ContextMatcher {
  return x && x.prototype && x.prototype instanceof ContextMatcherImplementation
}