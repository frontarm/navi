import { Location } from './Location'
import { ResolverResult, ResolverStatus, Resolvable } from './Resolver'
import { Route, JunctionRoute, RouteType, JunctionRouteChildren } from './Route'
import { createMapping, Mapping, createChildMapping, matchMappingAgainstLocation } from './Mapping'
import { NodeMatcher, NodeMatcherResult, Node, NodeBase, MaybeResolvableNode, ResolvableNode, NodeMatcherOptions } from './Node'


export type JunctionChildren<Context> = { [pattern: string]: MaybeResolvableNode<Context> }


export interface Junction<
    Meta = any,
    Children extends JunctionChildren<Context> = any,
    Context = any,
> extends NodeBase<Context, JunctionMatcher<Meta, Children, Context>> {
    type: RouteType.Junction

    new(options: NodeMatcherOptions<Context>): JunctionMatcher<Meta, Children, Context>;

    meta: Meta;
    children: Children;
    mappings: Mapping[],
}


export class JunctionMatcher<Meta, Children extends JunctionChildren<Context>, Context> extends NodeMatcher<Context> {
    static isNode = true
    static type: RouteType.Junction = RouteType.Junction

    childMatcherOptions?: NodeMatcherOptions<Context>
    childResolvableNode?: ResolvableNode<Node, Context>

    last?: {
        childResolvables: Resolvable<any>[],
        result: ResolverResult<Node>
        route: JunctionRoute<Meta, Children>
    };

    noMatchedChildRoute: JunctionRoute<Meta, Children>

    ['constructor']: Junction<Meta, Children, Context>;
    constructor(options: NodeMatcherOptions<Context>) {
        super(options)

        if (this.match) {
            let matchableLocation: Location =
                this.match.remainingLocation
                    ? this.match.remainingLocation
                    : { pathname: '/' }

            let mappings = this.constructor.mappings
            
            // Start from the beginning and take the first result, as child mounts
            // are sorted such that the first matching mount is the the most
            // precise match (and we always want to use the most precise match).
            for (let i = mappings.length - 1; i >= 0; i--) {
                let childMapping = createChildMapping(this.mapping, mappings[i])
                let match = matchMappingAgainstLocation(childMapping, matchableLocation)
                if (match) {
                    this.childMatcherOptions = {
                        matchableLocation: matchableLocation,
                        mapping: childMapping,
                        resolver: this.resolver,
                        withContent: this.withContent,
                    }
                    let childResolvable = childMapping.maybeResolvableNode
                    this.childResolvableNode = childResolvable.isNode
                        ? (() => childResolvable) as ResolvableNode<Node, Context>
                        : (childResolvable as ResolvableNode<Node, Context>)

                    // The first match is always the only match, as we don't allow
                    // for ambiguous patterns.
                    break
                }
            }
        }

        if (!this.childResolvableNode) {
            this.noMatchedChildRoute = this.createRoute(RouteType.Junction, {
                status: ResolverStatus.Ready,
                meta: this.constructor.meta,
                children: {},
                junction: this.constructor,
                activeRoutes: [],
                isNotFound: true,
            })
        }
    }

    execute(): NodeMatcherResult<JunctionRoute<Meta, Children>> {
        if (!this.match) {
            // This junction couldn't be matched due to missing required
            // params, or a non-exact match without a default path.
            return {}
        }

        if (!this.childResolvableNode) {
            return { route: this.noMatchedChildRoute }
        }

        let result = this.resolver.resolve(this.childResolvableNode, {
            type: this.constructor.type,
            location: this.match!.matchedLocation,
        })

        if (!this.last || this.last.result.id !== result.id) {
            let childMapping = this.childMatcherOptions!.mapping
            let { value, status, error } = result
            let isNotFound = false

            let activeChild: Route | undefined
            let childResolvables: Resolvable<any>[] = []
            let descendents: Route[] = []
            let children: JunctionRouteChildren<any> = {}

            if (value) {
                let childMatcher = new value(this.childMatcherOptions!)
                let matcherResult = childMatcher.execute()
                activeChild = matcherResult.route
                childResolvables = matcherResult.resolvables || []
                if (activeChild) {
                    if (activeChild.type === RouteType.Junction && activeChild.activeChild) {
                        descendents = [activeChild as Route].concat(activeChild.activeRoutes)
                    }
                    else {
                        descendents = [activeChild]
                    }
                }
                else {
                    isNotFound = true
                }
            }

            if (activeChild) {
                let pattern = childMapping.pattern
                children[pattern] = activeChild
            }

            // Only create a new route if necessary, to allow for reference-equality
            // based comparisons on routes
            this.last = {
                result,
                childResolvables,
                route: this.createRoute(RouteType.Junction, {
                    status,
                    error,
                    meta: this.constructor.meta,
                    isNotFound,
                    junction: this.constructor,
                    children: {},
                    activePattern: childMapping.pattern,
                    activeChild: activeChild,
                    terminus: descendents[descendents.length - 1],
                    activeRoutes: descendents,
                }),
            }
        }

        return {
            route: this.last.route,
            resolvables: [this.childResolvableNode].concat(this.last.childResolvables),
        }
    }
}


