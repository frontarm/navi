import { createBrowserHistory, History } from 'history'
import { Navigation } from './Navigation'
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
     * You can manually supply a history object. This is useful for
     * integration with react-router.
     * 
     * By default, a browser history object will be created.
     */
    history?: History,

    /**
     * The function that reduces chunks into a Route object.
     */
    reducer?: Reducer<Chunk, R>,
}


export function createBrowserNavigation<Context extends object, R = Route>(options: BrowserNavigationOptions<Context, R>) {
    if (options.pages) {
        // if (process.env.NODE_ENV !== 'production') {
        //     console.warn(
        //         `Deprecation Warning: passing a "pages" option to "createBrowserNavigation()" will `+
        //         `no longer be supported from Navi 0.12. Use the "matcher" option instead.`
        //     )
        // }
        options.routes = options.pages
    }

    let history = options.history || createBrowserHistory()
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
