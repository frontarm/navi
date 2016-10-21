# Converter

## Converter Methods

### <a id='getLocation'></a>[`getLocation(routeSet | ...routes)`](#getLocation)

Accepts an object mapping JunctionSet key to Route object, and converts it to a Location which can be used with `<Link>` components or with `history.pushState`.

#### Arguments

* `routeSet | ...routes` (*[RouteSet](RouteSet.md) | [Route[]](Route.md)]*): ...

#### Returns

(*[Location](Location.md)*) 

#### Example:

```js
const canonicalLocation = converter.getLocation(routes)
```

### <a id='getRouteSet'></a>[`getRouteSet(location)`](#getRouteSet)

Accepts a Location object (such as the current location from a history object), and converts it into a set of routes following the specification in the converter's JunctionSet

#### Arguments

* `location` (*[Location](Location.md)*): ...

#### Returns

(*[RouteSet](RouteSet.md)*) 

#### Example:

```js
const routes = converter.getRouteSet(location)
```
