import { MatcherIterator, MatcherGenerator } from './Matcher'
import { Observable, Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { URLDescriptor } from './URLTools'
import { Chunk, BusyChunk } from './Chunks'
import { NaviRequest } from './NaviRequest'

export class ChunkListObservable implements Observable<Chunk[]> {
    readonly url: URLDescriptor

    private result: IteratorResult<Chunk[]>
    private matcherIterator: MatcherIterator
    private observers: Observer<Chunk[]>[]
    private lastListenId: number
  
    constructor(
        url: URLDescriptor,
        request: NaviRequest,
        matcherGenerator: MatcherGenerator<any>
    ) {
        this.url = url
        this.lastListenId = 0
        this.observers = []
        this.matcherIterator = matcherGenerator(request)
    }

    
    subscribe(
        onNextOrObserver: Observer<Chunk[]> | ((value: Chunk[]) => void),
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

    private handleUnsubscribe = (observer: Observer<Chunk[]>) => {
        let index = this.observers.indexOf(observer)
        if (index !== -1) {
            this.observers.splice(index, 1)
        }
    }

    private handleChange = (listenId) => {
        if (listenId === this.lastListenId) {
            this.lastListenId++
            this.refresh()
            let isDone = this.result.done || this.result.value.every(chunk => chunk.type !== 'busy')
            for (let i = 0; i < this.observers.length; i++) {
                let observer = this.observers[i]
                observer.next(this.result.value)
                if (isDone && observer.complete) {
                    observer.complete()
                }
            }
            if (isDone) {
                delete this.matcherIterator
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
                    .map(pickChunkPromise)
            ).then(handleUpdate, handleUpdate)
        }
    }
}

function isBusy(chunk: Chunk): chunk is BusyChunk {
    return chunk.type === 'busy'
}

function pickChunkPromise(chunk: BusyChunk): PromiseLike<any> {
    return chunk.promise
}