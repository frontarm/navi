import { MatcherIterator, MatcherGenerator } from './Matcher'
import { Observable, Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { Resolver } from './Resolver'
import { Env } from './Env';
import { URLDescriptor } from './URLTools';
import { Segment, BusySegment } from './Segments'

export class SegmentListObservable implements Observable<Segment[]> {
    readonly url: URLDescriptor

    private result: IteratorResult<Segment[]>
    private matcherIterator: MatcherIterator
    private observers: Observer<Segment[]>[]
    private resolver: Resolver
    private lastListenId: number
  
    constructor(
        url: URLDescriptor,
        env: Env,
        matcherGeneratorClass: MatcherGenerator<any>,
        resolver: Resolver,
    ) {
        this.url = url
        this.lastListenId = 0
        this.resolver = resolver
        this.observers = []
        this.matcherIterator = matcherGeneratorClass({
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
        if (!this.matcherIterator) {
            throw new Error("Can't subscribe to an already-complete RoutingObservable.")
        }
        let observer = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        this.observers.push(observer)
        let subscription = new SimpleSubscription(this.handleUnsubscribe, observer)
        if (this.observers.length === 1) {
            this.handleChange(this.lastListenId)
        }
        return subscription
    }

    private handleUnsubscribe = (observer: Observer<Segment[]>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
    }

    private handleChange = (listenId) => {
        if (listenId === this.lastListenId) {
            this.refresh()
            let isDone = this.result.done || this.result.value.every(segment => segment.type !== 'busy')
            for (let i = 0; i < this.observers.length; i++) {
                let observer = this.observers[i]
                observer.next(this.result.value)
                if (isDone && observer.complete) {
                    observer.complete()
                }
            }
            if (isDone) {
                // Prevent any further changes from being handled
                this.lastListenId++
                
                delete this.matcherIterator
                delete this.resolver
            }
        }
    }

    private refresh = () => {
        let result = this.matcherIterator.next()
        if (result.value) {
            this.result = result
        }
        if (!this.result.done) {
            let listenId = ++this.lastListenId
            let handleUpdate = () => this.handleChange(listenId)
            Promise.race(
                this.result.value
                    .filter(isBusy)
                    .map(pickSegmentPromise)
            ).then(handleUpdate, handleUpdate)
        }
    }
}

function isBusy(segment: Segment): segment is BusySegment {
    return segment.type === 'busy'
}

function pickSegmentPromise(segment: BusySegment): PromiseLike<any> {
    return segment.promise
}