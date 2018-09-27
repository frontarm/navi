import { Location, createURL } from './Location'
import { MappingMatch, matchMappingAgainstLocation, addParamNamesToMapping, AbsoluteMapping } from './Mapping'
import { Resolver, Resolvable } from './Resolver'
import { Router } from './Router'
import { Route, RouteType } from './Route'
import { Junction } from './Junction'
import { Page } from './Page'
import { Redirect } from './Redirect'
import { RouterEnv } from './RouterEnv';


export interface NodeBase<Context, RM extends NodeMatcher<Context> = NodeMatcher<Context>> {
    isNode: boolean;
    type: RouteType;

    // The params to extract from the matchable location part.
    useParams: string[],

    new(options: NodeMatcherOptions<Context>): RM;
    prototype: RM;
}

export type Node = Junction | Page | Redirect

export interface ResolvableNode<N extends Node = Node, Context=any> extends Resolvable<N, Context> {
    isNode?: undefined;
}

export type MaybeResolvableNode<Context=any> = Node | ResolvableNode<Node, Context>

export interface NodeMatcherOptions<Context> {
    context: Context,

    // The part of the location that hasn't been consumed by the parent,
    // and that can be matched by this Matcher object.
    matchableLocation: Location,

    // Contains details about where the mapping under which this
    // node is mounted
    mapping: AbsoluteMapping,

    router: Router<Context>,

    // The router instance
    resolver: Resolver,

    // Whether page content should be fetched
    withContent?: boolean
}

export interface NodeMatcherResult<R extends Route = Route> {
    route?: R
    resolutionIds?: number[]
}

export abstract class NodeMatcher<Context> {
    resolver: Resolver;
    mapping: AbsoluteMapping;

    withContent?: boolean

    env: RouterEnv<Context>
    match: MappingMatch;

    ['constructor']: Node

    constructor(options: NodeMatcherOptions<Context>) {
        this.resolver = options.resolver
        this.withContent = options.withContent

        // Get the full route object for this junction, including information
        // on any params that it consumes.
        this.mapping = addParamNamesToMapping(options.mapping, this.constructor.useParams)

        // Note that we'll have already matched the *path* part of the location
        // in the parent function. However, we may not have matched params that
        // are specified by the junction, so we need to perform another match.
        // However, this time we're guaranteed that the match will work.
        let match = matchMappingAgainstLocation(this.mapping, options.matchableLocation)
        
        if (match) {
            this.match = match
            this.env = new RouterEnv(
                options.context,
                this.match.matchedLocation,
                this.match.params,
                options.router,
                createURL(this.match!.matchedLocation),
            )
        }
    }

    // Get the route object given the current state.
    run(): NodeMatcherResult {
        if (!this.match) {
            // This junction couldn't be matched due to missing required
            // params, or a non-exact match without a default path.
            return {}
        }

        return this.execute()
    };
    
    protected abstract execute(): NodeMatcherResult;

    protected createRoute<Type extends string, Details>(type: Type, details: Details) {
        return Object.assign({
            type: type,
            params: (this.match && this.match.params) || {},
            location: this.match!.matchedLocation,
            url: createURL(this.match!.matchedLocation),
            node: this.constructor,
            meta: <any>undefined,
        }, details)
    }
}
