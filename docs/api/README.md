# API Reference

## [junctions](https://github.com/jamesknelson/react) package

Junctions is not tied to any specific view library. Instead, its functionality has been separated into a core package (i.e. this package), and packages to integrate junctions with other libraries.

### Classes and Structures

* [Location](/docs/api/Location.md) - *Also see the [history](https://github.com/mjackson/history) package's documentation*
* [Route](/docs/api/Route.md)
  * [locate(...routes)](/docs/api/Route.md#locate)
* [Junction](/docs/api/Junction.md)
  * [createRoute(key, params, ...routes)](/docs/api/Junction.md#createRoute)
* [Converter](/docs/api/Converter.md)
  * [locate(...routes)](/docs/api/Converter.md#locate)
  * [route(location)](/docs/api/Converter.md#route)

### Functions

* [createJunction(branches)](/docs/api/createJunction.md)
* [createConverter(junction | junctions, [baseLocation])](/docs/api/createConverter.md)
* [locationsEqual(locationA, locationB)](/docs/api/locationsEqual.md)
* [routesEqual(routeA, routeB)](/docs/api/routesEqual.md)

### Importing

Functions and classes are top-level exports. State types cannot be created by themselves, but are returned from some of the top level functions.

```js
// ES6
import { createJunction } from 'junctions'

// ES5
var createJunction = require('junctions').createJunction

// UMD
var createJunction = Junctions.createJunction
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
