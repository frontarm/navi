import { createMemoryHistory, History } from 'history';
import { Junction } from './Junction'
import { Navigation, NavigationState } from './Navigation'
import { Resolver } from './Resolver'
import { Router, RouterOptions } from './Router'
import { RoutingState } from './RoutingState'
import { Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { HistoryRoutingObservable, createHistoryRoutingObservable } from './HistoryRoutingObservable';


export interface MemoryNavigationOptions<Context> extends RouterOptions<Context> {
    url: string

    initialRootContext?: Context,

    rootJunction: Junction,
    rootPath?: string,
}


export function createMemoryNavigation<Context>(options: MemoryNavigationOptions<Context>) {
    return new MemoryNavigation(options)
}


export class MemoryNavigation<Context> implements Navigation<Context> {
    router: Router<Context>

    readonly history: History

    private rootJunction: Junction
    private rootPath?: string
    private resolver: Resolver

    private historyRoutingObservable: HistoryRoutingObservable<Context>

    constructor(options: MemoryNavigationOptions<Context>) {
        this.history = createMemoryHistory({
            initialEntries: [options.url],
        })
        this.resolver = new Resolver
        this.rootJunction = options.rootJunction
        this.rootPath = options.rootPath
        this.router = new Router(this.resolver, {
            rootContext: options.initialRootContext,
            rootJunction: this.rootJunction,
            rootPath: this.rootPath,
        })
        this.historyRoutingObservable = createHistoryRoutingObservable({
            history: this.history,
            router: this.router,
        })
    }

    setContext(context: Context) {
        this.router = new Router(this.resolver, {
            rootContext: context,
            rootJunction: this.rootJunction,
            rootPath: this.rootPath,
        })
        this.historyRoutingObservable.setRouter(this.router)
    }

    getSnapshot(): NavigationState {
        return {
            history: this.history,
            router: this.router,
            ...this.historyRoutingObservable.getValue(),
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