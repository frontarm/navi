# The Converter

A Converter is a tool which Junctions provides to convert between `Location` and `RouteSet` objects. Usage is simple:

```js
// Turn a Location into a RouteSet
converter.getRouteSet(location)

// Turn your root RouteSet into a Location
converter.getLocation(rootRouteSet)
```

To perform this magic, Junctions only needs one piece of information: your application's root junction set.

```js
const converter = createConverter(junctionSet)
```

And that's really all there is to it! Which, incidentally, is my favorite part about junctions. Grokking the concept is 90% of the work. But once you understand Junctions, Locations and Routes, the converter does the real work of converting between them for you.

Before continuing, I should mention that the converter has a couple of extra options:

- `getLocation` can also process individual routes -- as opposed to route sets
- `createConverter` can accept a *base location* -- allow you to mount your app under a subdirectory

If you'd like details on these, check the API documentation. But otherwise, you now know everything there is to know about setting your app up with Junctions. So let's move on to actually using them.
