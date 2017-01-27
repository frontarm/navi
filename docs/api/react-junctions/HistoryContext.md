---
title: <HistoryContext>
---

# `<HistoryContext history={history}>`

*Note: The [&lt;Router&gt;](Router.md) component has a `<HistoryContext>` built in. You *do not need* to use both `<Router>` and `<HistoryContext>`!*

Adds a `history` entry to the [context](https://facebook.github.io/react/docs/context.html) of any child components.

Use this to avoid the need to directly pass a [History](https://github.com/mjackson/history#properties) object to each [&lt;Link&gt;](Link.md) element.

#### Props

* `history` (*History*): A history object.

#### Child Context

* `history` (*History*): A history object.

#### Example

```js
// With HistoryContext
<HistoryContext history={history}>
  <Link to={{ pathname: '/home' }}>Home</Link>
  <Link to={{ pathname: '/about' }}>About</Link>
</HistoryContext>

// Without HistoryContext
<Link history={history} to={{ pathname: '/home' }}>Home</Link>
<Link history={history} to={{ pathname: '/about' }}>About</Link>
```
