import { History } from 'history'
import { OutOfRootError } from './Errors'
import { URLDescriptor, areURLDescriptorsEqual, createURLDescriptor } from './URLTools'
import { Reducer } from './Reducer'
import { Router, RouterResolveOptions } from './Router'
import { Deferred } from './Deferred';
import { Observer, Observable, Subscription, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { Chunk } from './Chunks'

/**
 * An observable that tracks the current location of a History object,
 * passing it through a router each time it changes, and emitting the
 * lastest route from the latest router.
 */
export class CurrentRouteObservable<Context extends object, R> implements Observable<R> {
    private history: History
    private router: Router<Context, R>
    private reducer: Reducer<Chunk, R>

    // Stores the last receive location, even if we haven't processed it.
    // Used to detect and defuse loops where a change to history results
    // in a new change to history before the previous one completes.
    private lastReceivedURL?: URLDescriptor

    private waitUntilSteadyDeferred?: Deferred<R>
    private observers: Observer<R>[]
    private lastURL: URLDescriptor
    private lastRoute?: R
    private isLastRouteSteady: boolean
    private resolveOptions?: RouterResolveOptions
    private observableSubscription?: Subscription
    private unlisten: () => void

    constructor(
        history: History,
        router: Router<Context, R>,
        reducer: Reducer,
        resolveOptions?: RouterResolveOptions,
    ) {
        this.observers = []
        this.isLastRouteSteady = false
        this.router = router
        this.history = history
        this.reducer = reducer
        this.resolveOptions = resolveOptions
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

    setContext(context: Context) {
        this.router.setContext(context)
        this.refresh()
    }

    /**
     * Get the latest route
     */
    getValue(): R {
        return this.lastRoute!
    }

    /**
     * Returns a promise that resolves once the route is steady.
     * This is useful for implementing static rendering, or for waiting until
     * view is loaded before making the first render.
     */
    async getSteadyRoute(): Promise<R> {
        if (this.isLastRouteSteady) {
            return Promise.resolve(this.lastRoute!)
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
        onNextOrObserver: Observer<R> | ((value: R) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let observer = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        this.observers.push(observer)
        return new SimpleSubscription(this.handleUnsubscribe, observer)
    }

    private handleUnsubscribe = (observer: Observer<R>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
    }
    
    private handleURLChange(url: URLDescriptor, force?: boolean) {
        // Bail without change is the URL hasn't changed
        if (!force && this.lastReceivedURL && areURLDescriptorsEqual(this.lastReceivedURL, url)) {
            for (let i = 0; i < this.observers.length; i++) {
                this.observers[i].next(this.lastRoute!)
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
        if (!force && !(pathHasChanged || searchHasChanged) && this.lastRoute) {
            if (url.hash !== lastURL.hash) {
                this.setRoute(
                    this.reducer(this.lastRoute, {
                        type: 'url',
                        url: url,
                    }),
                    this.isLastRouteSteady
                )
            }
            return
        }

        if (this.observableSubscription) {
            this.observableSubscription.unsubscribe()
        }

        let observable = this.router.createObservable(url, this.resolveOptions)
        if (observable) {
            this.observableSubscription = observable.subscribe(this.handleChunkList)
        }
        else if (!lastURL) {
            throw new OutOfRootError(url)
        }
    }

    // Allows for either the location or route or both to be changed at once.
    private handleChunkList = (chunks: Chunk[]) => {
        let isSteady = true
        for (let i = 0; i < chunks.length; i++) {
            let chunk = chunks[i]
            if (chunk.type === 'busy') {
                isSteady = false
            }
            if (chunk.type === 'redirect') {
                this.history.replace(chunk.to)
                return
            }
        }
        
        this.setRoute(
            [{ type: 'url', url: this.lastURL }]
                .concat(chunks)
                .reduce(this.reducer, undefined as any) as R,
            isSteady
        )
    }

    private setRoute(route: R, isSteady: boolean) {
        if (route !== this.lastRoute) {
            this.lastRoute = route
            this.isLastRouteSteady = isSteady
            if (isSteady && this.waitUntilSteadyDeferred) {
                this.waitUntilSteadyDeferred.resolve(route)
                delete this.waitUntilSteadyDeferred
            }
            for (let i = 0; i < this.observers.length; i++) {
                this.observers[i].next(route)
            }
        }
    }
}