import { Location } from './Location'
import { Junction } from './Junction'
import { AbsoluteMapping } from './Mapping'
import { Observable, Observer, SimpleSubscription } from './Observable'
import { Resolver } from './Resolver'
import { JunctionRoute } from './Route'

export interface ObservableRouteOptions {
  withContent?: boolean
}

export class ObservableRoute<RootJunction extends Junction=any> implements Observable<JunctionRoute<RootJunction>> {
    readonly location: Location

    private cachedRoute?: JunctionRoute<RootJunction>
    private matcher: RootJunction['prototype']
    private observers: Observer<JunctionRoute<RootJunction>>[]
    private resolver: Resolver<any>
  
    constructor(
        location: Location,
        rootJunction: RootJunction,
        rootMapping: AbsoluteMapping,
        resolver: Resolver,
        options: ObservableRouteOptions
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
        onNextOrObserver: Observer<JunctionRoute<RootJunction>> | ((value: JunctionRoute<RootJunction>) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let { route, resolvables } = this.matcher.execute()

        this.cachedRoute = route

        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolvables!)

        let observer: Observer<JunctionRoute<RootJunction>> = 
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

    getValue(): JunctionRoute<RootJunction> {
        // We don't need to worry about any subscriptions here
        if (this.cachedRoute) {
            return this.cachedRoute
        }
        else {
            return this.matcher.execute().route!
        }
    }

    private handleUnsubscribe = (observer: Observer<JunctionRoute<RootJunction>>) => {
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
        let { route, resolvables } = this.matcher.execute()

        this.cachedRoute = route

        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolvables!)

        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].next(route!)
        }
    }
}
