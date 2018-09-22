import { Location } from './Location'
import { RoutingState, createRoutingState } from './RoutingState'
import { Junction } from './Junction'
import { AbsoluteMapping } from './Mapping'
import { Observable, Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { Resolver } from './Resolver'
import { RouterLocationOptions } from './Router'

export class RoutingObservable implements Observable<RoutingState> {
    readonly location: Location

    private cachedValue?: RoutingState
    private matcher: Junction['prototype']
    private observers: Observer<RoutingState>[]
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
        onNextOrObserver: Observer<RoutingState> | ((value: RoutingState) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        if (this.observers.length === 0) {
            this.refresh()
        }
        let observer = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        this.observers.push(observer)
        return new SimpleSubscription(this.handleUnsubscribe, observer)
    }

    getState(): RoutingState {
        // We don't need to worry about any subscriptions here
        if (this.cachedValue) {
            return this.cachedValue
        }
        else {
            return createRoutingState(this.location, this.matcher.execute().route!)
        }
    }

    private handleUnsubscribe = (observer: Observer<RoutingState>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
        if (this.observers.length === 0) {
            delete this.cachedValue
            this.resolver.unlisten(this.handleChange)
        }
    }

    private handleChange = () => {
        let value = this.refresh()
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].next(value)
        }
    }

    private refresh = () => {
        let { route, resolvables } = this.matcher.execute()
        this.cachedValue = createRoutingState(this.location, route!)
        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolvables!)
        return this.cachedValue!
    }
}
