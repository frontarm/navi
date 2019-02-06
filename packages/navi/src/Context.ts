import { Resolution, Resolvable } from './Resolver'
import { Segment, createNotReadySegment } from './Segments'
import {
  Matcher,
  MatcherBase,
  MatcherResult,
  MatcherClass,
  MatcherOptions,
  MaybeResolvableMatcher,
} from './Matcher'
import { Env } from './Env'


export interface Context<ParentContext extends object = any, ChildContext extends object = any>
  extends MatcherClass<ParentContext, ContextMatcher<ParentContext, ChildContext>> {
  type: 'context'

  new (options: MatcherOptions<ParentContext>): ContextMatcher<
    ParentContext,
    ChildContext
  >

  childMatcherResolvable: Resolvable<Matcher>
  childContextResolvable: Resolvable<ChildContext>
}


export class ContextMatcher<ParentContext extends object, ChildContext extends object> extends MatcherBase<ParentContext> {
  static isMatcher = true;
  static type: 'context' = 'context';

  last?: {
    childContext?: ChildContext
    childEnv?: Env

    matcherInstance?: MatcherBase<any>
    matcher?: Matcher
  };

  ['constructor']: Context<ParentContext, ChildContext>
  constructor(options: MatcherOptions<ParentContext>) {
    super(options, true)
  }

  protected execute(): MatcherResult<Segment> {
    let childContextResolution: Resolution<ChildContext> = this.resolver.resolve(this.env, this.constructor.childContextResolvable)
    if (childContextResolution.status !== 'ready') {
      return {
        resolutionIds: [childContextResolution.id],
        segments: [createNotReadySegment(this.env.request, childContextResolution.error, this.appendFinalSlash)]
      }
    }

    // Need te memoize env, as its the key for memoization by the resolver
    let childContext = childContextResolution.value!
    let childEnv: Env<ChildContext>
    if (!this.last || this.last.childContext !== childContext) {
      childEnv = {
        ...this.env,
        context: childContext
      }
      this.last = {
        childContext,
        childEnv,
      }
    }
    else {
      childEnv = this.last.childEnv!
    }

    let childMatcherResolution = this.resolver.resolve(childEnv, this.constructor.childMatcherResolvable)
    if (childMatcherResolution.status !== 'ready') {
      return {
        resolutionIds: [childMatcherResolution.id],
        segments: [createNotReadySegment(childEnv.request, childMatcherResolution.error, this.appendFinalSlash)]
      }
    }

    // Memoize matcher so its env prop can be used as a key for the resolver
    let matcher = childMatcherResolution.value!
    let matcherInstance: MatcherBase<ChildContext>
    if (this.last.matcher !== matcher) {
      matcherInstance = new matcher({
        env: childEnv,
        resolver: this.resolver,
        appendFinalSlash: this.appendFinalSlash,
      })
      this.last = {
        ...this.last,
        matcher: matcher,
        matcherInstance: matcherInstance,
      }
    }
    else {
      matcherInstance = this.last.matcherInstance!
    }

    return matcherInstance.getResult()
  }
}

export function createContext<ParentContext extends object=any, ChildContext extends object=any>(
  maybeChildContextResolvable: ((env: Env<ParentContext>) => Promise<ChildContext> | ChildContext) | ChildContext,
  maybeChildMatcherResolvable: MaybeResolvableMatcher<ChildContext>
): Context<ParentContext, ChildContext> {
  if (process.env.NODE_ENV !== 'production') {
    if (maybeChildContextResolvable === undefined) {
      console.warn(
        `The first argument to createContext() should be the child context, but it was undefined. If you want to define an empty context, instead pass null.`,
      )
    }
  }

  let childMatcherResolvable: Resolvable<Matcher> =
    maybeChildMatcherResolvable.isMatcher ? (() => maybeChildMatcherResolvable) : (maybeChildMatcherResolvable as Resolvable<Matcher>)

  let childContextResolvable: Resolvable<ChildContext> =
    (typeof maybeChildContextResolvable !== 'function')
      ? (() => maybeChildContextResolvable)
      : (maybeChildContextResolvable as any)

  return class extends ContextMatcher<ParentContext, ChildContext> {
    static childMatcherResolvable = childMatcherResolvable
    static childContextResolvable = childContextResolvable
  }
}

export function isValidContext(x: any): x is Context {
  return x && x.prototype && x.prototype instanceof ContextMatcher
}