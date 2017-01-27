---
title: routesMatch
---

# `routesMatch(specific, partial, requireExact=true)`

Compares two [Route](Route.md) objects.

#### Exact match mode

If `reqiureExact` is true, this function will return `true` if `partial` and `specific` are identical.

Use this when you want to know if two routes are exactly the same.

#### Partial match mode

If `requireExact` is false, this function will return `true` if the `partial` route does not contain any information which differs from that in the `specific` route.

Use this when you want to know if the active route is a child of some arbitrary route. For example, when you want to highlight menu items. 

#### Arguments

* `specific` (*[Route](Route.md)*)
* `partial` (*[Route](Route.md)*)
* `requireExact` (*bool*): If false, will also return true for partial matches

#### Returns

(*boolean*) 

#### Example

This function is used to handle the highlighting for the side menus on the [Junctions website](https://junctions.js.org).

This website uses a custom `<Link>` component which accepts the page's current `Route` via [React Context](https://facebook.github.io/react/docs/context.html). It then compares the given route with the current route to decide whether to highlight the menu item.

```js
const active =
  this.context.currentRoute &&
  routesMatch(this.context.currentRoute, route, false)
```
