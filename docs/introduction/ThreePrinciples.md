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

---

# The Three Principles

## Don't store state

**Location state is aleady stored in the browser. It doesn't need to be stored again.** 

In the React and Redux world, this is often phrased as having a "single source of truth".

The browser already stores your current location -- both as a URL, and as HTML5 History. It already has APIs for reading and updating it. And even if the APIs differ between browsers, the excellent [history] library provides a unified interface.

In the server side world, Routers need to manage your location. In the client side world, Junctions can leave it to the browser.

## URLs should not map directly to components

**URLs are optional in client side apps. They should be optional for your components, too.** 

In a server side application, *every request has a URL*. As such, it makes sense to use the URL as a switch between available outputs.

In a client side application, a URL is just a UX optimization. In fact, HTML5 History can store additional information which is linked with the Back/Forward buttons, but is hidden from the user-facing URL. And importantly, HTML5 History means that *you're no longer limited to having one route active at once*. Which makes dealing with modals a whole lot easier.

Junctions does not assume that your URLs correspond to component hierarchy. Instead, it maps your entire [Location](#location) to a set of plain old JavaScript objects. It is then up to your components to render their current location in whichever way works best -- whether that is by delegating to a child component, displaying a modal, or even ignoring the information completely.

## Routing should not prevent reusability

**Components cannot refer to external locations without receiving those locations as parameters.** 

The biggest win of any modern JavaScript framework is the ability to create re-usable components. And one of the biggest losses of a traditional router is how they complicate this.

One of the goals of Junctions is to allow components which can be re-used across applications. This has a number of implications:

- There can be no reliance on [Context](https://facebook.github.io/react/docs/context.html), [prototypical inheritance](https://docs.angularjs.org/guide/scope#scope-hierarchies), or framework-specific features.
- References to locations must be relative, not absolute
- Links can only be made to parents without receiving information on how to do so

So now you know what Junctions don't do. But you're probably more interested in what they *do* do.
