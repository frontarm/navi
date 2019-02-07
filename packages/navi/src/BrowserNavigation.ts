import { createBrowserHistory, History } from 'history'
import { Navigation } from './Navigation'
import { Resolver } from './Resolver'
import { Router } from './Router'
import { Route } from './Route'
import { Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { CurrentRouteObservable, createCurrentRouteObservable } from './CurrentRouteObservable';
import { Matcher } from './Matcher'


export interface BrowserNavigationOptions<Context extends object> {
    /**
     * The Matcher that declares your app's pages.
     */
    matcher?: Matcher<Context>,
    pages?: Matcher<Context>,

    /**
     * If provided, this part of any URLs will be ignored. This is useful
     * for mounting a Navi app in a subdirectory on a domain.
     */
    basename?: string,

    /**
     * This will be made available within your matcher through
     * the `env` object passed to any getter functions.
     */
    context?: Context,

    /**
     * You can manually supply a history object. This is useful for
     * integration with react-router.
     * 
     * By default, a browser history object will be created.
     */
    history?: History,
}


export function createBrowserNavigation<Context extends object>(options: BrowserNavigationOptions<Context>) {
    return new BrowserNavigation(options)
}


export class BrowserNavigation<Context extends object> implements Navigation<Context> {
    router: Router<Context>
    history: History

    private matcher: Matcher<Context>
    private basename?: string
    private resolver: Resolver
    private currentRouteObservable: CurrentRouteObservable<Context>

    constructor(options: BrowserNavigationOptions<Context>) {
        if (options.pages) {
            options.matcher = options.pages
        }

        this.history = options.history || createBrowserHistory()
        this.resolver = new Resolver
        this.matcher = options.matcher!
        this.basename = options.basename
        this.router = new Router(this.resolver, {
            context: options.context,
            matcher: this.matcher,
            basename: options.basename,
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
        delete this.history
        delete this.resolver
        delete this.matcher
    }

    setContext(context: Context) {
        this.router = new Router(this.resolver, {
            context: context,
            matcher: this.matcher,
            basename: this.basename,
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
