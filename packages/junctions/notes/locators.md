Context should never be used within the content itself. It should only
be used to preload junction data for content/child junctions, or to
get locations for redirects.

This is not a problem for locations, as they're always objects of the
same shape that can't really use context. However, it could be a problem itself
users used context directly within a content function, or directly within a
child junction.


instead of "locate" functions, why don't we just add raw location objects to
the context? this prevents the problem where the same function can close over
something which changes value.

then instead of "locator" functions, I'd just need a "concatLocations" function
(or similar)

this limits context to just a way of passing around information about the
environment's available locations, which is what it is there for.

this leaves the problem as: what to do when contextual locations change?
e.g. in a list of users, what to do when the admin selects another user,
so the "userId" changes, and thus the "userRoot" contextual location changes?

given context is only necessary in the first place to allow preloaders to
work, and it doesn't make sense to use preloaders with params (as we'd need
to cycle over all possible params), we can just not provide access to params
in `getChildContext`, and not allow child context in junction with params.

this actually means we an provide contextualLocations to the `route` object,
making them more useful.

problem solvered.



// the contentgetter needs to request anything other junctions/locators that
// are needed to load the page before the promise resolves
 
// this makes sense, as if they're promised values, you want them to resolve
// before the component is created, unless you actually want to handle the
// promises within the component, in which case they don't need to be
// preloaded anyway.

/**
 * Sitepack walks through every node in the tree, recording the chunks that
 * need to be loaded for each node by recording all calls to `locate` or
 * `get` that happen while executing a content getter or junction getter.
 * 
 * As this all happens outside of react, we don't have access to environment
 * props. As such, we need our own way to access methods outside the junction.
 * 
 * I propose that a `context` object be available, which junctions can update
 * for themselves and child junctions. This can have parameters and locators
 * added to it. Additionally, `getRoute(location)` and `getJunction(location)`
 * methods are available on it. This context object is available to
 * content getters and redirection getters, and junction getters, allowing
 * for redirections, pagination, link generation, etc.
 */


/**
 * DESIGN PROBLEMS:
 * 
 * - context can't update without needing to re-execute getters, and thus
 *   recreate components
 * - because params are in the context (or implied if we don't explicity
 *   pass them in), changes in params will at minimum require a re-execution
 *   of context locators -- even though there won't necessarily be a react
 *   update
 *   * this could be partly helped by overriding the context's functions
 *     each time params change. This way, the functions change, indicating
 *     to PureComponents that a re-render is required.
 * - I'm not sure how sitepack is supposed to know the ids of the chunks
 *   that correspond to each content/junction getter, even if it knows that
 *   a specific content/junction getter is required... this will probably
 *   require some plugin for Webpack, which sounds pretty fucking annoying.
 */
