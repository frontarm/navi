import { Resolution, Resolvable, undefinedResolver } from './Resolver'
import { Status, RouteType, PageRoute, Route, createRoute, createPlaceholderRoute } from './Route'
import {
  Node,
  NodeMatcher,
  NodeMatcherResult,
  NodeBase,
  NodeMatcherOptions,
  MaybeResolvableNode,
} from './Node'
import { RouterEnv } from './RouterEnv'


export interface Context<ParentContext = any, ChildContext = any>
  extends NodeBase<ParentContext, ContextMatcher<ParentContext, ChildContext>> {
  type: 'Context'

  new (options: NodeMatcherOptions<ParentContext>): ContextMatcher<
    ParentContext,
    ChildContext
  >

  childNodeResolvable: Resolvable<Node>
  childContextResolvable: Resolvable<ChildContext>
}


export class ContextMatcher<ParentContext, ChildContext> extends NodeMatcher<ParentContext> {
  static isNode = true;
  static type: 'Context' = 'Context';

  last?: {
    childContext?: ChildContext
    childEnv?: RouterEnv

    matcher?: NodeMatcher<any>
    node?: Node
  };

  ['constructor']: Context<ParentContext, ChildContext>
  constructor(options: NodeMatcherOptions<ParentContext>) {
    super(options, true)
  }

  protected execute(): NodeMatcherResult<Route> {
    let childContextResolution: Resolution<ChildContext> = this.resolver.resolve(this.env, this.constructor.childContextResolvable)
    if (childContextResolution.status !== Status.Ready) {
      return {
        resolutionIds: [childContextResolution.id],
        route: createPlaceholderRoute(this.env, childContextResolution.error)
      }
    }

    // Need te memoize env, as its the key for memoization by the resolver
    let childContext = childContextResolution.value!
    let childEnv: RouterEnv<ChildContext>
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
        route: createPlaceholderRoute(childEnv, childNodeResolution.error)
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

export function createContext<ParentContext=any, ChildContext=any>(
  maybeChildContextResolvable: ((env: RouterEnv<ParentContext>) => Promise<ChildContext> | ChildContext) | ChildContext,
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

  let childNodeResolvable: Resolvable<Node> =
    maybeChildNodeResolvable.isNode ? (() => maybeChildNodeResolvable) : (maybeChildNodeResolvable as Resolvable<Node>)

  let childContextResolvable: Resolvable<ChildContext> =
    (typeof maybeChildContextResolvable !== 'function') ? (() => maybeChildContextResolvable) : maybeChildContextResolvable

  return class extends ContextMatcher<ParentContext, ChildContext> {
    static childNodeResolvable = childNodeResolvable
    static childContextResolvable = childContextResolvable
  }
}
