import { Location } from './Location'
import { Junction } from './Junction'
import { AbsoluteMapping } from './Mapping'
import { Observable, Observer, SimpleSubscription } from './Observable'
import { Resolver } from './Resolver'
import { JunctionRoute } from './Route'
import { RouterLocationOptions } from './Router'

export class LocationStateObservable implements Observable<JunctionRoute> {
    readonly location: Location

    private cachedRoute?: JunctionRoute
    private matcher: Junction['prototype']
    private observers: Observer<JunctionRoute>[]
    private resolver: Resolver<any>
  
    constructor(
        location: Location,
        rootJunction: Junction,
        rootMapping: AbsoluteMapping,
        resolver: Resolver,
        options: RouterLocationOptions
    ) {
        this.location = location
        this.resolver = resolver
        this.observers = []
        this.matcher = new rootJunction({
            matchableLocation: location,
            mapping: rootMapping,
            resolver: resolver,
            withContent: !!options.withContent,
        })
    }

    subscribe(
        onNextOrObserver: Observer<JunctionRoute> | ((value: JunctionRoute) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        if (this.observers.length === 0) {
            this.refresh()
        }

        let observer: Observer<JunctionRoute> = 
            typeof onNextOrObserver === 'function'
                ? {
                    next: onNextOrObserver,
                    error: onError,
                    complete: onComplete,
                }
                : onNextOrObserver

        this.observers.push(observer)

        return new SimpleSubscription(this.handleUnsubscribe, observer)
    }

    getValue(): JunctionRoute {
        // We don't need to worry about any subscriptions here
        if (this.cachedRoute) {
            return this.cachedRoute
        }
        else {
            return this.matcher.execute().route!
        }
    }

    private handleUnsubscribe = (observer: Observer<JunctionRoute>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
        if (this.observers.length === 0) {
            delete this.cachedRoute
            this.resolver.unlisten(this.handleChange)
        }
    }

    private handleChange = () => {
        let route = this.refresh()
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].next(route!)
        }
    }

    private refresh = () => {
        let { route, resolvables } = this.matcher.execute()
        this.cachedRoute = route
        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolvables!)
        return route
    }
}
