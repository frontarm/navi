import { History } from 'history'
import { OutOfRootError } from './Errors'
import { URLDescriptor, areURLDescriptorsEqual, createURLDescriptor } from './URLTools'
import { RouteType } from './Route'
import { Router } from './Router'
import { RoutingState } from './RoutingState'
import { Deferred } from './Deferred';
import { Observer, Observable, Subscription, SimpleSubscription, createOrPassthroughObserver } from './Observable';

export interface NavigationOptions<Context> {
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
    private history: History
    private router: Router<Context>

    // Stores the last receive location, even if we haven't processed it.
    // Used to detect and defuse loops where a change to history results
    // in a new change to history before the previous one completes.
    private lastReceivedURL?: URLDescriptor

    private error?: any

    private waitUntilSteadyDeferred?: Deferred<RoutingState>
    private observers: Observer<RoutingState>[]
    private lastURL: URLDescriptor
    private lastState: RoutingState
    private observableSubscription?: Subscription

    constructor(history: History, router: Router<Context>) {
        this.observers = []
        this.router = router
        this.history = history
        this.lastURL = createURLDescriptor(this.history.location)
        this.history.listen(location => this.handleURLChange(createURLDescriptor(location)))
        this.refresh()
    }

    refresh() {
        this.handleURLChange(createURLDescriptor(this.history.location), true)
    }

    setRouter(router: Router<Context>) {
        this.router = router
        this.refresh()
    }

    /**
     * Get the root route
     */
    getValue(): RoutingState {
        return this.lastState
    }

    /**
     * Returns a promise that resolves once the state is steady.
     * This is useful for implementing static rendering, or for waiting until
     * content is loaded before making the first render.
     */
    async getSteadyState(): Promise<RoutingState> {
        if (this.error) {
            return Promise.reject(this.error)
        }
        else if (this.lastState && this.lastState.isSteady) {
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
    
    private handleURLChange(url: URLDescriptor, force?: boolean) {
        // Defuse history update loops
        if (!force && this.lastReceivedURL && areURLDescriptorsEqual(this.lastReceivedURL, url)) {
            return
        }
        this.lastReceivedURL = url

        // Ensure the pathname always has a trailing `/`, so that we don't
        // have multiple URLs referring to the same page.
        if (url.pathname.substr(-1) !== '/') {
            url = {
                ...url,
                pathname: url.pathname + '/',
            }
            this.history.replace(url)
            return
        }

        let lastURL = this.lastURL
        this.lastURL = url
        let pathHasChanged, searchHasChanged
        if (url && lastURL) {
            pathHasChanged = url.pathname !== lastURL.pathname
            searchHasChanged = url.search !== lastURL.search
        }

        // The router only looks at path and search, so if they haven't
        // changed, there's no point recreating the observable.
        if (!force && !(pathHasChanged || searchHasChanged) && !this.lastState.error) {
            this.update()
            return
        }

        if (this.observableSubscription) {
            this.observableSubscription.unsubscribe()
        }

        let observable = this.router.observable(url, { withContent: true })
        if (observable) {
            this.observableSubscription = observable.subscribe(this.update)
        }
        else if (!lastURL) {
            throw new OutOfRootError(url)
        }
    }

    // Allows for either the location or route or both to be changed at once.
    private update = (state?: RoutingState) => {
        let url = this.lastURL
        let nextState = state || this.lastState
        let lastRoute = state && state.lastRoute

        if (lastRoute && lastRoute.type === RouteType.Redirect && lastRoute.to) {
            // No need to notify any listeners of a ready redirect,
            // as we can take the appropriate action ourselves
            this.history.replace(lastRoute.to)
            return
        }

        this.lastState = {
            ...nextState!,
            url,
        }
        if (this.waitUntilSteadyDeferred && this.lastState.isSteady) {
            this.waitUntilSteadyDeferred.resolve(this.lastState)
            delete this.waitUntilSteadyDeferred
        }
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].next(this.lastState)
        }
    }
}