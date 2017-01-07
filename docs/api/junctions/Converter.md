---
title: Converter
---

# Converter

An object containing methods to convert between [Location](Location) and [Route](Route) objects.

Converters must be created with the [createConverter](createConverter) factory function, which accepts one or many [Junction](Junction) objects. These junctions define the format of the Locations and Routes which the Converter will work with.

You'll generally only need one Converter per application, which will be in charge of turning the Location objects received from navigation events into Route objects which your application understands.

## Converter Methods

### locate(...routes)

Convert [Routes](Route) to a [Location](Location).

This method is primarily used to create navigation controls and events, as [history](https://github.com/mjackson/history) can deal with [Location](Location) objects, but does not know how to deal with [Route](Route) objects. To navigate, pass the Location returned by `locate` to a [<Link>](Link) component or `history.push()`.

The other major use of this method is for implementing the [Canonical URL](/docs/advanced/canonical-locations) pattern. Because this function will only ever return one URL for a given set of Routes, you can use it to force your browser to always use the same URL for any equivalent route. For more details, see the example below.

#### Arguments

* `...routes` (*[Route](Route)*): Up to one Route for each Junction which the Converter was configured with.

#### Returns

(*[Location](Location)*) A Location which is equivalent to the passed-in Routes

### route(location)

Convert a [Location](Location) to a [Route](Route), or group of Routes, depending on the junctions that the Converter was configured with.

This method is primarily used to handle browser navigation events. By using this method, we can convert the [Location](Location) objects which the browser emits into [Route](Route) objects which are more suitable to use within an application.

The return format for this function mirrors the format of the Junctions which the converter was configured with. This means that if `createConverter` received a single Junction object, the result will be a single Route object. Conversely, if `createConverter` was called with an object mapping keys to Junctions, the result of `route` will be an object mapping keys to Routes.

For example, if the converter is configured like this:

```js
const converter = createConverter({
  main: mainJunction,
  modal: modalJunction,
})

const routes = converter.route(someLocation)
```

The resulting `routes` object will have the keys `main` and `modal`. The values of these keys can either be a [Route](Route) object, or `null`.

#### Arguments

* `location` (*[Location](Location)*): A Location based on the format outlined in the Converter's Junctions.

#### Returns

(*[Route](Route) | {[junctionKey]: Route}*): A Route for each Junction which the Converter was configured with.

## Converter Examples

### Rendering with Canonical Location

```js
// Create a Converter object which can convert between Locations and Routes
// matching the format of the specified Junction
const converter = createConverter(rootJunction)

function handleLocationChange(location) {
  // Convert each new Location into a Route which can be passed into the
  // application itself.
  const route = converter.route(location)

  // Convert the route back into a location. In the case the route has default
  // parameters which were not specified in the original location, this
  // location may differ from the original.
  const canonicalLocation = converter.locate(route)

  // In the case that the two locations differ, change the browser location
  // to the canonical location.
  if (!locationsEqual(location, canonicalLocation)) {
    history.replace(canonicalLocation)
  }

  // Render the app
  ...
}

handleLocationChange(history.location)
history.listen(handleLocationChange)
```
