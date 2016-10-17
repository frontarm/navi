# API Reference

## [junctions](https://github.com/jamesknelson/react) package

Junctions is not tied to any specific view library. It works with React, Angular, and any other component-based framework. As such, the core functionality has been placed in this package, with library-specific functionality in separate packages.

This package includes a way to define your Junctions, and tools to convert between Location and Route objects.

### State types

* [Location](/docs/api/Location.md) - *Also see the [history](https://github.com/mjackson/history) package's documentation*
* [Route](/docs/api/Route.md)
* [RouteSet](/docs/api/RouteSet.md)

### Junction tree declaration functions

* [Branch({ path, params, data, children, default })](/docs/api/Branch.md)
* [Junction({ [key]: branch })](/docs/api/Junction.md)
* [JunctionSet({ [key]: junction })](/docs/api/JunctionSet.md)
* [Param({ required, default, serializer })](/docs/api/Param.md)
* [Serializer({ serialize, deserialize })](/docs/api/Serializer.md)

### Factory and utility functions

* [createConverter(junctionSet, [baseLocation])](/docs/api/createConverter.md)
* [createRoute(branch, params, routeSet | ...routes)](/docs/api/createRoute.md)
* [locationsEqual(locationA, locationB)](/docs/api/locationsEqual.md)

### Converter object

* [Converter](/docs/api/Converter.md)
  * [getLocation(routeSet | ...routes)](/docs/api/Converter#getLocation.md)
  * [getRouteSet(location)](/docs/api/Converter#getRouteSet.md)

### Importing

Available functions other than `getLocation` and `getRouteSet` are all top-level exports. State types cannot be created by themselves, but are returned from some of the top level functions.

```js
// ES6
import { JunctionSet } from 'junctions'

// ES5
var JunctionSet = require('junctions').JunctionSet

// UMD
var JunctionSet = Junctions.JunctionSet
```

## [react-junctions](https://github.com/jamesknelson/react-junctions) package

This package provides tools to use `Location` objects within a React-based application

* [Link](/docs/api/Link.md)
* [HistoryContext](/docs/api/HistoryContext.md)

To import, use one of the following

```js
// ES6
import { Link } from 'react-junctions'

// ES5
var Link = require('react-junctions').Link

// UMD
var Link = ReactJunctions.Link
```

## [react-router-junctions](https://github.com/jamesknelson/react-router-junctions) package

This package provides an interface to "mount" Junctions-based Screens within an existing react-router based application.

* [Mount](/docs/api/Mount.md)

```js
// ES6
import { Mount } from 'react-junctions'

// ES5
var Mount = require('react-junctions').Mount

// UMD
var Mount = ReactRouterJunctions.Mount
```
