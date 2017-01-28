---
title: Converter
---

# Converter

Contains methods to convert between [Location](Location.md) and [Route](Route.md) objects. `Converter` objects are returned by the [createConverter](createConverter.md) function. 

You generally need exactly one `Converter` per application. This object will be in charge of turning the `Location` objects received from navigation events into `Route` objects.

## Methods

### locate(...routes)

Convert `Route` objects to a `Location` object.

Use this method when you have a `Route` which you'd like to navigate, but you need a `Location` to actually perform this navigation. For example, this may occur when you want to call [history.push()](https://github.com/mjackson/history#navigation), or when you want to pass a route to a [&lt;Link&gt;](/docs/api/react-junctions/Link.md).

#### Arguments

* `...routes` (*[Route](Route.md)*): One or many routes corresponding to the [Junction](Junction.md) objects which `createConverter` was configured with.

#### Returns

(*[Location](Location.md)*) A Location which is equivalent to the passed in Routes.

#### Example

```js
const converter = createConverter(junction)

class Application extends Component {
  render() {
    return (
      <nav>
        <Link to={converter.locate(junction.createRoute('home'))}>Home</Link>
        <Link to={converter.locate(junction.createRoute('about'))}>About</Link>
      </nav>
    )
  }
}
```

### route(location)

Convert a `Location` object to `Route` objects.

Used this method to handle browser navigation events which produce `Location` objects, such as [history.listen()](https://github.com/mjackson/history#listening).

#### Arguments

* `location` (*[Location](Location.md)*): A Location object.

#### Returns

(*[Route](Route.md) | { [junctionKey]: Route | null } | undefined | null*).

The return format depends on the format of the Junction objects which the `createConverter` was configured with.

- If `createConverter` was passed a single `Junction` object, the return will be a single `Route`.
- If `createConverter` was passed an object mapping keys to `Junction` objects, the return will be an object mapping those same keys to `Route` objects

Additionally, there are two special cases:

- `null` indicates that the received `Location` does not contain any routing information. For example, the URL `/`.
- `undefined` indicates that a `Location` with unexpected information was received -- i.e. 404.

#### Examples

##### Given a `Converter` with Parallel Junctions

Assuming the argument location is known, `converter.route()` will return an object specifying the routes for each Junction.

```js
const converter = createConverter({
  main: mainJunction,
  modal: modalJunction,
})

// returns {
//   main: Route | null,
//   modal: Route | null,
// }
const routes = converter.route(someLocation)
```

##### Given a `Converter` with a single Junction

Assuming the argument location is known, `converter.route()` will return a single Route.

```js
const converter = createConverter(mainJunction)

// returns Route or null
const routes = converter.route(someLocation)
```
