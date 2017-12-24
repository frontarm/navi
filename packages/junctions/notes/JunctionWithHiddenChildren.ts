/**
 * "Hidden Children" allow a junction to have more than one current child,
 * by storing extra infomation in the HTML5 history API's "state" store.
 * 
 * This feature hasn't yet been implemented, but the design should allow
 * it to be implemented if it is ever necessary. While the types in this
 * file are a litle old, I'm leaving the file here as it gives a rough
 * idea of how hidden children support could be added.
 */

export type JunctionChildren<Context = any> = 
    {
        [pathTemplate: string]:
            Junction |
            (<J extends Junction>(options: GetterOptions<Context, J['children'], J['hiddenChildren']>) => Promise<J> | J)
    }

export type JunctionHiddenChildren<Context = any> =
    {
        [id: string]: JunctionChildren<Context>
    }


export type JunctionFn =
    (location: Location) => Promise<Junction> | Junction

export type LocateFn<J extends Junction> =
    (locator: Locator<J>) => Location


export type Locator<J extends Junction> =
    string |
    {
        params?: { [name: string]: any },
        children?: PathChildLocator<J['children']>,
        hiddenChildren?: SecondaryChildrenLocator<J['hiddenChildren']>
    }

export type PathChildLocator<Children extends JunctionChildren=any> =
    string |
    {
        pathTemplate: keyof Children,
        params?: { [name: string]: any },
        children?: PathChildLocator,
        secondaryChildren?: SecondaryChildrenLocator,
    }

export type SecondaryChildrenLocator<HiddenChildren extends JunctionHiddenChildren=any> =
    {
        [Id in keyof HiddenChildren]?: PathChildLocator<HiddenChildren[Id]>
    }


export interface Junction<
    Context = any,
    ChildContext = any,
    Children extends JunctionChildren<ChildContext> = any,
    HiddenChildren extends JunctionHiddenChildren<ChildContext> = any
> {
    /**
     * Tell junctions the names of the search parameters that we'd like to
     * consume, if they're available.
     * 
     * If an object is passed in, keys with the value `true` are considered
     * required, and the route will not be matched unless the parameter is
     * available.
     * 
     * You can also pass in an object with serializers/deserializers for 
     * search params, *or* any path parameters.
     */
    params?:
        string[] |
        {
            [name: string]:
                boolean |
                {
                    /**
                     * You can't pass required: false for path params
                     * */
                    required?: boolean,
                    serialize?: (value: any) => string,
                    deserialize?: (value: string) => any,
                }
        },

    /**
     * Allows you to specify arbitrary information that will always be
     * available.
     */
    meta?: any,

    /**
     * Application-specific route data. For example, you could place page
     * content here, or page-specific metadata.
     * 
     * If this is a function, it is expected that it will return a promise
     * when called, which resolves to the content.
     * 
     * This option is mutually exclusive with `getRedirectLocation`.
     */
    getContent?: (options: GetterOptions<Context, Children, HiddenChildren>) => Promise<any> | any,

    /**
     * Indicates that when this route has no next route, it becomes an alias
     * to another route.
     * 
     * This can be used to provide a default route within our children, or
     * it can be used to create a redirect to a hardcoded raw location.
     * 
     * This option is mutually exclusive with `getContent`.
     */
    getRedirectLocation?: (options: GetterOptions<Context, Children, HiddenChildren>) => Promise<Location> | Location

    /**
     * Get the context object that will be available to child junctions and
     * their getters.
     */
    getChildContext?: (options: GetterOptions<Context, Children, HiddenChildren>) => Promise<ChildContext> | ChildContext,

    /**
     * The junctions that will be used to match any remaining part
     * of the Location's pathname and search params.
     */
    children?: Children,

    /**
     * Other junctions that hold navigatin state within HTML5 history's state
     * store.
     */
    hiddenChildren?: HiddenChildren,
}

/**
 * The Route object extends the locator with information from the junction
 * itself, including the loading status of content and promised child
 * junctions.
 */
export interface JunctionState<J extends Junction=any> {
    /**
     * The path template that this junction has been assigned by its parent.
     */
    pathTemplate: string,

    locate: LocateFn<J>;

    children: JunctionState;
    
    hiddenChildren: { [Id in keyof J['hiddenChildren']]: JunctionState };

    meta?: any,
    
    content?: any,

    /**
     * If the router is currently waiting for the content promise to
     * resolve, this will be 'busy'.
     */
    contentStatus: Status,

    /**
     * If the router is currently waiting for a promise on the junction to
     * resolve, this will be `busy`.
     * 
     * If the router could not resolve a promise on the junction, this will
     * be `error` (until the user navigates again).
     */
    childrenStatus: Status,
    hiddenChildrenStatus: { [Id in keyof J['hiddenChildren']]: Status };
}


interface GetterOptions<
    Context,
    Children extends JunctionChildren,
    HiddenChildren extends JunctionHiddenChildren
> {
    context: Context,

    params: { [name: string]: any },

    locate: LocateFn<Junction<any, any, Children, HiddenChildren>>,

    junction: JunctionFn,
}


type Status = 'ready' | 'busy' | 'error'
