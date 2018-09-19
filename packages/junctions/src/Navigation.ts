import { Location, createHref } from './Location'
import { History } from 'history'
import { Junction } from './Junction'
import { JunctionRoute, isRouteSteady } from './Route'
import { Router } from './Router'
import { ObservableRoute } from './ObservableRoute';
import { Deferred } from './Deferred';
import { Subscription } from './Observable';

type Listener = (state: NavigationOutput) => void
type Unsubscriber = () => void

interface NavigationOutput<RootJunction extends Junction=any> {
    location: Location,
    url: string, 
    route?: JunctionRoute<RootJunction>,
    isSteady: boolean
}

// TODO: turn this into an Observable
export class Navigation<RootJunction extends Junction=any> {
    readonly history: History
    readonly router: Router<RootJunction>

    private waitUntilSteadyDeferred?: Deferred<void>
    private listeners: Listener[]
    private lastLocation?: Location
    private lastRoute?: JunctionRoute<RootJunction>
    private observableRoute?: ObservableRoute<RootJunction>
    private observableRouteSubscription?: Subscription

    constructor(options: { history: History, router: Router<RootJunction> }) {
        this.listeners = []
        this.router = options.router
        this.history = options.history
        this.history.listen(this.handleLocationChange)
        this.handleLocationChange(this.history.location)
    }

    /**
     * Get the root route
     */
    get currentRoute(): JunctionRoute<RootJunction> | undefined {
        return this.observableRoute && this.observableRoute.getValue()
    }

    get isSteady(): boolean {
        return !this.currentRoute || isRouteSteady(this.currentRoute)
    }

    /**
     * Returns a promise that resolves once `isReady()` returns true.
     * This is useful for implementing static rendering, or for waiting until
     * content is loaded before making the first render.
     */
    async steady(): Promise<void> {
        if (this.isSteady) {
            return Promise.resolve()
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
    
    handleLocationChange = (location: Location) => {
        let locationExistenceHasChanged = location && !this.lastLocation
        
        let pathHasChanged, searchHasChanged
        if (location && this.lastLocation) {
            pathHasChanged = location.pathname !== this.lastLocation.pathname
            searchHasChanged = location.search !== this.lastLocation.search
        }

        // The router only looks at path and search, so if they haven't
        // changed, there's no point recreating the observable.
        if (!(pathHasChanged || searchHasChanged || locationExistenceHasChanged)) {
            this.update({
                location,
            })
            return
        }

        this.lastLocation = location

        if (this.observableRouteSubscription) {
            this.observableRouteSubscription.unsubscribe()
        }

        this.observableRoute = this.router.observeRoute(location, { withContent: true })
        if (!this.observableRoute) {
            delete this.observableRouteSubscription
            this.update({
                location,
                route: undefined,
            })
            return
        }
        this.observableRouteSubscription = this.observableRoute.subscribe(this.handleRouteChange)
        this.update({
            location,
            route: this.observableRoute.getValue(),
        })
    }

    private handleRouteChange = (route: JunctionRoute<RootJunction>) => {
        this.update({
            route,
        })
    }

    // Allows for either the location or route or both to be changed at once.
    private update = (updates: { location?: Location, route?: JunctionRoute<RootJunction> }) => {
        let location = (updates.location || this.lastLocation)!
        let route = (updates.route || this.lastRoute)!
        let output: NavigationOutput = {
            location,
            route,
            isSteady: isRouteSteady(route),
            url: createHref(location),
        }

        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i](output)
        }

        if (this.waitUntilSteadyDeferred && ('route' in updates) && (!updates.route || isRouteSteady(updates.route))) {
            this.waitUntilSteadyDeferred.resolve(undefined)
            delete this.waitUntilSteadyDeferred
        }
    }
}