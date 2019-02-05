import { createMemoryHistory, History } from 'history';
import { Switch } from './Switch'
import { Navigation } from './Navigation'
import { Resolver } from './Resolver'
import { Router, RouterOptions } from './Router'
import { Route } from './Route'
import { Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { CurrentRouteObservable, createCurrentRouteObservable } from './CurrentRouteObservable';
import { URLDescriptor, createURLDescriptor } from './URLTools';


export interface MemoryNavigationOptions<Context extends object> extends RouterOptions<Context> {
    /**
     * The Switch that declares your app's pages.
     */
    pages: Switch,

    /**
     * The initial URL to match.
     */
    url: string | Partial<URLDescriptor>

    /**
     * If provided, this part of any URLs will be ignored. This is useful
     * for mounting a Navi app in a subdirectory on a domain.
     */
    basename?: string,

    /**
     * This will be made available within your `pages` Switch through
     * the `env` object passed to any getter functions.
     */
    context?: Context,
}


export function createMemoryNavigation<Context extends object>(options: MemoryNavigationOptions<Context>) {
    return new MemoryNavigation(options)
}


export class MemoryNavigation<Context extends object> implements Navigation<Context> {
    router: Router<Context>

    readonly history: History

    private options: MemoryNavigationOptions<Context>
    private resolver: Resolver

    private currentRouteObservable: CurrentRouteObservable<Context>

    constructor(options: MemoryNavigationOptions<Context>) {
        this.history = createMemoryHistory({
            initialEntries: [createURLDescriptor(options.url).href],
        })
        this.resolver = new Resolver
        this.options = options
        this.router = new Router(this.resolver, {
            context: options.context,
            pages: this.options.pages,
            basename: this.options.basename,
        })
        this.currentRouteObservable = createCurrentRouteObservable({
            history: this.history,
            router: this.router,
        })
    }

    dispose() {
        this.currentRouteObservable.dispose()
        delete this.currentRouteObservable
        delete this.router
        delete this.resolver
        delete this.options
    }

    setContext(context: Context) {
        this.router = new Router(this.resolver, {
            context: context,
            pages: this.options.pages,
            basename: this.options.basename,
        })
        this.currentRouteObservable.setRouter(this.router)
    }

    getCurrentValue(): Route {
        return this.currentRouteObservable.getValue()
    }

    getSteadyValue(): Promise<Route> {
        return this.currentRouteObservable.getSteadyRoute()
    }

    async steady() {
        await this.getSteadyValue()
        return
    }

    /**
     * If you're using code splitting, you'll need to subscribe to changes to
     * the snapshot, as the route may change as new code chunks are received.
     */
    subscribe(
        onNextOrObserver: Observer<Route> | ((value: Route) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let navigationObserver = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        return this.currentRouteObservable.subscribe(navigationObserver)
    }
}
