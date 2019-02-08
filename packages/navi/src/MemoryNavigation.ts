import { createMemoryHistory, History } from 'history';
import { Matcher } from './Matcher'
import { Navigation } from './Navigation'
import { Reducer } from './Reducer'
import { Router } from './Router'
import { Route, defaultRouteReducer } from './Route'
import { Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { CurrentRouteObservable, createCurrentRouteObservable } from './CurrentRouteObservable';
import { URLDescriptor, createURLDescriptor } from './URLTools';
import { Segment } from './Segments';


export interface MemoryNavigationOptions<Context extends object, R = Route> {
    /**
     * The Matcher that declares your app's pages.
     */
    routes?: Matcher<Context>,
    pages?: Matcher<Context>,

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
     * This will be made available within your matcher through
     * the second argument passed to any getter functions.
     */
    context?: Context,

    /**
     * The function that reduces segments into a Route object.
     */
    reducer?: Reducer<Segment, R>,
}


export function createMemoryNavigation<Context extends object, R = Route>(options: MemoryNavigationOptions<Context, R>) {
    return new MemoryNavigation(options)
}


export class MemoryNavigation<Context extends object, R> implements Navigation<Context, R> {
    router: Router<Context, R>

    readonly history: History

    private options: MemoryNavigationOptions<Context, R>
    private currentRouteObservable: CurrentRouteObservable<Context, R>

    constructor(options: MemoryNavigationOptions<Context, R>) {
        if (options.pages) {
            console.warn(
                `Deprecation Warning: passing a "pages" option to "createMemoryNavigation()" will `+
                `no longer be supported from Navi 0.12. Use the "matcher" option instead.`
            )
            options.routes = options.pages
        }

        let reducer = options.reducer || defaultRouteReducer as any as Reducer<Segment, R>

        this.history = createMemoryHistory({
            initialEntries: [createURLDescriptor(options.url).href],
        })
        this.options = options
        this.router = new Router({
            context: options.context,
            routes: (this.options.routes || this.options.pages)!,
            basename: this.options.basename,
            reducer,
        })
        this.currentRouteObservable = createCurrentRouteObservable({
            history: this.history,
            router: this.router,
            reducer,
        })
    }

    dispose() {
        this.currentRouteObservable.dispose()
        delete this.currentRouteObservable
        delete this.router
        delete this.options
    }

    setContext(context: Context) {
        this.currentRouteObservable.setContext(context)
    }

    getCurrentValue(): R {
        return this.currentRouteObservable.getValue()
    }

    getSteadyValue(): Promise<R> {
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
        onNextOrObserver: Observer<R> | ((value: R) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let navigationObserver = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        return this.currentRouteObservable.subscribe(navigationObserver)
    }
}
