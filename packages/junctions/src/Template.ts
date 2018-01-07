import { Location, concatLocations } from './Location'
import { CompiledPattern, MountedPattern, PatternMatch, createChildMountedPattern, matchMountedPatternAgainstLocation, addParamsToMountedPattern } from './Patterns'
import { Route } from './Route'
import { RouterConfig } from './RouterConfig'
import { AsyncObjectContainer } from './AsyncObjectContainer'
import { JunctionTemplate } from './JunctionTemplate'
import { PageTemplate } from './PageTemplate'
import { RedirectTemplate } from './RedirectTemplate'


export interface TemplateBase<R extends Matcher = Matcher> {
    type: 'Template';

    // The params to extract from the matchable location part.
    params: string[],

    new(options: MatcherOptions): R;
    prototype: R;
}

export type Template = JunctionTemplate | PageTemplate | RedirectTemplate

export type AsyncTemplate<T extends Template = Template> = AsyncObjectContainer<T>


export interface MatcherOptions {
    // The part of the location that was consumed by the parent.
    parentLocationPart: Location,

    // The part of the location that hasn't been consumed by the parent,
    // and that can be matched by this Matcher object.
    matchableLocationPart: Location,

    // The route object, containing details about the absolute locations
    // where this routeable is mounted.
    mountedPattern: MountedPattern,

    // Indicate to the parent that it needs to refresh the route object.
    onChange: () => void,

    // Functions that may be used within configuration getters.
    routerConfig: RouterConfig,

    // Whether we should fetch content if we encounter it.
    shouldFetchContent: boolean;
}

export abstract class Matcher {
    mountedPattern: MountedPattern;

    // Information that will be used when creating a Route object.
    match?: PatternMatch;
    segmentLocation: Location;
    matchableLocationPart: Location;

    shouldFetchContent: boolean

    waitingForWatch: boolean
    unmounted: boolean
    private onChange: () => void;

    routerConfig: RouterConfig;

    ['constructor']: Template
    constructor(options: MatcherOptions) {
        let { 
            parentLocationPart,
            matchableLocationPart,
            mountedPattern: patternWithoutSearchParams,
        } = options

        // Get the full route object for this junction, including information
        // on any params that it consumes.
        this.mountedPattern = addParamsToMountedPattern(patternWithoutSearchParams, this.constructor.params)

        this.waitingForWatch = false
        this.unmounted = false
        this.onChange = options.onChange
        this.routerConfig = options.routerConfig
        this.shouldFetchContent = options.shouldFetchContent

        // Note that we'll have already matched the *path* part of the location
        // in the parent function. However, we may not have matched params that
        // are specified by the junction, so we need to perform another match.
        // However, this time we're guaranteed that the match will work.
        this.match = matchMountedPatternAgainstLocation(this.mountedPattern, matchableLocationPart)
        this.segmentLocation = concatLocations(parentLocationPart, this.match ? this.match.matchedLocation : matchableLocationPart)
        this.matchableLocationPart = matchableLocationPart
    }

    willUnmount() {
        this.unmounted = true
    }

    isBusy(): boolean {
        return !!this.waitingForWatch
    }

    // Get the route object given the current state.
    abstract getRoute(): Route | undefined;

    protected createSegment<Type extends string, Details>(type: Type, details: Details) {
        return Object.assign({
            type: type,
            params: (this.match && this.match.params) || {},
            location: this.segmentLocation,
            url: this.segmentLocation.pathname + (this.segmentLocation.search || ''),
            template: this.constructor,
            component: <never>undefined,
            meta: <any>undefined,
        }, details)
    }

    protected handleChange = () => {
        if (!this.unmounted) {
            this.onChange()
        }
    }

    protected watchAsync<AO extends AsyncObjectContainer<any>>(async: AO, event: object, callback: (status: 'ready' | 'busy' | 'error', value?: AO['value'], error?: any) => void): void {
        if (!async.status || async.status !== 'ready') {
            let result = async.getter(this.routerConfig)

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
            this.routerConfig.onEvent({
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
                        async.error = error
                        console.error(error)
                        callback('error', undefined, error)
                    }
                )
                .then(() => {
                    this.waitingForWatch = false
                    this.routerConfig.onEvent({
                        ...event,
                        type: event['type'] + 'End',
                    } as any)
                    this.handleChange()
                })
        }
    }
}
