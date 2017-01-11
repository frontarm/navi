---
title: The Three Principles
---

# The Three Principles

The Junctions routing library was designed to let you write *truly* reusable components. To achieve this, it follows three principles.

## Don't Create State

All the state which is needed to perform routing is available via the standard JavaScript APIs. Namely:

```js
// Stores all the information in your browser's address bar
window.location

// A JavaScript object which can be updated with
// `History.pushState`, allowing arbitrary data to be stored
History.state
```

Given that the state you need is already available, **creating and storing any new state is superfluous, at best**. At worst, any new state which the router provides to your application can introduce a dependency on the router itself.

## Pass Routes Directly

In order to make the best design decisions, you need to understand how your application really works. But if your data passes through opaque third-party components, your task becomes a lot harder.

To ensure data flow is clear, routing libraries should complete all required work *before* the data enters the application proper. Once the data enters the application, it should be structured in such a way that it flows naturally -- without the help of third party components.

By requiring that routing data is passed directly between components as `props`, your application becomes easier to reason about. But more than that, it lets you **focus on creating components which fit the task at hand -- not the API of your routing library.**

## Assume Nothing

In order for a component to be reusable, it *cannot* make any assumptions about its environment. In practice, these assumptions come in two forms:

### Context

React allows any ancestor of a component to add data to that component's `context`. And while this would be OK if you could guarantee that you have control over *every* ancestor, the reality is that you usually don't. **Usage of context constitutes an assumption that no ancestor uses `shouldComponentUpdate()`, nor any third party library which you do not control.**

Given that Facebook [recommends against](https://facebook.github.io/react/docs/context.html#why-not-to-use-context) using context *anyway*, this isn't a huge loss. But it is worth noting, because Junctions is unique in not requiring the use of context.

### URL strings

While adding a URL like `/invoices/${id}` to your component may seem innocent, this simple act actually involves one of two assumptions about your component's environment. In the case of a relative URL, you're assuming that your component will never be used in another location. And in the case of an absolute URL, you're assuming that your *entire application* will never be used in another location. Either way, you've made reuse difficult.

Additionally, URL strings which point *within* a component have another issue; they assume that the component's environment allows for the URL to *change*. In some cases -- like when they component is rendered within a modal -- URLs are effectively constant.

But does this mean you shouldn't reference other parts of the application? Not at all! You just need to make sure to **represent Locations in a way that does not depend on the component's environment**. And to do so, Junctions uses a structure called a [Route](locations-routes-and-maps).


