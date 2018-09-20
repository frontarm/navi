import { Location } from './Location'
import { LocationState, createLocationState } from './LocationState'
import { Junction } from './Junction'
import { AbsoluteMapping } from './Mapping'
import { Observable, Observer, SimpleSubscription } from './Observable'
import { Resolver } from './Resolver'
import { RouterLocationOptions } from './Router'

export class LocationStateObservable implements Observable<LocationState> {
    readonly location: Location

    private cachedValue?: LocationState
    private matcher: Junction['prototype']
    private observers: Observer<LocationState>[]
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
        onNextOrObserver: Observer<LocationState> | ((value: LocationState) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        if (this.observers.length === 0) {
            this.refresh()
        }

        let observer: Observer<LocationState> = 
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

    getValue(): LocationState {
        // We don't need to worry about any subscriptions here
        if (this.cachedValue) {
            return this.cachedValue
        }
        else {
            return createLocationState(this.location, this.matcher.execute().route)
        }
    }

    private handleUnsubscribe = (observer: Observer<LocationState>) => {
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
        this.cachedValue = createLocationState(this.location, route!)
        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolvables!)
        return this.cachedValue!
    }
}
