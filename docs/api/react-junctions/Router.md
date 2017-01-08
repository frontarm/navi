---
title: <Router>
---

# `<Router>`

Converts the [Location](/docs/api/junctions/Location) objects emitted by the supplied [History](https://github.com/mjackson/history#properties) into [Route](/docs/api/junctions/Route) objects, and passes these to the supplied renderer.

The renderer is defined by the `render` prop, which should take one of these forms:

- A function which takes a `{ route, locate }` object and returns a React Element
- A Component which accepts a `route` and `locate` props
- A React Element which will have `route` and `locate` props added via [React.cloneElement](https://facebook.github.io/react/docs/react-api.html#cloneelement)

This component works be internally creating and wrapping a [Converter](/docs/api/junctions/Converter) object, and passing any received `Location` objects to its [converter.route()](/docs/api/junctions/Converter#routelocation) method. The optional `baseLocation` prop behaves the same as the `baseLocation` argument on [createConverter](/docs/api/junctions/createConverter).

Use this component to reduce boilerplate. If you find you need more control, you can always revert to managing your own `Converter` instance later on.

#### Props

* `history` (*History*): A history object
* `junction` (*[Junction](/docs/api/junctions/Junction)*): A map of possible routes
* `render` (*function | Component | ReactElement*): A handler to render your current route
* `baseLocation` *<small>optional</small>* (*[Location](/docs/api/junctions/Location)*): The parts of your URLs which must exist, but are ignored for routing purposes

#### Child Context

* `history` (*History*): A history object

This component's context is managed by an internal [&lt;HistoryContext&gt;](HistoryContext) element.

#### Example

Most of this website's live examples use a `<Router>` component to handle routing.

In particular, the [Base Location](/examples/BaseLocation) example includes a `<Router>` with `baseLocation`. View this page to see the `AppScreen` component which is used below.

```js
// By providing a `baseLocation` prop with the '/mountpoint' pathname, we
// indicate that *all* URLs must start with `/mountpoint', and thus it
// should be ignored for routing purposes.
<Router
  baseLocation={{pathname: '/mountpoint'}}
  history={history}
  junction={AppScreen.junction}
  render={({ route, locate }) => <AppScreen route={rouute} locate={locate} />}
/>

// If your handler component takes `route` and `locate` props, you can
// pass it to the `render` prop directly
<Router
  history={history}
  junction={AppScreen.junction}
  render={AppScreen}
/>

// If you'd like to pass extra props to your component, you can pass a
// React Element to `render`
<Router
  history={history}
  junction={AppScreen.junction}
  render={<AppScreen user={currentUser} />}
/>
```
