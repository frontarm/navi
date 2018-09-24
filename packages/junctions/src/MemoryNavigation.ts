import { createMemoryHistory, History } from 'history';
import { Navigation, NavigationState } from './Navigation'
import { Router, RouterOptions, createRouter } from './Router'
import { RoutingState } from './RoutingState'
import { Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { HistoryRoutingObservable, createHistoryRoutingObservable } from './HistoryRoutingObservable';


export interface MemoryNavigationOptions<Context> extends RouterOptions<Context> {
    url: string
}


export function createMemoryNavigation<Context>(options: MemoryNavigationOptions<Context>) {
    return new MemoryNavigation(options)
}


export class MemoryNavigation<Context> implements Navigation {
    readonly router: Router<Context>
    readonly history: History

    private historyRoutingObservable: HistoryRoutingObservable<Context>

    constructor(options: MemoryNavigationOptions<Context>) {
        this.history = createMemoryHistory({
            initialEntries: [options.url],
        })
        this.router = createRouter(options)
        this.historyRoutingObservable = createHistoryRoutingObservable({
            history: this.history,
            router: this.router,
        })
    }

    getState(): NavigationState {
        return {
            history: this.history,
            router: this.router,
            ...this.historyRoutingObservable.getState(),
            onRendered: noop,
        }
    }

    async getSteadyState(): Promise<NavigationState> {
        return this.historyRoutingObservable.getSteadyState().then(routingState => ({
            history: this.history,
            router: this.router,
            ...routingState,
            onRendered: noop,
        }))
    }

    /**
     * If you're using code splitting, you'll need to subscribe to changes to
     * Navigation state, as the state may change as new code chunks are
     * received.
     */
    subscribe(
        onNextOrObserver: Observer<NavigationState> | ((value: NavigationState) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let navigationObserver = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        let mapObserver = new MapObserver(navigationObserver, this.history, this.router)
        return this.historyRoutingObservable.subscribe(mapObserver)
    }
}


const noop = () => {}


class MapObserver implements Observer<RoutingState> {
    history: History
    router: Router<any>
    observer: Observer<NavigationState>

    constructor(observer: Observer<RoutingState>, history: History, router: Router<any>) {
        this.observer = observer
        this.history = history
        this.router = router
    }

    next(routingState: RoutingState): void {
        this.observer.next({
            history: this.history,
            router: this.router,
            ...routingState,
            onRendered: noop,
        })
    }
    error(errorValue: any): void {
        if (this.observer.error) {
            this.observer.error(errorValue)
        }
    }
}