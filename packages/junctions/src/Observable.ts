export interface Subscription  {
    closed: boolean;
    unsubscribe: () => void;
}

export interface Observable<T> {
    // Subscribes to the sequence with an observer
    subscribe(observer: Observer<T>): Subscription;

    // Subscribes to the sequence with callbacks
    subscribe(
        onNext: (value: T) => void,
        onError?: (error: any) => void,
        onComplete?: () => void
    ): Subscription;
}

export interface Observer<T> {
    // Receives the subscription object when `subscribe` is called
    start?(subscription: Subscription): void;

    // Receives the next value in the sequence
    next(value: T): void;

    // Receives the sequence error
    error?(errorValue: any): void;

    // Receives a completion notification
    complete?(): void;
}

export class SimpleSubscription implements Subscription {
    closed: boolean;

    private close: (observer: Observer<any>) => void
    private observer: Observer<any>

    constructor(close: (observer: Observer<any>) => void, observer: Observer<any>) {
        this.close = close
        this.observer = observer
        if (this.observer.start) {
          this.observer.start(this)
        }
    }

    unsubscribe() {
        if (!this.closed) {
            this.closed = true
            this.close(this.observer)
            delete this.close
            delete this.observer
        }
    }
}

export function createOrPassthroughObserver<T>(
    onNextOrObserver: Observer<T> | ((value: T) => void),
    onError?: (error: any) => void,
    onComplete?: () => void
): Observer<T> {
    return (
        typeof onNextOrObserver === 'function'
            ? {
                next: onNextOrObserver,
                error: onError,
                complete: onComplete,
            }
            : onNextOrObserver
    )
}

export function createPromiseFromObservable<T>(observable: Observable<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        observable.subscribe({
            start(subscription: Subscription) {
                this.subscription = subscription
            },
            next(value: T) {
                this.value = value
            },
            complete() {
                resolve(this.value)
                this.subscription.unsubscribe()
            },
            error(e) {
                reject(e)
                this.subscription.unsubscribe()
            }
        })
    })
}