export function createJunctionTemplate<
    Meta,
    Children extends JunctionChildren<Context>,
    Context,
>(options: {
    children: Children,
    meta?: Meta,
    params?: string[],
}): Junction<Meta, Children, Context> {
    if (!options) {
        throw new Error(`createJunction() was supplied a function that doesn't return any value!`)
    }
    if (!options.children) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`createJunction() was called without a "children" option, but a junction without children doesn't make any sense!`)
        }
        options.children = {} as any
    }

    // Wildcards in PatternMap objects are null (\0) characters, so they'll
    // always be sorted to the top. As such, by sorting the patterns, the
    // most specific (i.e. without wildcard) will always be at the bottom.
    let mappings =
        Object.keys(options.children)
            .map(pattern => createMapping(pattern, options.children[pattern]))
            .sort((x, y) => compareStrings(x.key, y.key))

    if (process.env.NODE_ENV !== 'production') {
        let {
            children,
            meta,
            params,
            ...other
        } = options

        let unknownKeys = Object.keys(other)
        if (unknownKeys.length) {
            console.warn(`createJunction() received unknown options ${unknownKeys.map(x => `"${x}"`).join(', ')}.`)
        }

        if (mappings.length === 0) {
            console.warn(`createJunction() was called with an empty object {} for "children". This doesn't make any sense.`)
        }

        // Check to make sure that none of the junction supplied as patterns
        // may intefere with each other.
        let len = mappings.length
        if (mappings.length >= 2) {
            let previousPattern = mappings[len - 1]
            for (let i = len - 2; i >= 0; i--) {
                let pattern = mappings[i]

                // If previous pattern matches this one, and doesn't completely
                // replace it, and either item is a junction, then there could
                // be a conflict.
                // TODO: this warning will have false positives when a wildcard
                // is on a page and the junction is on a more specific element.
                let replacedKey = pattern.key.replace(previousPattern.regExp, '')
                if (replacedKey !== pattern.key && replacedKey.length > 0) {
                    if ((previousPattern.maybeResolvableNode.isNode && previousPattern.maybeResolvableNode.type === RouteType.Junction) ||
                        (pattern.maybeResolvableNode.isNode && pattern.maybeResolvableNode.type === RouteType.Junction))
                    console.warn(`createJunction() received Junctions for patterns "${previousPattern.pattern}" and "${pattern.pattern}", but this may lead to multiple junctions sharing the same URL.`)
                }

                previousPattern = pattern
            }
        }

        // Check for missing mountables on patterns
        for (let i = 0; i < len; i++) {
            if (!mappings[i].maybeResolvableNode) {
                let pattern = mappings[i].pattern
                console.warn(`createJunction() received "${typeof mappings[i].maybeResolvableNode}" for pattern "${pattern}"!`)       
            }
        }

        // Check that a junction hasn't been supplied at "/", as the junction
        // could interfere with this junction.
        let indexPattern = mappings.find(pattern => pattern.key === '/')
        if (indexPattern) {
            // Note that if we receive a split, we can't check the type, as we
            // won't know it until the split is loaded. But the same rules
            // still apply!
            if (indexPattern.maybeResolvableNode.isNode && indexPattern.maybeResolvableNode.type === RouteType.Junction) {
                console.warn(`createJunction() received a Junction at the "/" pattern, but "/" must be a Page or a Redirect!`)
            }
        }
    }

    return class extends JunctionMatcher<Meta, Children, Context> {
        static children = options.children
        static meta = options.meta as Meta
        static params = options.params || []
        static mappings = mappings
    }
}


function compareStrings(a, b) {   
    return (a<b?-1:(a>b?1:0));  
}