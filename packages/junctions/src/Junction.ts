import { Location } from './Location'
import {
  Resolution,
  ResolverStatus,
  Resolvable,
  undefinedResolver,
} from './Resolver'
import {
  Route,
  JunctionRoute,
  RouteType,
  RouteStatus,
  RouteContentStatus,
} from './Route'
import { RouterEnv } from './RouterEnv'
import {
  createMapping,
  Mapping,
  createChildMapping,
  matchMappingAgainstLocation,
} from './Mapping'
import {
  NodeMatcher,
  NodeMatcherResult,
  Node,
  NodeBase,
  MaybeResolvableNode,
  ResolvableNode,
  NodeMatcherOptions,
} from './Node'
import { NotFoundError } from './Errors'

export type JunctionPaths<Context> = {
  [pattern: string]: MaybeResolvableNode<Context>
}

export interface Junction<Meta = any, Content = any, Context = any>
  extends NodeBase<Context, JunctionMatcher<Meta, Content, Context>> {
  type: RouteType.Junction

  new (options: NodeMatcherOptions<Context>): JunctionMatcher<
    Meta,
    Content,
    Context
  >

  meta: Meta
  getContent?: ((env: RouterEnv<Context>) => Content | PromiseLike<Content>)
  paths: JunctionPaths<Context>
  mappings: Mapping[]
  patterns: string[]
}

export class JunctionMatcher<Meta, Content, Context> extends NodeMatcher<
  Context
> {
  static isNode = true
  static type: RouteType.Junction = RouteType.Junction

  childMatcherOptions?: NodeMatcherOptions<Context>
  childMaybeResolvableNode?: MaybeResolvableNode<Node>

  last?: {
    resolutionIds: number[]
    childMatcher?: NodeMatcher<any>
    childNodeResolution?: Resolution<Node>
    contentResolution: Resolution<Content>
    route: JunctionRoute<Meta, Content>
  };

  ['constructor']: Junction<Meta, Content, Context>
  constructor(options: NodeMatcherOptions<Context>) {
    super(options)

    if (this.match) {
      let matchableLocation: Location = this.match.remainingLocation
        ? this.match.remainingLocation
        : { pathname: '/' }

      let mappings = this.constructor.mappings

      // Start from the beginning and take the first result, as child mounts
      // are sorted such that the first matching mount is the the most
      // precise match (and we always want to use the most precise match).
      for (let i = mappings.length - 1; i >= 0; i--) {
        let childMapping = createChildMapping(
          this.mapping,
          mappings[i],
          this.match.matchedLocation,
        )
        let match = matchMappingAgainstLocation(childMapping, matchableLocation)
        if (match) {
          this.childMatcherOptions = {
            context: this.env.context,
            matchableLocation: matchableLocation,
            mapping: childMapping,
            resolver: this.resolver,
            router: this.env.router,
            withContent: this.withContent,
          }
          this.childMaybeResolvableNode = childMapping.maybeResolvableNode

          // The first match is always the only match, as we don't allow
          // for ambiguous patterns.
          break
        }
      }
    }
  }

  run(): NodeMatcherResult<JunctionRoute<Meta, Content>> {
    return super.run() as any
  }

  protected execute(): NodeMatcherResult<JunctionRoute<Meta, Content>> {
    let hasContent = this.withContent && this.constructor.getContent
    let contentResolution: Resolution<Content | undefined>
    let contentResolvable: Resolvable<Content | undefined> = hasContent
      ? this.constructor.getContent!
      : undefinedResolver

    contentResolution = this.resolver.resolve(this, contentResolvable)

    let childNodeResolution: Resolution<Node> | undefined
    let resolutionIds: number[] = [contentResolution.id]
    if (this.childMaybeResolvableNode) {
      if (this.childMaybeResolvableNode.isNode) {
        childNodeResolution = {
          id: -1,
          status: ResolverStatus.Ready,
          value: this.childMaybeResolvableNode as Node,
        }
      } else {
        childNodeResolution = this.resolver.resolve(
          this,
          this.childMaybeResolvableNode as ResolvableNode<Node>,
        )
        resolutionIds.push(childNodeResolution.id)
      }
    }

    let childMatcher: NodeMatcher<any> | undefined
    let matcherResult: NodeMatcherResult | undefined
    if (childNodeResolution) {
      if (!this.last || this.last.childNodeResolution !== childNodeResolution) {
        if (childNodeResolution.value) {
          childMatcher = new childNodeResolution.value(this.childMatcherOptions!)
        }
      } else {
        childMatcher = this.last.childMatcher
      }
    }
    if (childMatcher) {
      matcherResult = childMatcher.run()
    }

    if (
      !this.last ||
      (matcherResult && matcherResult.route) !== this.last.route ||
      contentResolution !== this.last.contentResolution
    ) {
      let childMapping = this.childMatcherOptions && this.childMatcherOptions.mapping
      let error: any | undefined
      let status: RouteStatus | undefined
      let nextRoute: Route | undefined
      let childResolutionIds: number[] = []
      let remainingRoutes: Route[] = []

      nextRoute = matcherResult && matcherResult.route
      childResolutionIds = (matcherResult && matcherResult.resolutionIds) || []

      if (childNodeResolution) {
        error = childNodeResolution.error
        status = (childNodeResolution.status as string) as RouteStatus
      }
      if (nextRoute) {
        if (nextRoute.type === RouteType.Junction && nextRoute.nextRoute) {
          remainingRoutes = [nextRoute as Route].concat(
            nextRoute.remainingRoutes,
          )
        } else {
          remainingRoutes = [nextRoute]
        }
      } else if (
        !childNodeResolution ||
        (!childNodeResolution.error &&
          childNodeResolution.status !== ResolverStatus.Busy)
      ) {
        error = new NotFoundError(this.match)
        status = RouteStatus.Error
      }

      // Only create a new route if necessary, to allow for reference-equality
      // based comparisons on routes
      this.last = {
        childNodeResolution,
        childMatcher,
        contentResolution,
        resolutionIds: resolutionIds.concat(childResolutionIds),
        route: this.createRoute(RouteType.Junction, {
          status: (status as string) as RouteStatus,
          error,
          contentStatus: hasContent
            ? ((contentResolution.status as string) as RouteContentStatus)
            : RouteContentStatus.Unrequested,
          contentError: contentResolution.error,
          content: contentResolution.value,
          meta: this.constructor.meta,
          junction: this.constructor,
          nextPattern: childMapping && childMapping.pattern,
          nextRoute,
          lastRemainingRoute: remainingRoutes[remainingRoutes.length - 1],
          remainingRoutes,
        }),
      }
    }

    return {
      route: this.last.route,
      resolutionIds: resolutionIds.concat(this.last.resolutionIds),
    }
  }
}

