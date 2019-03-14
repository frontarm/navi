import { createMemoryHistory } from 'history';
import { Matcher } from './Matcher'
import { Navigation, NavigateOptions } from './Navigation'
import { Reducer } from './Reducer'
import { Route } from './Route'
import { URLDescriptor } from './URLTools';
import { Chunk } from './Chunks';


export interface MemoryNavigationOptions<Context extends object, R = Route> {
    /**
     * The Matcher that declares your app's pages.
     */
    routes?: Matcher<Context>,
    pages?: Matcher<Context>,

    /**
     * The initial URL to match.
     */
    url?: string | Partial<URLDescriptor>
    request?: NavigateOptions,

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

    history?: any,

    /**
     * The function that reduces chunks into a Route object.
     */
    reducer?: Reducer<Chunk, R>,
}


export function createMemoryNavigation<Context extends object, R = Route>(options: MemoryNavigationOptions<Context, R>) {
    if (options.pages) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(
                `Deprecation Warning: passing a "pages" option to "createMemoryNavigation()" will `+
                `no longer be supported from Navi 0.13. Use the "routes" option instead.`
            )
        }
        options.routes = options.pages
    }

    let url = options.url || (options.request && options.request.url)

    if (!url) {
        throw new Error(`createMemoryNavigation() could not find a URL.`)
    }

    let history = createMemoryHistory({
        // The initial entry is ignored, and replaced during the call
        // to navigate below.
        initialEntries: ['/'],
    })

    let navigation = new Navigation({
        history,
        basename: options.basename,
        context: options.context,
        routes: options.routes!,
        reducer: options.reducer,
    })
    navigation.navigate({
        ...options.request,
        url,
        replace: true,
    })
    return navigation
}
