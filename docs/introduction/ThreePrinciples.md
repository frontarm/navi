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
