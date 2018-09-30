import { Context } from './Context'
import { Resolver, Resolvable } from './Resolver'
import { Segment, createNotFoundSegment } from './Segments'
import { Switch } from './Switch'
import { Page } from './Page'
import { Redirect } from './Redirect'
import { Env } from './Env'

export enum NaviNodeType {
    Switch = 'switch',
    Page = 'page',
    Redirect = 'redirect',
    Context = 'context'
}

export interface NaviNodeBase<Context extends object, RM extends NodeMatcher<Context> = NodeMatcher<Context>> {
    isNode: boolean;
    type: NaviNodeType;

    new(options: NodeMatcherOptions<Context>): RM;
    prototype: RM;
}

export type NaviNode = Switch | Page | Redirect | Context

export interface ResolvableNode<N extends NaviNode = NaviNode, Context extends object=any> extends Resolvable<N, Context> {
    isNode?: undefined;
}

export type MaybeResolvableNode<Context extends object=any> = NaviNode | ResolvableNode<NaviNode, Context>

export interface NodeMatcherOptions<Context extends object> {
    appendFinalSlash?: boolean
    env: Env<Context>;
    resolver: Resolver,
    withContent?: boolean
}

export interface NodeMatcherResult<S extends Segment = Segment> {
    segment: S
    resolutionIds: number[]
}

export abstract class NodeMatcher<Context extends object> {
    appendFinalSlash: boolean
    env: Env;
    resolver: Resolver;
    wildcard: boolean;
    withContent: boolean

    ['constructor']: NaviNode

    constructor(options: NodeMatcherOptions<Context>, wildcard = false) {
        this.appendFinalSlash = !!options.appendFinalSlash
        this.env = options.env
        this.resolver = options.resolver
        this.withContent = !!options.withContent

        this.wildcard = wildcard
    }

    // Get the segment object given the current state.
    getResult(): NodeMatcherResult {
        let unmatchedPathnamePart = this.env.unmatchedPathnamePart
        if (this.wildcard || !unmatchedPathnamePart || unmatchedPathnamePart === '/') {
            return this.execute()
        }
        else {
            // This switch couldn't be matched due to missing required
            // params, or a non-exact match without a default path.
            return {
                resolutionIds: [],
                segment: createNotFoundSegment(this.env)
            }
        }
    };
    
    protected abstract execute(): NodeMatcherResult;
}
