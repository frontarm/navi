import { History } from 'history'
import { Location, createURL } from './Location'
import { RouteType } from './Route'
import { Router } from './Router'
import { LocationState, createLocationState } from './LocationState'
import { LocationStateObservable } from './LocationStateObservable';
import { Deferred } from './Deferred';
import { Subscription } from './Observable';

type Listener = (state: LocationState) => void
type Unsubscriber = () => void

// TODO: turn this into a proper Observable
export class Navigation<Context> {
    readonly history: History
    readonly router: Router<Context>

    private waitUntilSteadyDeferred?: Deferred<LocationState>
    private listeners: Listener[]
    private lastLocation: Location
    private lastState: LocationState
    private locationStateObservable?: LocationStateObservable
    private observableSubscription?: Subscription

    constructor(options: { history: History, router: Router<Context> }) {
        this.listeners = []
        this.router = options.router
        this.history = options.history
        this.lastLocation = this.history.location
        this.lastState = createLocationState(this.history.location)
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
        return this.lastState.isSteady
    }

    /**
     * Returns a promise that resolves once `isReady()` returns true.
     * This is useful for implementing static rendering, or for waiting until
     * content is loaded before making the first render.
     */
    async steadyState(): Promise<LocationState> {
        if (this.isSteady) {
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
    subscribe(onRouteChange: Listener): Unsubscriber {
        this.listeners.push(onRouteChange)

        return () => {
            let index = this.listeners.indexOf(onRouteChange)
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

        this.locationStateObservable = this.router.observeRoute(location, { withContent: true })
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
        let location = updates.location || this.lastLocation
        let state = updates.state || this.lastState
        let lastRoute = state && state.lastRoute

        if (lastRoute && lastRoute.type === RouteType.Redirect && lastRoute.to) {
            // No need to notify any listeners of a ready redirect,
            // as we can take the appropriate action ourselves
            this.history.replace(lastRoute.to)
            return
        }

        this.lastState = {
            ...state,
            location,
            url: createURL(location),
        }

        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i](this.lastState)
        }

        if (this.waitUntilSteadyDeferred && ('state' in updates) && this.lastState.isSteady) {
            this.waitUntilSteadyDeferred.resolve(this.lastState)
            delete this.waitUntilSteadyDeferred
        }
    }
}