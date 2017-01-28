# About The API

Junctions was designed to work great with React -- without being tied to it. To facilitate this, its functionality has been separated into a core package and packages to integrate junctions with other libraries.

## Core package

The core package is called [junctions](https://github.com/jamesknelson/react). It contains the important parts. In particular:

- [createJunction](./junctions/createJunction.md), used to define new [Junction](./junctions/Junction.md) objects
- [createConverter](./junctions/createConverter.md), used to create your application-wide [Converter](./junctions/Converter.md) object
- [routesMatch](./junctions/routesMatch.md), used to check if two [Route](./junctions/Route.md) objects are equivalent
- [locationsEqual](./junctions/locationsEqual.md), used to check if two [Location](./junctions/Location.md) objects are exactly equal

## Integration packages

Additional packages are available to ease integration with other tools and libraries:

- [react-junctions](https://github.com/jamesknelson/react-junctions) provides components for React
- [react-router-junctions](https://github.com/jamesknelson/react-router-junctions) allows you to mount a Junctions-based Component in a react-router app

## Importing

Functions and classes are top-level exports. State types cannot be created by themselves, but are returned from some of the top level functions.

```js
// ES6
import { createJunction } from 'junctions'

// ES5
var createJunction = require('junctions').createJunction

// UMD
var createJunction = Junctions.createJunction
```

