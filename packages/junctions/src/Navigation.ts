import { History } from 'history'
import { Location, createURL } from './Location'
import { RouteType } from './Route'
import { Router } from './Router'
import { LocationState } from './LocationState'
import { LocationStateObservable } from './LocationStateObservable';
import { Deferred } from './Deferred';
import { Subscription } from './Observable';
import { UnmanagedLocationError } from './Errors';

type Listener = (nextState?: LocationState, prevState?: LocationState) => void
type Unsubscriber = () => void

interface NavigationOptions<Context> {
    history: History,
    router: Router<Context>
}

export function createNavigation<Context>(options: NavigationOptions<Context>) {
    return new Navigation<Context>(
        options.history,
        options.router,
    )
}

// TODO: turn this into a proper Observable
export class Navigation<Context> {
    readonly history: History
    readonly router: Router<Context>

    private waitUntilSteadyDeferred?: Deferred<LocationState>
    private listeners: Listener[]
    private lastLocation: Location
    private lastState?: LocationState
    private locationStateObservable?: LocationStateObservable
    private observableSubscription?: Subscription

    constructor(history: History, router: Router<Context>) {
        this.listeners = []
        this.router = router
        this.history = history
        this.lastLocation = this.history.location
        this.history.listen(location => this.handleLocationChange(location))
        this.handleLocationChange(this.history.location, true)
    }

    /**
     * Get the root route
     */
    get currentState(): LocationState | undefined {
        return this.lastState
    }

    get isSteady(): boolean {
        return !this.lastState || this.lastState.isSteady
    }

    /**
     * Returns a promise that resolves once `isReady()` returns true.
     * This is useful for implementing static rendering, or for waiting until
     * content is loaded before making the first render.
     */
    async steadyState(): Promise<LocationState> {
        if (!this.lastState) {
            console.log('goodbye')
            return Promise.reject(new UnmanagedLocationError(this.lastLocation))
        }
        else if (this.isSteady) {
            return Promise.resolve(this.lastState)
        }
        else if (!this.waitUntilSteadyDeferred) {
            this.waitUntilSteadyDeferred = new Deferred()
        }
        return this.waitUntilSteadyDeferred.promise
    }
    
    /**
     * If you're using code splitting, you'll need to subscribe to changes to
     * Navigation state, as the state may change as new code chunks are
     * received.
     */
    subscribe(onStateChange: Listener): Unsubscriber {
        this.listeners.push(onStateChange)

        return () => {
            let index = this.listeners.indexOf(onStateChange)
            if (index !== -1) {
                this.listeners.splice(index, 1)
            }
        }
    }
    
    handleLocationChange(location: Location, force?: boolean) {
        let pathHasChanged, searchHasChanged
        if (location && this.lastLocation) {
            pathHasChanged = location.pathname !== this.lastLocation.pathname
            searchHasChanged = location.search !== this.lastLocation.search
        }

        // The router only looks at path and search, so if they haven't
        // changed, there's no point recreating the observable.
        if (!(pathHasChanged || searchHasChanged || force)) {
            this.update({
                location,
            })
            return
        }

        this.lastLocation = location

        if (this.observableSubscription) {
            this.observableSubscription.unsubscribe()
        }

        this.locationStateObservable = this.router.locationStateObservable(location, { withContent: true })
        if (!this.locationStateObservable) {
            delete this.observableSubscription
            this.update({
                location,
                state: undefined,
            })
            return
        }
        this.observableSubscription = this.locationStateObservable.subscribe(this.handleRouteChange)
        this.update({
            location,
            state: this.locationStateObservable.getValue(),
        })
    }

    private handleRouteChange = (state: LocationState) => {
        this.update({
            state,
        })
    }

    // Allows for either the location or route or both to be changed at once.
    private update = (updates: { location?: Location, state?: LocationState }) => {
        let lastState = this.lastState
        let location = updates.location || this.lastLocation
        let state = updates.state || this.lastState
        let lastRoute = state && state.lastRoute

        if (lastRoute && lastRoute.type === RouteType.Redirect && lastRoute.to) {
            // No need to notify any listeners of a ready redirect,
            // as we can take the appropriate action ourselves
            this.history.replace(lastRoute.to)
            return
        }

        if (('state' in updates) && updates.state === undefined) {
            this.lastState = undefined
            if (this.waitUntilSteadyDeferred) {
                this.waitUntilSteadyDeferred.reject(new UnmanagedLocationError(location))
                delete this.waitUntilSteadyDeferred
            }
        }
        else if (this.lastState || updates.state) {
            this.lastState = {
                ...state!,
                location,
                url: createURL(location),
            }
            if (this.waitUntilSteadyDeferred && state!.isSteady) {
                this.waitUntilSteadyDeferred.resolve(this.lastState)
                delete this.waitUntilSteadyDeferred
            }
        }

        if (this.lastState !== lastState) {
            for (let i = 0; i < this.listeners.length; i++) {
                this.listeners[i](this.lastState, lastState)
            }
        }
    }
}