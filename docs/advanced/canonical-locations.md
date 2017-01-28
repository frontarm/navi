# Canonical Location

Not every URL which your application receives is going to be valid. Similarly, not every URL which you *produce* is going to be exactly the same as where you end up. In particular, if your junction tree has default branches or default parameters, the [Route](/docs/api/junctions/Route.md) the converter produces may not match the [Location](/docs/api/junctions/Location.md) which it received.

To get around this, Junctions uses the concept of a **Canonical Location**. This is the single `Location` which will be *produced* by any `Route` when fed to `getLocation`, as opposed to the many `Location` objects which can be fed into `getRouteSet` to produce that same `Route`.

You may want to redirect your user to the canonical location for whichever URL they enter. This can be achieved by checking the canonical location of the route set from each location emitted by a `history`:

```js
const converter = Junctions.createConverter(AppScreen.junction, baseLocation)
    
function handleLocationChange(location) {
  const route = converter.route(location)
  const canonicalLocation = route && converter.locate(route)

  if (route && !Junctions.locationsEqual(location, canonicalLocation)) {
    history.replace(canonicalLocation)
  }

  render(route)
}

handleLocationChange(history.location)
history.listen(handleLocationChange)
```