export function createJunction<Meta, Content, Context>(options: {
  paths: JunctionPaths<Context>
  meta?: Meta
  useParams?: string[]
  getContent?: (env: RouterEnv<Context>) => Content | Promise<Content>
}): Junction<Meta, Content, Context> {
  if (!options) {
    throw new Error(
      `createJunction() was supplied a function that doesn't return any value!`,
    )
  }
  if (!options.paths) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `createJunction() was called without a "children" option, but a junction without children doesn't make any sense!`,
      )
    }
    options.paths = {} as any
  }

  // Wildcards in PatternMap objects are null (\0) characters, so they'll
  // always be sorted to the top. As such, by sorting the patterns, the
  // most specific (i.e. without wildcard) will always be at the bottom.
  let mappings = Object.keys(options.paths)
    .map(pattern => createMapping(pattern, options.paths[pattern]))
    .sort((x, y) => compareStrings(x.key, y.key))

  if (process.env.NODE_ENV !== 'production') {
    let { paths, meta, useParams, getContent, ...other } = options

    let unknownKeys = Object.keys(other)
    if (unknownKeys.length) {
      console.warn(
        `createJunction() received unknown options ${unknownKeys
          .map(x => `"${x}"`)
          .join(', ')}.`,
      )
    }

    if (mappings.length === 0) {
      console.warn(
        `createJunction() was called with an empty object {} for "children". This doesn't make any sense.`,
      )
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
          if (
            (previousPattern.maybeResolvableNode.isNode &&
              previousPattern.maybeResolvableNode.type ===
                RouteType.Junction) ||
            (pattern.maybeResolvableNode.isNode &&
              pattern.maybeResolvableNode.type === RouteType.Junction)
          )
            console.warn(
              `createJunction() received Junctions for patterns "${
                previousPattern.pattern
              }" and "${
                pattern.pattern
              }", but this may lead to multiple junctions sharing the same URL.`,
            )
        }

        previousPattern = pattern
      }
    }

    // Check for missing mountables on patterns
    for (let i = 0; i < len; i++) {
      if (!mappings[i].maybeResolvableNode) {
        let pattern = mappings[i].pattern
        console.warn(
          `createJunction() received "${typeof mappings[i]
            .maybeResolvableNode}" for pattern "${pattern}"!`,
        )
      }
    }

    // Check that a junction hasn't been supplied at "/", as the junction
    // could interfere with this junction.
    let indexPattern = mappings.find(pattern => pattern.key === '/')
    if (indexPattern) {
      // Note that if we receive a split, we can't check the type, as we
      // won't know it until the split is loaded. But the same rules
      // still apply!
      if (
        indexPattern.maybeResolvableNode.isNode &&
        indexPattern.maybeResolvableNode.type === RouteType.Junction
      ) {
        console.warn(
          `createJunction() received a Junction at the "/" pattern, but "/" must be a Page or a Redirect!`,
        )
      }
    }
  }

  return class extends JunctionMatcher<Meta, Content, Context> {
    static paths = options.paths
    static meta = options.meta as Meta
    static useParams = options.useParams || []
    static mappings = mappings
    static patterns = mappings.map(mapping => mapping.pattern)
    static getContent = options.getContent
  }
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}
