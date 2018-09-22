import { History } from 'history'
import { Location, createURL } from './Location'
import { RouteType } from './Route'
import { Router } from './Router'
import { RoutingState } from './RoutingState'
import { RoutingObservable } from './RoutingObservable';
import { Deferred } from './Deferred';
import { Observer, Observable, Subscription, SimpleSubscription, createOrPassthroughObserver } from './Observable';

interface NavigationOptions<Context> {
    history: History,
    router: Router<Context>
}

export function createHistoryRoutingObservable<Context>(options: NavigationOptions<Context>) {
    return new HistoryRoutingObservable<Context>(
        options.history,
        options.router,
    )
}

export class HistoryRoutingObservable<Context> implements Observable<RoutingState> {
    readonly history: History
    readonly router: Router<Context>

    private waitUntilSteadyDeferred?: Deferred<RoutingState>
    private observers: Observer<RoutingState>[]
    private lastLocation: Location
    private lastState: RoutingState
    private routingObservable?: RoutingObservable
    private observableSubscription?: Subscription

    constructor(history: History, router: Router<Context>) {
        this.observers = []
        this.router = router
        this.history = history
        this.lastLocation = this.history.location
        this.history.listen(location => this.handleLocationChange(location))
        this.handleLocationChange(this.history.location, true)
    }

    /**
     * Get the root route
     */
    getState(): RoutingState {
        return this.lastState
    }

    /**
     * Returns a promise that resolves once the state is steady.
     * This is useful for implementing static rendering, or for waiting until
     * content is loaded before making the first render.
     */
    async getSteadyState(): Promise<RoutingState> {
        if (this.lastState.isSteady) {
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
    subscribe(
        onNextOrObserver: Observer<RoutingState> | ((value: RoutingState) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let observer = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        this.observers.push(observer)
        return new SimpleSubscription(this.handleUnsubscribe, observer)
    }

    private handleUnsubscribe = (observer: Observer<RoutingState>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
    }
    
    private handleLocationChange(location: Location, force?: boolean) {
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

        try {
            this.routingObservable = this.router.observable(location, { withContent: true })
            this.observableSubscription = this.routingObservable.subscribe(this.handleRouteChange)
            this.update({
                location,
                state: this.routingObservable.getState(),
            })
        }
        catch (e) {
            if (this.waitUntilSteadyDeferred) {
                this.waitUntilSteadyDeferred.reject(e)
                delete this.waitUntilSteadyDeferred
            }
            for (let i = 0; i < this.observers.length; i++) {
                let observer = this.observers[i]
                if (observer.error) {
                    observer.error(e)
                }
            }
        }
    }

    private handleRouteChange = (state: RoutingState) => {
        this.update({
            state,
        })
    }

    // Allows for either the location or route or both to be changed at once.
    private update = (updates: { location?: Location, state?: RoutingState }) => {
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

        this.lastState = {
            ...state!,
            location,
            url: createURL(location),
        }
        if (this.waitUntilSteadyDeferred && state!.isSteady) {
            this.waitUntilSteadyDeferred.resolve(this.lastState)
            delete this.waitUntilSteadyDeferred
        }
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].next(this.lastState)
        }
    }
}