import { RoutingState, createRoute } from './RoutingState'
import { Junction } from './Junction'
import { Observable, Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { Resolver } from './Resolver'
import { Router, RouterLocationOptions } from './Router'
import { NodeMatcherOptions } from './Node';
import { RouterEnv } from './RouterEnv';
import { URLDescriptor } from './URLTools';
import { JunctionRoute } from '.';

export class RoutingObservable implements Observable<RoutingState> {
    readonly url: URLDescriptor

    private cachedValue: RoutingState
    private matcher: Junction['prototype']
    private observers: Observer<RoutingState>[]
    private resolver: Resolver
  
    constructor(
        url: URLDescriptor,
        env: RouterEnv,
        rootJunction: Junction,
        resolver: Resolver,
        withContent: boolean
    ) {
        this.url = url
        this.resolver = resolver
        this.observers = []
        this.matcher = new rootJunction({
            appendFinalSlash: true,
            env,
            resolver: this.resolver,
            withContent: withContent
        })
    }

    subscribe(
        onNextOrObserver: Observer<RoutingState> | ((value: RoutingState) => void),
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

    private handleUnsubscribe = (observer: Observer<RoutingState>) => {
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
        let { route, resolutionIds } = this.matcher.getResult()
        this.cachedValue = createRoute(this.url, route as JunctionRoute)
        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolutionIds)
    }
}
