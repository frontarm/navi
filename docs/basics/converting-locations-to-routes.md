**Note: The Guide is still only an outline. [Pull Requests](https://github.com/jamesknelson/junctions) would be greatly appreciated!**

# Converting Locations to Routes

- Junctions is -- at its core -- a package for converting between 'Location' and 'Route' objects. So how do you actually accomplish this?

- Once the pieces are in place, the process is actually incredibly simple. Assuming you have a root `Junction`, all you need to do is create a `Converter` object and do a conversion:

```js
const converter = createConverter(rootJunction)
const rootRoute = converter.route(location)
```

- In fact, we *could* make this even simpler by creating a `getRoute` function which accepts both the location and Junction.
- The only reason we split them into two is performance
- Any conversion needs to do some up-front work on the supplied Junction object. Creating a persistent `Converter` object lets Junctions save the result of this work for later, improving performance.
- But what about a real application?
- Usage in an actual application is -- surprisingly -- almost identical. But there are a few differences you may encounter

## Base Locations

- If your application doesn't know where it is mounted, it might not work
- Junctions assumes that the entire Location, right from the start, needs to be converted into routes.
**TODO: example**
- So if your Location has some irrelevant information, it needs to be stripped.
- You can tell the Converter to do so by supplying a base Location
**TODO: example**

## Canonical Locations

- If any of your applications junctions specify default parameters, then the converter will add these where necessary.
- This means that the Route which the converter returns may differ from the Location which you passed to it
**TODO: example**
- This may not be a problem for you. But if it is, you can also use the converter to generate a *new*, *canonical* location for your route
**TODO: example**
- If your original location didn't specify some parameters with defaults, your new one will. By navigating to it, you can ensure that the user only ever sees one URL for a given route.

## Example: Use with History

- Here's an example which uses the history package, along with everything we've learned so far, to output the current root route to the screen and navigate to the canonical location

**TODO: example**


