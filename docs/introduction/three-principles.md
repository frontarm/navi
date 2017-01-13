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

## Components Must Compose

React is a wonderful tool for making parts of your code reusable, owing in large part to its component system. But perhaps *because* React makes creating new components so easy, it can also be easy to forget that there are problems that components won't solve. In particular, components still have access to a shared environment -- and they can use that environment in a way which doesn't play well with others. Or in mathy jargon, **components are not guaranteed to compose*.

The goal of Junctions is to allow you to write truly reusable components, and part of that is to be able to compose them whichever way you'd like. *But URLs are a shared resource*, and allowing components to take ownership of URLs willy-nilly can lead to chaos.

To demonstrate, consider a component which renders two child components:

- A component with tabs for the application's navigation
- A component rendering a modal with your account's settings

*IMAGE: dashboard/invoices/contacts, [account details, invoices, etc.]*

These components *should be* completely independent -- in fact, the account details component could be reused across any number of applications! But because both components have navigation controls, they need to share the same URL space. And this can cause conflicts.

In order to follow the principle that *Components Must Compose*, components which use Junctions for routing do not *need* to take ownership of any shared resources:

- Components never access data through [React Context](https://facebook.github.io/react/docs/context.html#why-not-to-use-context)
- Components don't choose their own URLs (but can still suggest them)

Of course, there is no avoiding the fact that components still need access to shared resources. **The difference with Junctions is that URLs are allocated by your application - not by your components.**

## Routes Are Just Data

***
# TODO REWRITE #

- it should be possible to write your entire application as a pure function -- data in and data out
- no context
- no reliance on special functions
***

In order to make the best design decisions, you need to understand how your application really works. But if your data needs to pass through opaque third-party components, your task becomes a lot harder.

To ensure data flow is clear, routing libraries should complete all required work *before* the data enters the application proper. Once the data enters the application, it should be structured in such a way that it flows naturally -- without the help of third party components.

By requiring that routing data is passed directly between components as `props`, your application becomes easier to reason about. But more than that, it lets you **focus on creating components which fit the task at hand -- not the API of your routing library.**

