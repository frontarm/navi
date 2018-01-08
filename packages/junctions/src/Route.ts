import { Location } from './Location'
import { Template } from './Template'
import { PageTemplate, PageMatcher } from './PageTemplate'
import { RedirectTemplate, RedirectMatcher } from './RedirectTemplate'
import { JunctionTemplate, JunctionMatcher } from './JunctionTemplate'


/**
 * A Route is composed of a list of Route Segments.
 */
export interface Route extends Array<RouteSegment> {
    0: Junction | Page | Redirect;
    [i: number]: RouteSegment;
}

export interface JunctionRoute<J extends JunctionTemplate = JunctionTemplate> extends Route {
    0: Junction<J>
}

export interface PageRoute<P extends PageTemplate = PageTemplate> extends Route {
    0: Page<P>
}

export interface RedirectRoute<R extends RedirectTemplate = RedirectTemplate> extends Route {
    0: Redirect<R>
}


/**
 * A type that covers all Segment objects.
 */
export type RouteSegment =
    Junction |
    Page |
    Redirect

/**
 * All routes extend this interface. It includes all information that can be
 * inferred from just a pattern string and a location.
 */
interface RouteSegmentBase<Type extends string> {
    type: Type,

    /**
     * Any params that have been matched.
     */
    params?: { [name: string]: any },

    /**
     * A Location object representing the part of the URL that has been
     * matched.
     */
    location: Location,

    /**
     * The part of the entire URL string that has been matched.
     */
    url: string,

    /**
     * The Template object which created this Route Segment.
     */
    template: Template,
}

/**
 * This node corresponds to a URL segment followed by a final '/', which is
 * associated with a Page route.
 */
export interface Page<P extends PageTemplate = PageTemplate> extends RouteSegmentBase<'page'> {
    title: string,
    content?: P['contentContainer']['value'],
    contentStatus?: 'ready' | 'busy' | 'error',
    contentError?: any,
    meta: P['meta'],
    component: P['component'],
}

/**
 * A Segment for a Redirect.
 * 
 * Note that redirect doesn't actually have a component, but the property has
 * been added to the type to allow us to index on `['component']` for the
 * `MountableSegment` type.
 */
export interface Redirect<R extends RedirectTemplate = RedirectTemplate> extends RouteSegmentBase<'redirect'> {
    to: Location,
    meta: R['meta'],
    component: never,
}

/**
 * This node corresponds a non-final segment of the URL that is associated
 * with a Junction route.
 */
export interface Junction<J extends JunctionTemplate = JunctionTemplate> extends RouteSegmentBase<'junction'> {
    status: 'ready' | 'busy' | 'error' | 'notfound'

    meta: J['meta'],
    component: J['component'],
    children: J['children'],

    /**
     * The pattern that was matched (with param placeholders if applicable).
     */
    activePattern?: keyof J['children'],
    
    /**
     * A Segment object that contains details on the next part of the URL.
     * 
     * It may be undefined if the user has provided an incorrect URL, or
     * if the child's template still needs to be loaded.
     */
    activeChild?: JunctionChildSegment<J>,

    /**
     * An array of all Segment objects corresponding to the remaining parts
     * of the URL.
     * 
     * It may be undefined if the user has provided an incorrect URL, or
     * if the child's template still needs to be loaded.
     */
    activeRoute: JunctionDescendentSegments<J>,
}

export type JunctionChildSegment<J extends JunctionTemplate> = 
    {
        [K in keyof J['children']]: {
            // While the route initially needed to be loaded, it might have
            // already been loaded by the time this Segment object is produced.
            AsyncObjectContainer: TemplateChildSegment<J['children'][K]['value']> | undefined,
            Template: TemplateChildSegment<J['children'][K]>
        }[J['children'][K]['type']]
    }[keyof J['children']]

/**
 * An array of all Segments for URL segments that come after this junction's
 * segment.
 */
export interface JunctionDescendentSegments<J extends JunctionTemplate> extends Array<RouteSegment> {
    0: JunctionChildSegment<J>;
    [i: number]: RouteSegment
}

/**
 * A Segment for a loaded Mountable of unknown type
 */
export type TemplateChildSegment<RC extends Template> = {
    Junction: JunctionRoute<JunctionTemplate<RC['meta'], RC['component']>>[0],
    Page: PageRoute<PageTemplate<RC['meta'], RC['component']>>[0],
    Redirect: RedirectRoute<RedirectTemplate<RC['meta']>>[0],
}[RC['templateType']]
