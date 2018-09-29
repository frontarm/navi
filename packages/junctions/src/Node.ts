import { Context } from './Context'
import { NotFoundError } from './Errors'
import { Resolver, Resolvable } from './Resolver'
import { Route, RouteType, PlaceholderRoute, Status, createNotFoundRoute } from './Route'
import { Junction } from './Junction'
import { Page } from './Page'
import { Redirect } from './Redirect'
import { RouterEnv } from './RouterEnv'


export interface NodeBase<Context, RM extends NodeMatcher<Context> = NodeMatcher<Context>> {
    isNode: boolean;
    type: RouteType | 'Context';

    new(options: NodeMatcherOptions<Context>): RM;
    prototype: RM;
}

export type Node = Junction | Page | Redirect | Context

export interface ResolvableNode<N extends Node = Node, Context=any> extends Resolvable<N, Context> {
    isNode?: undefined;
}

export type MaybeResolvableNode<Context=any> = Node | ResolvableNode<Node, Context>

export interface NodeMatcherOptions<Context> {
    appendFinalSlash?: boolean
    env: RouterEnv<Context>;
    resolver: Resolver,
    withContent?: boolean
}

export interface NodeMatcherResult<R extends Route = Route> {
    route: R
    resolutionIds: number[]
}

export abstract class NodeMatcher<Context> {
    appendFinalSlash: boolean
    env: RouterEnv;
    resolver: Resolver;
    wildcard: boolean;
    withContent: boolean

    ['constructor']: Node

    constructor(options: NodeMatcherOptions<Context>, wildcard = false) {
        this.appendFinalSlash = !!options.appendFinalSlash
        this.env = options.env
        this.resolver = options.resolver
        this.withContent = !!options.withContent

        this.wildcard = wildcard
    }

    // Get the route object given the current state.
    getResult(): NodeMatcherResult {
        let unmatchedPathnamePart = this.env.unmatchedPathnamePart
        if (this.wildcard || !unmatchedPathnamePart || unmatchedPathnamePart === '/') {
            return this.execute()
        }
        else {
            // This junction couldn't be matched due to missing required
            // params, or a non-exact match without a default path.
            return {
                resolutionIds: [],
                route: createNotFoundRoute(this.env)
            }
        }
    };
    
    protected abstract execute(): NodeMatcherResult;
}
