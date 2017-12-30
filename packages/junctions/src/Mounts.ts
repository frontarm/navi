import { Location, concatLocations } from './Location'
import { CompiledPattern, MountedPattern, PatternMatch, createChildMountedPattern, matchMountedPatternAgainstLocation, addParamsToMountedPattern } from './Patterns'
import { MountableRoute, JunctionRoute, JunctionChildRoute, JunctionDescendentsRoutes, PageRoute, RedirectRoute, NotFoundRoute, Route } from './Routes'
import { JunctionManager } from './JunctionManager'


export type Mountable = Junction<any, any, any> | Page<any, any, any> | Redirect

export type AsyncMountable<M extends Mountable = Mountable> = AsyncObject<M>
export type AsyncContent<Content> = AsyncObject<Content>

type AsyncObject<T> = {
    type: 'Async',
    status?: 'ready' | 'busy' | 'error',
    getter: (junctionManager: JunctionManager) => Promise<T> | T,
    promise?: Promise<T>,

    // Note that this value may actually be undefined, but I've left the
    // undefined type out as it allows us to access the type using TypeScript
    // mapped types, and this should never be visible to the user anyway.
    value: T
}

export type Mount = JunctionMount<any, any, any> | PageMount<any, any, any> | RedirectMount


interface BaseMountOptions {
    // The params to extract from the matchable location part. A value of
    // `false` indicates optional params, while `true` indicates required.
    params: {
        [name: string]: boolean
    },

    // The part of the location that was consumed by the parent.
    parentLocationPart: Location,

    // The part of the location that hasn't been consumed by the parent,
    // and that can be matched by this Mountable object.
    matchableLocationPart: Location,

    // The mount object, containing details about the absolute locations
    // where this mountable is mounted.
    mountedPattern: MountedPattern,

    // Indicate to the parent that it needs to refresh the route object.
    onRouteChange: () => void,

    // Functions that may be used within configuration getters.
    junctionManager: JunctionManager,
}

// The user-created Mountable classes need to supply some of the base
// mountable objects from within their constructors.
export type MountOptions = Pick<BaseMountOptions,
    'parentLocationPart' |
    'matchableLocationPart' |
    'mountedPattern' |
    'onRouteChange' |
    'junctionManager'
>

interface BaseMountable {
    type: 'Mountable';
    new(options: MountOptions): Mount;
}

abstract class BaseMount {
    mountedPattern: MountedPattern;

    // Information that will be used when creating a Route object.
    match: PatternMatch | undefined;
    routeLocation: Location;
    matchableLocationPart: Location;

    waitingForWatch: boolean
    unmounted: boolean
    private onRouteChange: () => void;

    junctionManager: JunctionManager;

    constructor(options: BaseMountOptions) {
        let { 
            parentLocationPart,
            matchableLocationPart,
            mountedPattern: patternWithoutSearchParams,
            params,
        } = options

        this.handleRouteChange = this.handleRouteChange.bind(this)

        // Get the full mount object for this junction, including information
        // on any params that it consumes.
        this.mountedPattern = addParamsToMountedPattern(patternWithoutSearchParams, params)

        this.waitingForWatch = false
        this.unmounted = false
        this.onRouteChange = options.onRouteChange
        this.junctionManager = options.junctionManager

        // Note that we'll have already matched the *path* part of the location
        // in the parent function. However, we may not have matched params that
        // are specified by the junction, so we need to perform another match.
        this.match = matchMountedPatternAgainstLocation(this.mountedPattern, matchableLocationPart)
        this.routeLocation = concatLocations(parentLocationPart, this.match ? this.match.matchedLocation : matchableLocationPart)
        this.matchableLocationPart = options.matchableLocationPart
    }

    willUnmount() {
        this.unmounted = true
    }

    isBusy(): boolean {
        return !!this.waitingForWatch
    }

    // Get the route object given the current state.
    abstract getRoute(): MountableRoute | NotFoundRoute;

    protected createNotFoundRoute(): NotFoundRoute {
        return {
            type: 'NotFoundRoute',
            status: 'notfound',
            location: this.matchableLocationPart,
            pattern: undefined,
            params: {},
            source: <any>this.constructor,
        }
    }

    protected handleRouteChange() {
        if (!this.unmounted) {
            this.onRouteChange()
        }
    }

