import { Route, createRoute } from './Route'
import { Matcher } from './Matcher'
import { Observable, Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { Resolver } from './Resolver'
import { Env } from './Env';
import { URLDescriptor } from './URLTools';

export class RouteObservable implements Observable<Route> {
    readonly url: URLDescriptor

    private cachedValue: Route
    private matcher: Matcher<any>['prototype']
    private observers: Observer<Route>[]
    private resolver: Resolver
  
    constructor(
        url: URLDescriptor,
        env: Env,
        matcher: Matcher<any>,
        resolver: Resolver
    ) {
        this.url = url
        this.resolver = resolver
        this.observers = []
        this.matcher = new matcher({
            appendFinalSlash: true,
            env,
            resolver: this.resolver
        })
    }

    subscribe(
        onNextOrObserver: Observer<Route> | ((value: Route) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        if (!this.resolver) {
            throw new Error("Can't subscribe to an already-complete RoutingObservable.")
        }
        let observer = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        this.observers.push(observer)
        let subscription = new SimpleSubscription(this.handleUnsubscribe, observer)
        if (this.observers.length === 1) {
            this.handleChange()
        }
        return subscription
    }

    private handleUnsubscribe = (observer: Observer<Route>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
    }

    private handleChange = () => {
        this.refresh()
        for (let i = 0; i < this.observers.length; i++) {
            let observer = this.observers[i]
            observer.next(this.cachedValue)
            if (this.cachedValue.type !== 'busy' && observer.complete) {
                observer.complete()
            }
        }
        if (this.cachedValue.type !== 'busy') {
            this.resolver.unlisten(this.handleChange)
            delete this.matcher
            delete this.resolver
        }
    }

    private refresh = () => {
        let { segments, resolutionIds } = this.matcher.getResult()
        this.cachedValue = createRoute(this.url, segments)
        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolutionIds)
    }
}
