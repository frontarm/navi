import { Location } from './Location'
import { Mountable, Junction, Page, Redirect } from './Mounts'


/**
 * A type that covers all Route objects.
 */
export type Route<ParentJunction extends Junction=any> =
    AsyncRoute<ParentJunction> |
    JunctionRoute<ParentJunction, any, any> |
    PageRoute<ParentJunction, any, any> |
    RedirectRoute<ParentJunction> |
    NotFoundRoute

export type RootRoute<RootJunction extends Junction<any, any, any>> =
    JunctionRoute<any, RootJunction['component'], RootJunction['payload'], RootJunction> |

    // If the root route has required params and they're missing
    NotFoundRoute |

    // If the junction is matched exactly and it has a default path, the route
    // will be a redirect.
    RedirectRoute<any> |

    // If the base path is not matched, the route is undefined.
    undefined

/**
 * All routes extend this interface. It includes all information that can be
 * inferred from just a pattern string and a location.
 */
interface RouteBase<ParentJunction extends Junction> {
    params: { [name: string]: any },
    location: Location,
}

/**
 * A Route for a loaded Mountable of unknown type
 */
export type MountableRoute<M extends Mountable=Mountable, ParentJunction extends Junction<any, any, any>=any> = {
    'Junction': JunctionRoute<ParentJunction, M['component'], any>,
    'Page': PageRoute<ParentJunction, M['component'], any, any>,
    'Redirect': RedirectRoute<ParentJunction>,
}[M['mountableType']]

/**
 * A Route for a async mountable that hasn't yet been loaded.
 */
export interface AsyncRoute<ParentJunction extends Junction<any, any, any>> extends RouteBase<ParentJunction> {
    type: 'AsyncRoute',
    status: 'busy' | 'error',
    pattern: keyof ParentJunction['children'],

    /**
     * The mountable object from which this Route originated.
     */
    source: Junction<any, any, any>,
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
 * A Route for a loaded *or unloaded* Mountable of unknown type
 */
export type AsyncMountableRoute<M extends Mountable, ParentJunction extends Junction<any, any, any>> = 
    MountableRoute<M, ParentJunction> | AsyncRoute<ParentJunction>
    
/**
 * A Route that will be received by a Junction's component
 */
export type JunctionComponentRoute<J extends Junction<any, any, any>> =
    JunctionRoute<any, any, J['payload'], J>

/**
 * A Route that will be received by a Page's component
 */
export type PageComponentRoute<P extends Page<any, any, any>> =
    PageRoute<any, P['component'], P['asyncContent']['value'], P['meta']>



/**
 * A Route for a loaded Junction.
 */
export interface JunctionRoute<ParentJunction extends Junction, Component=undefined, Payload=undefined, J extends Junction<any, any, any>=any> extends RouteBase<ParentJunction> {
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
export type JunctionChildRoute<J extends Junction<any, any, any>> = {
    [K in keyof J['children']]: {
        'Async': AsyncMountableRoute<J['children'][K]['value'], J>,
        'Mountable': MountableRoute<J['children'][K], J>,
    }[J['children'][K]['type']]
}[keyof J['children']]

/**
 * An array of all Routes for URL segments that come after this junction's
 * segment.
 */
export interface JunctionDescendentsRoutes<J extends Junction<any, any, any>> extends Array<Route> {
    0: JunctionChildRoute<J>;
    [i: number]: Route;
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
    source: Redirect | Junction<any, any, any>,
}
