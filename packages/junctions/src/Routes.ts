import { Location } from './Location'
import { Mountable, Junction, Page, Redirect } from './Mounts'


//
// External Routes
//


/**
 * A type that covers all Route objects.
 */
export type AnyRoute<ParentJunction extends Junction=any> =
    AsyncRoute<ParentJunction> |
    Sync.JunctionRoute<ParentJunction, any, any, any> |
    Sync.PageRoute<ParentJunction, any, any> |
    Sync.RedirectRoute<ParentJunction> |
    NotFoundRoute

/**
 * The type of rouyte emitted by a JunctionManager's `getRootRoute` method.
 */
export type RootRoute<RootJunction extends Junction> =
    Sync.JunctionRoute<any, RootJunction['component'], RootJunction['payload'], RootJunction> |

    // If the root route has required params and they're missing
    NotFoundRoute |

    // If the junction is matched exactly and it has a default path, the route
    // will be a redirect.
    Sync.RedirectRoute<any> |

    // If the base path is not matched, the route is undefined.
    undefined

/**
 * A Route that will be received by a Junction's component
 */
export type JunctionRoute<J extends Junction = Junction> =
    Sync.JunctionRoute<any, J['component'], J['payload'], J>

/**
 * A Route that will be received by a Page's component
 */
export type PageRoute<P extends Page = Page> =
    Sync.PageRoute<any, P['component'], P['asyncContent']['value'], P['meta']>



//
// Internal Routes
//


/**
 * All routes extend this interface. It includes all information that can be
 * inferred from just a pattern string and a location.
 */
interface RouteBase<ParentJunction extends Junction> {
    params: { [name: string]: any },
    location: Location,
}

/**
 * A Route that can be used to indicate that a match was not found.
 */
export interface NotFoundRoute extends RouteBase<any> {
    type: 'NotFoundRoute',
    status: 'notfound',
    pattern?: undefined,

    /**
     * The mountable object from which this Route originated.
     */
    source: Mountable,
}

/**
 * A Route for a async mountable that hasn't yet been loaded.
 */
export interface AsyncRoute<ParentJunction extends Junction> extends RouteBase<ParentJunction> {
    type: 'AsyncRoute',
    status: 'busy' | 'error',
    pattern: keyof ParentJunction['children'],

    /**
     * The mountable object from which this Route originated.
     */
    source: Junction,
}

/**
 * A Route for a loaded *or unloaded* Mountable of unknown type
 */
export type MaybeAsyncRoute<M extends Mountable, ParentJunction extends Junction> = 
    Sync.Route<M, ParentJunction> | AsyncRoute<ParentJunction>


export namespace Sync {

    /**
     * A Route for a loaded Mountable of unknown type
     */
    export type Route<M extends Mountable=Mountable, ParentJunction extends Junction=any> = {
        'Junction': JunctionRoute<ParentJunction, M['component'], any, any>,
        'Page': PageRoute<ParentJunction, M['component'], any, any>,
        'Redirect': RedirectRoute<ParentJunction>,
    }[M['mountableType']]

    /**
     * A Route for a loaded Junction.
     */
    export interface JunctionRoute<ParentJunction extends Junction, Component, Payload, J extends Junction> extends RouteBase<ParentJunction> {
        // Status can be `notfound` if required params aren't matched.
        status: 'ready',
        type: 'JunctionRoute',
        component: Component,
        payload: Payload,
        child?: JunctionChildRoute<J>,
        descendents?: JunctionDescendentsRoutes<J>,
        pattern: keyof ParentJunction['children'],

        /**
         * The mountable object from which this Route originated.
         */
        source: J,
    }

    /**
     * The Route for a child of a given Junction.
     * 
     * The child Route's `component` and `pattern` types will be inferred from
     * the junction's children.
     */
    export type JunctionChildRoute<J extends Junction> = {
        [K in keyof J['children']]: {
            // While the route initially needed to be loaded, it might have
            // already been loaded by the time this Route object is produced.
            'Async': MaybeAsyncRoute<J['children'][K]['value'], J>,
            'Mountable': Route<J['children'][K], J>,
        }[J['children'][K]['type']]
    }[keyof J['children']]

    /**
     * An array of all Routes for URL segments that come after this junction's
     * segment.
     */
    export interface JunctionDescendentsRoutes<J extends Junction> extends Array<AnyRoute> {
        0: JunctionChildRoute<J>;
        [i: number]: AnyRoute
    }

    /**
     * A Route for a loaded Page.
     */
    export interface PageRoute<ParentJunction extends Junction, Component=any, Content=any, Meta=any> extends RouteBase<ParentJunction> {
        status: 'ready',
        type: 'PageRoute'
        title: string,
        component: Component,
        content?: Content,
        contentStatus?: 'ready' | 'busy' | 'error',
        meta: Meta,
        pattern: keyof ParentJunction['children'],

        /**
         * The mountable object from which this Route originated.
         */
        source: Page<Component, Content, Meta>,
    }



    /**
     * A Route for a Redirect.
     * 
     * Note that redirect doesn't actually have a component, but the property has
     * been added to the type to allow us to index on `['component']` for the
     * `MountableRoute` type.
     */
    export interface RedirectRoute<ParentJunction extends Junction> extends RouteBase<ParentJunction> {
        type: 'RedirectRoute'
        status: 'redirect',
        component: never,
        to: Location,
        pattern: keyof ParentJunction['children'],

        /**
         * The mountable object from which this Route originated.
         */
        source: Redirect | Junction,
    }
}