    protected watchAsync<AO extends AsyncObject<any>>(async: AO, event: object, callback: (status: 'ready' | 'busy' | 'error', value?: AO['value']) => void): void {
        if (!async.status || async.status == 'ready') {
            let result = async.getter(this.junctionManager)

            // Not all promise libraries use the ES6 `Promise` constructor,
            // so there isn't a better way to check if it's a promise :-(
            if (result && result.then) {
                async.promise = result
                async.status = 'busy'
            }
            else {
                async.value = result
                async.status = 'ready'
            }
        }
        if (async.status === 'ready') {
            callback('ready', async.value)
        }
        if (async.status === 'busy' && async.promise) {
            callback('busy')
            this.waitingForWatch = true
            this.junctionManager.onEvent({
                ...event,
                type: event['type'] + 'Start',
            } as any)
            async.promise
                .then(
                    (value) => {
                        async.status = 'ready'
                        async.value = value
                        callback(async.status, async.value)
                    },
                    (error) => {
                        async.status = 'error'
                        async.promise = undefined
                        callback('error')
                    }
                )
                .then(() => {
                    this.waitingForWatch = false
                    this.junctionManager.onEvent({
                        ...event,
                        type: event['type'] + 'End',
                    } as any)
                    this.handleRouteChange()
                })
        }
    }
}


export interface Junction<
    Children extends { [pattern: string]: Mountable | AsyncMountable } = any,
    Component = undefined,
    Payload = undefined
> extends BaseMountable, JunctionOptions<Children, Component, Payload> {
    mountableType: 'Junction'

    new(options: BaseMountOptions, junctionOptions: JunctionOptions<Children, Component, Payload>): JunctionMount<Children, Component, Payload>;
}

export interface JunctionOptions<
    Children extends { [pattern: string]: Mountable | AsyncMountable } = any,
    Component = undefined,
    Payload = undefined
> {
    children: Children;
    component: Component;
    payload: Payload;
    defaultPath: keyof Children | null,

    cache: any,
    childCompiledPatterns: CompiledPattern[],
}

export class JunctionMount<
    Children extends { [pattern: string]: Mountable | AsyncMountable } = any,
    Component = undefined,
    Payload = undefined
> extends BaseMount {
    mountType: 'Junction' = 'Junction';

    options: JunctionOptions<Children, Component, Payload>

    redirectTo?: Location;

    childMountedPattern?: MountedPattern;
    childMount?: Mount;
    childStatus: 'ready' | 'busy' | 'error';

    constructor(options: BaseMountOptions, junctionOptions: JunctionOptions<Children, Component, Payload>) {
        super(options)

        if (this.match) {
            this.options = junctionOptions

            if (!this.match.remainingLocation) {
                if (junctionOptions.defaultPath !== null) {
                    // If we do have a default path, treat this junctiona s a
                    // redirect to that path.
                    this.redirectTo = concatLocations(this.routeLocation, { pathname: junctionOptions.defaultPath })
                }
            }
            else {
                let remainingLocation = this.match.remainingLocation
                let compiledPatterns = junctionOptions.childCompiledPatterns

                // Start from the beginning and take the first result, as child mounts
                // are sorted such that the first matching mount is the the most
                // precise match (and we always want to use the most precise match).
                for (let i = compiledPatterns.length - 1; i >= 0; i--) {
                    let childMountedPattern = createChildMountedPattern(this.mountedPattern, compiledPatterns[i])
                    let match = matchMountedPatternAgainstLocation(childMountedPattern, remainingLocation)
                    if (match) {
                        this.childMountedPattern = childMountedPattern

                        let childMountOptions = {
                            parentLocationPart: this.routeLocation,
                            matchableLocationPart: this.match.remainingLocation,
                            mountedPattern: this.childMountedPattern,
                            onRouteChange: this.handleRouteChange,
                            junctionManager: this.junctionManager,
                        }

                        if (childMountedPattern.mountable.type === 'Mountable') {
                            // We have already fetched this mount, so we can
                            // create an instance and be done.
                            this.childMount = new childMountedPattern.mountable(childMountOptions)
                            this.childStatus = 'ready'
                        }
                        else if (childMountedPattern.mountable.value) {
                            this.childMount = new childMountedPattern.mountable.value(childMountOptions)
                            this.childStatus = 'ready'
                        }
                        else {
                            this.watchAsync(
                                childMountedPattern.mountable,
                                {
                                    type: 'junctionChild',
                                    location: concatLocations(this.routeLocation, match.matchedLocation),
                                },
                                (status, value) => {
                                    if (value) {
                                        this.childMount = new value(childMountOptions)
                                    }
                                    this.childStatus = status
                                }
                            )
                        }

                        // The first match is always the only match, as we don't allow
                        // for ambiguous patterns.
                        break
                    }
                }
            }
        }
    }

    willUnmount() {
        if (this.childMount) {
            this.childMount.willUnmount()
        }

        super.willUnmount()
    }

    isBusy(): boolean {
        return !!this.waitingForWatch || !!(this.childMount && this.childMount.isBusy())
    }

    getRoute(): JunctionRoute<any, any, any> | RedirectRoute<any> | NotFoundRoute {
        if (!this.match) {
            // This junction couldn't be matched due to missing required
            // params, or a non-exact match without a default path.
            return this.createNotFoundRoute()
        }
        else if (this.redirectTo) {
            // This junction was matched exactly, and we have a default path,
            // so redirect to it.
            return {
                type: 'RedirectRoute',
                status: 'redirect',
                pattern: this.mountedPattern.relativePattern,
                params: {},
                location: this.routeLocation,
                to: this.redirectTo,
                component: <never>undefined,
                source: <any>this.constructor,
            }
        }
        else {
            let child: Route | undefined
            let descendents: JunctionDescendentsRoutes<any> | undefined

            if (!this.childMountedPattern && this.match.remainingLocation) {
                // This junction was matched, but we couldn't figure out what to do
                // with the remaining location part.
                child = {
                    type: 'NotFoundRoute',
                    status: 'notfound',
                    location: concatLocations(this.routeLocation, this.match.remainingLocation),
                    params: {},
                    source: <any>this.constructor,
                }
                descendents = [child]
            }
            else if (this.childStatus === 'ready') {
                child = (this.childMount as Mount).getRoute()
                descendents = getDescendents(child)
            }
            else if (this.childMountedPattern) {
                // If `childMountedPattern` exists, we know that
                // `this.match.remainingLocation` is not undefined.
                let remainingLocation = this.match.remainingLocation as Location

                child = {
                    type: 'AsyncRoute',
                    status: this.childStatus,
                    location: concatLocations(this.routeLocation, remainingLocation),
                    pattern: this.childMountedPattern.relativePattern,
                    params: {},
                    source: <any>this.constructor,
                }
                descendents = [child]
            }

            return {
                type: 'JunctionRoute' as 'JunctionRoute',
                status: 'ready',
                pattern: this.mountedPattern.relativePattern,
                params: this.match.params,
                location: this.routeLocation,
                component: this.options.component,
                payload: this.options.payload,
                child: child,
                descendents: descendents,
                source: this.constructor,
            }
        }
    }
}

