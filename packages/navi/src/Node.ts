import { Location, createURL } from './Location'
import { MappingMatch, matchMappingAgainstLocation, addParamNamesToMapping, AbsoluteMapping } from './Mapping'
import { Resolver, Resolvable } from './Resolver'
import { Route, RouteType } from './Route'
import { Junction } from './Junction'
import { Page } from './Page'
import { Redirect } from './Redirect'


export interface NodeBase<Context, RM extends NodeMatcher<Context> = NodeMatcher<Context>> {
    isNode: boolean;
    type: RouteType;

    // The params to extract from the matchable location part.
    paramNames: string[],

    new(options: NodeMatcherOptions<Context>): RM;
    prototype: RM;
}

export type Node = Junction | Page | Redirect

export interface ResolvableNode<N extends Node = Node, Context=any> extends Resolvable<N, Context> {
    isNode?: undefined;
}

export type MaybeResolvableNode<Context=any> = Node | ResolvableNode<Node, Context>

export interface NodeMatcherOptions<Context> {
    // The part of the location that hasn't been consumed by the parent,
    // and that can be matched by this Matcher object.
    matchableLocation: Location,

    // Contains details about where the mapping under which this
    // node is mounted
    mapping: AbsoluteMapping,

    // The router instance
    resolver: Resolver<Context>,

    // Whether page content should be fetched
    withContent?: boolean
}

export interface NodeMatcherResult<R extends Route = Route> {
    route?: R
    resolvables?: Resolvable<any>[]
}

export abstract class NodeMatcher<Context> {
    mapping: AbsoluteMapping;
    match?: MappingMatch;

    resolver: Resolver<Context>;
    withContent?: boolean

    ['constructor']: Node

    constructor(options: NodeMatcherOptions<Context>) {
        this.resolver = options.resolver
        this.withContent = options.withContent

        // Get the full route object for this junction, including information
        // on any params that it consumes.
        this.mapping = addParamNamesToMapping(options.mapping, this.constructor.paramNames)

        // Note that we'll have already matched the *path* part of the location
        // in the parent function. However, we may not have matched params that
        // are specified by the junction, so we need to perform another match.
        // However, this time we're guaranteed that the match will work.
        this.match = matchMappingAgainstLocation(this.mapping, options.matchableLocation)
    }

    // Get the route object given the current state.
    abstract execute(): NodeMatcherResult;

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
