import { Status, Resolution, Resolvable } from './Resolver'
import { Segment, createPlaceholderSegment } from './Segments'
import {
  NaviNode,
  NodeMatcher,
  NodeMatcherResult,
  NaviNodeBase,
  NodeMatcherOptions,
  MaybeResolvableNode,
  NaviNodeType,
} from './Node'
import { Env } from './Env'


export interface Context<ParentContext extends object = any, ChildContext extends object = any>
  extends NaviNodeBase<ParentContext, ContextMatcher<ParentContext, ChildContext>> {
  type: NaviNodeType.Context

  new (options: NodeMatcherOptions<ParentContext>): ContextMatcher<
    ParentContext,
    ChildContext
  >

  childNodeResolvable: Resolvable<NaviNode>
  childContextResolvable: Resolvable<ChildContext>
}


export class ContextMatcher<ParentContext extends object, ChildContext extends object> extends NodeMatcher<ParentContext> {
  static isNode = true;
  static type: NaviNodeType.Context = NaviNodeType.Context;

  last?: {
    childContext?: ChildContext
    childEnv?: Env

    matcher?: NodeMatcher<any>
    node?: NaviNode
  };

  ['constructor']: Context<ParentContext, ChildContext>
  constructor(options: NodeMatcherOptions<ParentContext>) {
    super(options, true)
  }

  protected execute(): NodeMatcherResult<Segment> {
    let childContextResolution: Resolution<ChildContext> = this.resolver.resolve(this.env, this.constructor.childContextResolvable)
    if (childContextResolution.status !== Status.Ready) {
      return {
        resolutionIds: [childContextResolution.id],
        segment: createPlaceholderSegment(this.env, childContextResolution.error)
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

    let childNodeResolution = this.resolver.resolve(childEnv, this.constructor.childNodeResolvable)
    if (childNodeResolution.status !== Status.Ready) {
      return {
        resolutionIds: [childNodeResolution.id],
        segment: createPlaceholderSegment(childEnv, childNodeResolution.error)
      }
    }

    // Memoize matcher so its env prop can be used as a key for the resolver
    let node = childNodeResolution.value!
    let matcher: NodeMatcher<ChildContext>
    if (this.last.node !== node) {
      matcher = new node({
        env: childEnv,
        resolver: this.resolver,
        withContent: this.withContent,
        appendFinalSlash: this.appendFinalSlash,
      })
      this.last = {
        ...this.last,
        node,
        matcher,
      }
    }
    else {
      matcher = this.last.matcher!
    }

    return matcher.getResult()
  }
}

export function createContext<ParentContext extends object=any, ChildContext extends object=any>(
  maybeChildContextResolvable: ((env: Env<ParentContext>) => Promise<ChildContext> | ChildContext) | ChildContext,
  maybeChildNodeResolvable: MaybeResolvableNode<ChildContext>,
  options: { useParams?: string[] } = {}
): Context<ParentContext, ChildContext> {
  if (process.env.NODE_ENV !== 'production') {
    let { useParams, ...other } = options

    let unknownKeys = Object.keys(other)
    if (unknownKeys.length) {
      console.warn(
        `createContext() received unknown options ${unknownKeys
          .map(x => `"${x}"`)
          .join(', ')}.`,
      )
    }

    if (maybeChildContextResolvable === undefined) {
      console.warn(
        `The first argument to createContext() should be the child context, but it was undefined. If you want to define an empty context, instead pass null.`,
      )
    }
  }

  let childNodeResolvable: Resolvable<NaviNode> =
    maybeChildNodeResolvable.isNode ? (() => maybeChildNodeResolvable) : (maybeChildNodeResolvable as Resolvable<NaviNode>)

  let childContextResolvable: Resolvable<ChildContext> =
    (typeof maybeChildContextResolvable !== 'function') ? (() => maybeChildContextResolvable) : maybeChildContextResolvable

  return class extends ContextMatcher<ParentContext, ChildContext> {
    static childNodeResolvable = childNodeResolvable
    static childContextResolvable = childContextResolvable
  }
}
