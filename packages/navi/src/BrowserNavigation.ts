import { createBrowserHistory, History } from 'history'
import { Navigation, NaviStates, NAVI_STATES_KEY } from './Navigation'
import { Chunk } from './Chunks'
import { Reducer } from './Reducer'
import { Route } from './Route'
import { Matcher } from './Matcher'


export interface BrowserNavigationOptions<Context extends object, R = Route> {
    /**
     * The Matcher that declares your app's pages.
     */
    routes?: Matcher<Context>,
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
     * If you specify a react-router style `history` object, then Navi will
     * use it to interact with the browser history -- allowing for integration
     * with react-router (and other custom behaviors).
     */
    history?: History,

    /**
     * Accepts the state of the Navigation object used to generate the initial
     * screen on the server. This allows the BrowserNavigation to generate the
     * correct route for non-GET methods, and to reuse any memoized values.
     */
    serverStates?: NaviStates,

    /**
     * The function that reduces chunks into a Route object.
     */
    reducer?: Reducer<Chunk, R>,
}


export function createBrowserNavigation<Context extends object, R = Route>(options: BrowserNavigationOptions<Context, R>) {
    if (options.pages) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(
                `Deprecation Warning: passing a "pages" option to "createBrowserNavigation()" will `+
                `no longer be supported from Navi 0.13. Use the "routes" option instead.`
            )
        }
        options.routes = options.pages
    }

    // If there's a server state on the window object, use it.
    if (!options.serverStates && typeof window !== undefined && window['__NAVI_STATE__']) {
        options.serverStates = window['__NAVI_STATE__']
    }

    let history = options.history || createBrowserHistory()
    if (options.serverStates) {
        history.replace({
            ...history.location,
            state: {
                ...history.location.state,
                [NAVI_STATES_KEY]: options.serverStates,
            }
        })
    }
    let navigation = new Navigation({
        history,
        basename: options.basename,
        context: options.context,
        routes: options.routes!,
        reducer: options.reducer,
    })
    navigation.refresh()
    return navigation
}
