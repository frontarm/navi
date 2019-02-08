import { MatcherGenerator, MatcherGeneratorClass } from './Matcher'
import { Observable, Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { Resolver } from './Resolver'
import { Env } from './Env';
import { URLDescriptor } from './URLTools';
import { Segment } from './Segments'

export class SegmentListObservable implements Observable<Segment[]> {
    readonly url: URLDescriptor

    private cachedValue: Segment[]
    private matcherGenerator: MatcherGenerator<any>
    private observers: Observer<Segment[]>[]
    private resolver: Resolver
  
    constructor(
        url: URLDescriptor,
        env: Env,
        matcherGeneratorClass: MatcherGeneratorClass<any>,
        resolver: Resolver,
    ) {
        this.url = url
        this.resolver = resolver
        this.observers = []
        this.matcherGenerator = new matcherGeneratorClass({
            appendFinalSlash: true,
            env,
            resolver: this.resolver
        })
    }

    subscribe(
        onNextOrObserver: Observer<Segment[]> | ((value: Segment[]) => void),
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

    private handleUnsubscribe = (observer: Observer<Segment[]>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
    }

    private handleChange = () => {
        this.refresh()
        let isDone = this.cachedValue.every(segment => segment.type !== 'busy')
        for (let i = 0; i < this.observers.length; i++) {
            let observer = this.observers[i]
            observer.next(this.cachedValue)
            if (isDone && observer.complete) {
                observer.complete()
            }
        }
        if (isDone) {
            this.resolver.unlisten(this.handleChange)
            delete this.matcherGenerator
            delete this.resolver
        }
    }

    private refresh = () => {
        let { segments, resolutionIds } = this.matcherGenerator.getResult()
        this.cachedValue = segments
        // This will replace any existing listener and its associated resolvables
        this.resolver.listen(this.handleChange, resolutionIds)
    }
}
