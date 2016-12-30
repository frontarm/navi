# `createConverter(junction | junctions, [baseLocation])`

Create a [Converter](Converter.md) object with two methods to help you switch between [Route](Route.md) and [Location](Location.md) objects.

#### Arguments

* `junction | junctions` (*[Junction](Junction.md) | {[key]: Junction}*): The Junction or group of Junctions which define the Routes which the Converter should support
* `baseLocation` (*optional*) (*[Location](Location.md)*): 

#### Returns

(*[Converter](Converter.md)*) A Converter object

## Typical Usage

This function is typically used by passing a single [Junction](Junction.md), indicating that you expect `Converter#route` to return a single Route for any input Location.

#### Example

```js
// Create a Converter for a single Junction
const converter = createConverter(appJunction)
```

## Multiple Junctions

It is also possible to pass a *group* of Junctions, indicating that multiple Routes may be active simultaneously. This is useful when you have multiple navigation controls display simultaneously at the same level of hierarchy. For example, a modal and a tab bar.

To pass a group of Junctions, you should call `createConverter()` with a JavaScript object whose values are Junction objects. The keys can be chosen arbitrarily; the return of `Converter#route` will use the same keys, but the values will be [Route](Route.md) objects.

#### Example

```js
// Create a Converter for multiple Junctions
const converter = createConverter({
  main: mainJunction,
  modal: modalJunction,
})
```

## Base Location

By passing `createConverter()` a `baseLocation`, `Converter#route` will filter out parts of the [Location](Location.md) which are irrelevant to your application. This will also cause `Converter#locate` to add this information to any generated `Locations.

This option is particularly useful if your app is being served from a subdirectory, as opposed to the root of your domain.

#### Example

```js
const baseLocation = {
  pathname: '/blog/'
}
const converter = createConverter(appJunction, baseLocation)    
```
