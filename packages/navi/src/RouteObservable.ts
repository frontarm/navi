import { Route, createRoute } from './Route'
import { Switch } from './Switch'
import { Observable, Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { Resolver } from './Resolver'
import { Env } from './Env';
import { URLDescriptor } from './URLTools';
import { SwitchSegment } from './Segments';

export class RouteObservable implements Observable<Route> {
    readonly url: URLDescriptor

    private cachedValue: Route
    private matcher: Switch['prototype']
    private observers: Observer<Route>[]
    private resolver: Resolver
  
    constructor(
        url: URLDescriptor,
        env: Env,
        pages: Switch,
        resolver: Resolver,
        withContent: boolean
    ) {
        this.url = url
        this.resolver = resolver
        this.observers = []
        this.matcher = new pages({
            appendFinalSlash: true,
            env,
            resolver: this.resolver,
            withContent: withContent
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
            if (this.cachedValue.isSteady && observer.complete) {
                observer.complete()
            }
        }
        if (this.cachedValue.isSteady) {
            this.resolver.unlisten(this.handleChange)
            delete this.matcher
            delete this.resolver
        }
    }

    private refresh = () => {
        let { segment, resolutionIds } = this.matcher.getResult()
        this.cachedValue = createRoute(this.url, segment as SwitchSegment)
        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolutionIds)
    }
}
