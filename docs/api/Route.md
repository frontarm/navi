# Route

An object which holds information about the state of a single [Junction](Junction.md), including its child junctions.

TODO:
- It is named after its visual representation -- a route through a set of Junctions.

## Nesting Routes

TODO:
- Routes can be nested

#### Example

```js
{
  branch: Contacts,
  data: { ... },
  params: {
    id: '15',
  },
  children: {
    main: {
      branch: PaymentList,
      data: { ... },
      params: {
        order: 'date',
        where: { paid: false },
      },
    },

    modal: {
      branch: AddContactModal,
      data: { ... },
    },
  },
}
```

## Properties
- `branch` (*[Branch](Junction.md#branch)*): ...
- `params` (*object*): ...
- `children`: (*[Route](Route.md) | {[key]: Route}*): ...
- `data` (*object*): ...

## Methods

### <a id='locate'></a>[`locate(...routes)`](#locate)

*This method is only available on Routes created by `Converter#route()`. It is not available on routes created by `Junction#createRoute`.*

Create a new [Location](Location.md) from the Location of this [Route](Route.md), but with child routes replaced by the arguments (or removed entirely in the case of no arguments).

#### Arguments

* `...routes` (*[Route](Route.md)*): Up to one Route for each of this Route Type's child Junctions.

#### Returns

(*[Location](Location.md)*) A Location which is equivalent to the passed-in Routes

#### Differences with `Converter#locate`

This method is similar to [Converter#locate](Converter.md#locate). The main difference is that the base location of `Converter#locate` is specified when you create the `Converter` instance, while the base location of `Route#locate` is the location of the `Route` itself.

#### Example:
