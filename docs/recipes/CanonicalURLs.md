# Canonical Location

Not every URL which your application receives is going to be valid. Similarly, not every URL which you *produce* is going to be exactly the same as where you end up. In particular, if your junction tree has default branches or default parameters, the `RouteSet` the converter produces may not match the `Location` which it received.

To get around this, Junctions uses the concept of a **Canonical Location**. This is the single `Location` which will be *produced* by any `RouteSet` when fed to `getLocation`, as opposed to the many `Location` objects which can be fed into `getRouteSet` to produce that same `RouteSet`.

You may want to redirect your user to the canonical location for whichever URL they enter. This can be achieved by checking the canonical location of the route set from each location emitted by a `history`:

```jsx
const converter = Junctions.createConverter(AppScreen.junctionSet, baseLocation)
    
function handleLocationChange(location) {
  const routes = converter.getRouteSet(location)
  const canonicalLocation = converter.getLocation(routes)

  if (!Junctions.locationsEqual(location, canonicalLocation)) {
    history.replace(canonicalLocation)
  }

  render(routes)
}

handleLocationChange(history.location)
history.listen(handleLocationChange)
```
