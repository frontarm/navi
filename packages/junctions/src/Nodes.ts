import { Location } from './Location'
import { Definition, JunctionDefinition, PageDefinition, RedirectDefinition } from './Mounts'


//
// External Nodes
//


/**
 * A type that covers all Node objects.
 */
export type Node =
    BusyNode |
    ErrorNode | 
    SyncNodes.Junction<any, any, any> |
    SyncNodes.Page<any, any> |
    SyncNodes.Redirect |
    NotFoundNode


/**
 * The type of rouyte emitted by a JunctionManager's `getState` method.
 */
export type RootNode<RootJunction extends JunctionDefinition> =
    SyncNodes.Junction<RootJunction['component'], RootJunction['payload'], RootJunction> |

    // If the root route has required params and they're missing
    NotFoundNode |

    // If the junction is matched exactly and it has a default path, the route
    // will be a redirect.
    SyncNodes.Redirect |

    // If the base path is not matched, the route is undefined.
    undefined

/**
 * A Node that will be received by a Junction's component
 */
export type JunctionNode<J extends JunctionDefinition = JunctionDefinition> =
    SyncNodes.Junction<any, J['payload'], J>

/**
 * A Node that will be received by a Page's component
 */
export type PageNode<P extends PageDefinition = PageDefinition> =
    SyncNodes.Page<any, P['asyncContent']['value'], P['meta']>



//
// Internal Nodes
//


/**
 * All routes extend this interface. It includes all information that can be
 * inferred from just a pattern string and a location.
 */
interface NodeBase {
    params?: { [name: string]: any },
    location: Location,
}

/**
 * A Node that can be used to indicate that a match was not found.
 */
export interface NotFoundNode extends NodeBase {
    type: 'notfound',
    status: 'notfound',
}

/**
 * A Node for a async mountable that hasn't yet been loaded.
 */
export interface BusyNode extends NodeBase {
    type: 'busy',
    status: 'busy',
}
export interface ErrorNode extends NodeBase {
    type: 'error',
    status: 'error',
    error: any,
}


/**
 * A Node for a loaded *or unloaded* Mountable of unknown type
 */
export type MaybeAsyncNode<M extends Definition> = 
    SyncNode<M> | BusyNode | ErrorNode

/**
 * A Node for a loaded Mountable of unknown type
 */
export type SyncNode<M extends Definition=Definition> = {
    'Junction': SyncNodes.Junction<M['component'], any, any>,
    'Page': SyncNodes.Page<M['component'], any, any>,
    'Redirect': SyncNodes.Redirect,
}[M['mountableType']]


export namespace SyncNodes {

    /**
     * A Node for a loaded Junction.
     */
    export interface Junction<Component, Payload, J extends JunctionDefinition> extends NodeBase {
        status: 'ready',
        type: 'junction',
        component: Component,
        payload: Payload,
        children: J['children'],
        defaultPath: string | null,

        activeChild?: JunctionChildNode<J>,
        activeChildPattern?: keyof J['children'],
        activeDescendents?: JunctionDescendentsNodes<J>,

        /**
         * The mountable object from which this Node originated.
         */
        definition: J,
    }

    /**
     * The Node for a child of a given Junction.
     * 
     * The child Node's `component` type will be inferred from
     * the junction's children.
     */
    export type JunctionChildNode<J extends JunctionDefinition> = 
        {
            [K in keyof J['children']]: {
                // While the route initially needed to be loaded, it might have
                // already been loaded by the time this Node object is produced.
                'Async': MaybeAsyncNode<J['children'][K]['value']>,
                'Mountable': SyncNode<J['children'][K]>,
                any: string
            }[J['children'][K]['type']]
        }[keyof J['children']]
    
    /**
     * An array of all Nodes for URL segments that come after this junction's
     * segment.
     */
    export interface JunctionDescendentsNodes<J extends JunctionDefinition> extends Array<Node> {
        0: JunctionChildNode<J>;
        [i: number]: Node
    }

    /**
     * A Node for a loaded Page.
     */
    export interface Page<Component=any, Content=any, Meta=any> extends NodeBase {
        status: 'ready',
        type: 'page'
        title: string,
        content?: Content,
        contentStatus?: 'ready' | 'busy' | 'error',
        contentError?: any,
        meta: Meta,
        component: Component,

        /**
         * The mountable object from which this Node originated.
         */
        definition: PageDefinition<Component, Content, Meta>,
    }



    /**
     * A Node for a Redirect.
     * 
     * Note that redirect doesn't actually have a component, but the property has
     * been added to the type to allow us to index on `['component']` for the
     * `MountableNode` type.
     */
    export interface Redirect extends NodeBase {
        type: 'redirect'
        status: 'redirect',
        component: never,
        to: Location,

        /**
         * The mountable object from which this Node originated.
         */
        definition: RedirectDefinition | JunctionDefinition,
    }
}
