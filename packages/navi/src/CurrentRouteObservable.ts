import { History } from 'history'
import { OutOfRootError } from './Errors'
import { URLDescriptor, areURLDescriptorsEqual, createURLDescriptor } from './URLTools'
import { Router } from './Router'
import { Route } from './Route'
import { Deferred } from './Deferred';
import { Observer, Observable, Subscription, SimpleSubscription, createOrPassthroughObserver } from './Observable';

export interface CurrentRouteObservableOptions<Context extends object> {
    history: History,
    router: Router<Context>
}

export function createCurrentRouteObservable<Context extends object>(options: CurrentRouteObservableOptions<Context>) {
    return new CurrentRouteObservable<Context>(
        options.history,
        options.router,
    )
}

/**
 * An observable that tracks the current location of a History object,
 * passing it through a router each time it changes, and emitting the
 * lastest route from the latest router.
 */
export class CurrentRouteObservable<Context extends object> implements Observable<Route> {
    private history: History
    private router: Router<Context>

    // Stores the last receive location, even if we haven't processed it.
    // Used to detect and defuse loops where a change to history results
    // in a new change to history before the previous one completes.
    private lastReceivedURL?: URLDescriptor

    private error?: any

    private waitUntilSteadyDeferred?: Deferred<Route>
    private observers: Observer<Route>[]
    private lastURL: URLDescriptor
    private lastRoute: Route
    private observableSubscription?: Subscription
    private unlisten: () => void

    constructor(history: History, router: Router<Context>) {
        this.observers = []
        this.router = router
        this.history = history
        this.lastURL = createURLDescriptor(this.history.location)
        this.unlisten = this.history.listen(location => this.handleURLChange(createURLDescriptor(location)))
        this.refresh()
    }

    dispose() {
        this.observers.length = 0

        this.unlisten()
        delete this.unlisten
        delete this.history

        if (this.observableSubscription) {
            this.observableSubscription.unsubscribe()
        }
        delete this.observableSubscription

        delete this.router
        delete this.waitUntilSteadyDeferred
        delete this.lastRoute
    }

    refresh() {
        this.handleURLChange(createURLDescriptor(this.history.location), true)
    }

    setRouter(router: Router<Context>) {
        this.router = router
        this.refresh()
    }

    /**
     * Get the latest route
     */
    getValue(): Route {
        return this.lastRoute
    }

    /**
     * Returns a promise that resolves once the route is steady.
     * This is useful for implementing static rendering, or for waiting until
     * content is loaded before making the first render.
     */
    async getSteadyRoute(): Promise<Route> {
        if (this.error) {
            return Promise.reject(this.error)
        }
        else if (this.lastRoute && this.lastRoute.isSteady) {
            return Promise.resolve(this.lastRoute)
        }
        else if (!this.waitUntilSteadyDeferred) {
            this.waitUntilSteadyDeferred = new Deferred()
        }
        return this.waitUntilSteadyDeferred.promise
    }

    /**
     * If you're using code splitting, you'll need to subscribe to changes to
     * Route, as the route may change as new code chunks are received.
     */
    subscribe(
        onNextOrObserver: Observer<Route> | ((value: Route) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let observer = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        this.observers.push(observer)
        return new SimpleSubscription(this.handleUnsubscribe, observer)
    }

    private handleUnsubscribe = (observer: Observer<Route>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
    }
    
    private handleURLChange(url: URLDescriptor, force?: boolean) {
        // Bail without change is the URL hasn't changed
        if (!force && this.lastReceivedURL && areURLDescriptorsEqual(this.lastReceivedURL, url)) {
            for (let i = 0; i < this.observers.length; i++) {
                this.observers[i].next(this.lastRoute)
            }
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
        if (!force && !(pathHasChanged || searchHasChanged) && !this.lastRoute.error) {
            this.update()
            return
        }

        if (this.observableSubscription) {
            this.observableSubscription.unsubscribe()
        }

        let observable = this.router.createObservable(url)
        if (observable) {
            this.observableSubscription = observable.subscribe(this.update)
        }
        else if (!lastURL) {
            throw new OutOfRootError(url)
        }
    }

    // Allows for either the location or route or both to be changed at once.
    private update = (route?: Route) => {
        let url = this.lastURL
        let nextRoute = route || this.lastRoute
        let lastSegment = route && route.lastSegment

        if (lastSegment && lastSegment.type === 'redirect' && lastSegment.to) {
            // No need to notify any listeners of a ready redirect,
            // as we can take the appropriate action ourselves
            this.history.replace(lastSegment.to)
            return
        }

        this.lastRoute = {
            ...nextRoute!,
            url,
        }
        if (this.waitUntilSteadyDeferred && this.lastRoute.isSteady) {
            this.waitUntilSteadyDeferred.resolve(this.lastRoute)
            delete this.waitUntilSteadyDeferred
        }
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].next(this.lastRoute)
        }
    }
}