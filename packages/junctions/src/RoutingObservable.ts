import { Location } from './Location'
import { RoutingState, createRoutingState } from './RoutingState'
import { Junction } from './Junction'
import { AbsoluteMapping } from './Mapping'
import { Observable, Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { Resolver } from './Resolver'
import { Router, RouterLocationOptions } from './Router'
import { NodeMatcherOptions } from './Node';

export class RoutingObservable implements Observable<RoutingState> {
    readonly location: Location

    private cachedValue?: RoutingState
    private context: any
    private matcher: Junction['prototype']
    private observers: Observer<RoutingState>[]
    private resolver: Resolver
    private router: Router
    private rootJunction: Junction
    private rootMapping: AbsoluteMapping
    private withContent: boolean
  
    constructor(
        context: any,
        location: Location,
        rootJunction: Junction,
        rootMapping: AbsoluteMapping,
        resolver: Resolver,
        router: Router,
        options: RouterLocationOptions
    ) {
        this.context = context
        this.location = location
        this.resolver = resolver
        this.observers = []
        this.rootJunction = rootJunction
        this.rootMapping = rootMapping
        this.router = router
        this.withContent = !!options.withContent
    }

    subscribe(
        onNextOrObserver: Observer<RoutingState> | ((value: RoutingState) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        if (this.observers.length === 0) {
            this.createMatcher()
            this.refresh()
        }
        let observer = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        this.observers.push(observer)
        return new SimpleSubscription(this.handleUnsubscribe, observer)
    }

    private createMatcher() {
        this.matcher = new this.rootJunction({
            context: this.context,
            matchableLocation: this.location,
            mapping: this.rootMapping,
            resolver: this.resolver,
            router: this.router,
            withContent: !!this.withContent
        })
    }

    getState(): RoutingState {
        // We don't need to worry about any subscriptions here
        if (this.cachedValue) {
            return this.cachedValue
        }
        else {
            this.createMatcher()
            let state = createRoutingState(this.location, this.matcher.run().route!)
            delete this.matcher
            return state
        }
    }

    private handleUnsubscribe = (observer: Observer<RoutingState>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
        if (this.observers.length === 0) {
            delete this.matcher
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
        let { route, resolutionIds } = this.matcher.run()
        this.cachedValue = createRoutingState(this.location, route!)
        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolutionIds!)
        return this.cachedValue!
    }
}