function getDescendents(child: JunctionChildRoute<any>) {
    let descendents = [child] as JunctionDescendentsRoutes<any>
    let nextChild: Route | undefined = child
    while (nextChild && nextChild.type === "JunctionRoute") {
        nextChild = nextChild.child
        if (nextChild) {
            descendents.push(nextChild)
        }
    }
    return descendents
}


//
// Page
//

export interface Page<
    Component = undefined,
    Content = undefined,
    Meta = undefined
> extends BaseMountable, PageOptions<Component, Content, Meta> {
    mountableType: 'Page'
    
    new(options: BaseMountOptions, pageOptions: PageOptions<Component, Content, Meta>): PageMount<Component, Content, Meta>;
}

export interface PageOptions<
    Component = undefined,
    Content = undefined,
    Meta = undefined
> {
    title: string
    component: Component
    meta: Meta
    asyncContent: AsyncContent<Content>
}

export class PageMount<
    Component = undefined,
    Content = undefined,
    Meta = undefined
> extends BaseMount {
    mountType: 'Page' = 'Page';
    options: PageOptions<Component, Content, Meta>;

    content?: Content;
    contentStatus: 'ready' | 'busy' | 'error';
    
    constructor(options: BaseMountOptions, pageOptions: PageOptions<Component, Content, Meta>) {
        super(options)

        if (!this.match || this.match.remainingLocation) {
            // A page route only matches exact locations; if the match
            // isn't exact, remove it and return a NotFoundRoute.
            delete this.match
        }
        else {
            this.options = pageOptions

            this.watchAsync(
                pageOptions.asyncContent,
                { type: 'content', location: this.routeLocation },
                (status, value) => {
                    this.content = value
                    this.contentStatus = status
                }
            )
        }
    }

    getRoute(): PageRoute<any, any, any> | NotFoundRoute {
        if (!this.match) {
            return this.createNotFoundRoute()
        }

        return {
            type: 'PageRoute',
            status: 'ready',
            pattern: this.mountedPattern.relativePattern,
            params: this.match.params,
            location: this.routeLocation,
            
            title: this.options.title,
            meta: this.options.meta,
            component: this.options.component,

            content: this.content,
            contentStatus: this.contentStatus,

            source: <any>this.constructor,
        }
    }
}


//
// Redirect
//

export interface Redirect extends BaseMountable, RedirectOptions {
    mountableType: 'Redirect'

    new(options: BaseMountOptions, redirectOptions: RedirectOptions): RedirectMount;

    // Explicitly specifying `never` allows us to use TypeScriptmapped types
    // on the ['component'] property of a `Mountable`.
    component: never
}

export interface RedirectOptions {
    to: Location
}

export class RedirectMount extends BaseMount {
    mountType: 'Redirect' = 'Redirect';
    options: RedirectOptions;

    constructor(options: BaseMountOptions, redirectOptions: RedirectOptions) {
        super(options)
        this.options = redirectOptions
    }

    getRoute(): RedirectRoute<any> {
        return {
            type: 'RedirectRoute',
            status: 'redirect',
            pattern: this.mountedPattern.relativePattern,
            params: {},
            location: this.routeLocation,

            to: this.options.to,

            component: <never>undefined,

            source: <any>this.constructor,
        }
    }
}