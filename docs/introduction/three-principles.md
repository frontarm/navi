---
title: The Three Principles
---

**Note: The Guide is still only an outline. PRs would be greatly appreciated -- just open an issue first to make sure there is no duplication of work.**

# The Three Principles

- How do we ensure that routable components are independent and reusable? Junctions uses three principles to do so.

Don't Create State

- the browser stores the location of your application already: examples
- if your router stores state too, your components may depend on the router's state, forcing a dependency on the router itself. This limits the independence of your components.
- use code example of Location

Components Must Compose

- components should not know about their environment
- URLs contain information about environment, as they're absolute
- in this context, the only way that location can make sense is in relation to the location of the place the component is used
- results of this:
    - routes must be relative (as a component doesn't know where it will be placed)
    - two components can be mounted at the same place with similar locations; if we rely on urls, there can be conflicts. thus, we cannot rely on urls
    - code example of non-nested Route
- exception: we can assume that the 

Pass Your Own Props

what I want to say here: components are just components. they accept props and they render other components. they're not "route handlers". they don't accept funny context. flow is explicit.

- no context. no automatic rendering based on libraries. you do the rendering.
- you can pass whichever props you'd like, as props are just props
- code example of Screen receiving props
- the only exception for this should be context to provide a compatibility wrapper around the browser's state itself (e.g. the history package)
