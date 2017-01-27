---
title: <Link>
---

# `<Link to={location} [history={history}]>`

Create a special `<a>` tag which accepts a [Location](../junctions/Location.md) object, and handles clicks with `pushState` instead of standard navigation. 

This component does not interact with the browser History API directly, but instead works through a [History](https://github.com/mjackson/history#properties) object -- allowing it to be used on both the server and the client. 

To avoid passing `history` direcetly to every `<Link>` component, you can pass it through [context](https://facebook.github.io/react/docs/context.html) via the [&lt;HistoryContext&gt;](HistoryContext.md) or [&lt;Router&gt;](Router.md) components.

#### Props

* `to` (*[Location](../junctions/Location.md)*): The location to navigate to.
* `history` (*History*): A history object -- takes priority over any contextual history.
* *All other props are passed to the rendered `<a>` element.*

#### Consumable Context

* `history` (*History*): A history object.

#### Example

```js
// Props are passed to the underlying `<a>` element
<Link to={{ pathname: '/home' }} className={active ? 'active' : ''}>Home</Link>

// Suppling a `target` prop prevents `pushState` from being called
<Link to={{ pathname: '/home' }} target='_blank'>Home</Link> 

// You can pass state too!
<Link to={{ state: { data: "url won't change" } }} target='_blank'>Home</Link> 

// Using contextual history
<HistoryContext history={history}>
  <Link to={{ pathname: '/home' }}>Home</Link>
  <Link to={{ pathname: '/about' }}>About</Link>
</HistoryContext>
```
