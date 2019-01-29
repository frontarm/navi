import { createMemoryHistory, History } from 'history';
import { Switch } from './Switch'
import { Navigation, NavigationSnapshot } from './Navigation'
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

    private pages: Switch
    private basename?: string
    private resolver: Resolver

    private currentRouteObservable: CurrentRouteObservable<Context>

    constructor(options: MemoryNavigationOptions<Context>) {
        this.history = createMemoryHistory({
            initialEntries: [createURLDescriptor(options.url).href],
        })
        this.resolver = new Resolver
        this.pages = options.pages
        this.basename = options.basename
        this.router = new Router(this.resolver, {
            context: options.context,
            pages: this.pages,
            basename: this.basename,
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
        delete this.pages
    }

    setContext(context: Context) {
        this.router = new Router(this.resolver, {
            context: context,
            pages: this.pages,
            basename: this.basename,
        })
        this.currentRouteObservable.setRouter(this.router)
    }

    getCurrentValue(): NavigationSnapshot {
        let route = this.currentRouteObservable.getValue()
        return {
            route,
            url: route.url,
            history: this.history,
            router: this.router,
            onRendered: noop,
        }
    }

    async getSteadyValue(): Promise<NavigationSnapshot> {
        return this.currentRouteObservable.getSteadyRoute().then(route => ({
            route,
            url: route.url,
            history: this.history,
            router: this.router,
            onRendered: noop,
        }))
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
        onNextOrObserver: Observer<NavigationSnapshot> | ((value: NavigationSnapshot) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let navigationObserver = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        let mapObserver = new MapObserver(navigationObserver, this)
        return this.currentRouteObservable.subscribe(mapObserver)
    }
}


const noop = () => {}


class MapObserver implements Observer<Route> {
    navigation: MemoryNavigation<any>
    observer: Observer<NavigationSnapshot>

    constructor(observer: Observer<NavigationSnapshot>, navigation: MemoryNavigation<any>) {
        this.observer = observer
        this.navigation = navigation
    }

    next(route: Route): void {
        this.observer.next({
            route,
            url: route.url,
            history: this.navigation.history,
            router: this.navigation.router,
            onRendered: noop,
        })
    }
    error(errorValue: any): void {
        if (this.observer.error) {
            this.observer.error(errorValue)
        }
    }
}