---
title: Route
---

# Route

Routes are objects which represent a single state of a [Junction](Junction.md). To learn more about what Routes are and how they're used, read [What You Get From Junctions](/docs/introduction/what-you-get-from-junctions.md) and [Routes](/docs/basics/routes.md) in the Junctions Guide.

Route objects are most commonly used as props of your components. By checking a [Screen Component](/docs/basics/the-screen-pattern.md)'s `route` prop, you can decide what content that screen should render.

Routes are also used as a way of referring to arbitrary locations within your application. They can be used in combination with a `Converter` or `LocatedRoute` object's [locate()](#locateroutes) method to produce [Location](Location.md) objects used for navigating.

## Route vs. LocatedRoute

There are two types of `Route` objects. 

- Standard routes are created by calling a `Junction` object's [createRoute()](Junction.md#createroutekey-params-next) method.
- `LocatedRoute` objects are returned by calling a `Converter` object's [route()](Converter.md#routelocation) method. 

The difference is that `LocatedRoute` objects have a [locate()](#locateroutes) method, which acts like the [similarly named](Converter.md#locateroutes) method on `Converter` but produces a [Location](Location.md) which is *relative* to that `LocatedRoute`.

## Properties

-   `key` (*string*)

    They key of the [Branch](Junction.md) whose format this route follows

-   `params` (*object*)

    The values of any params which this route holds

-   `data` (*object*)

    The value of the `data` property defined on the associated branch in [createJunction](createJunction.md), if any

-   `next` (*[Route](Route.md) | { [key]: [Route](Route.md) }*)

    The `Route` object or objects which specify the state of any `next` junctions on the associated branch

#### Example

`Route` objects are instances of an internal `Route` or `LocatedRoute` class, so they may not be represented by plain old JavaScript objects. With this in mind, here is an example of the *shape* which a `Route` object may take.

```js
{
  key: 'Invoices',
  data: {
    Component: InvoicesScreen,
  },
  params: {
    id: '15',
  },
  next: {
    main: {
      key: 'Payments',
      data: {
        Component: InvoicePaymentsScreen,
      },
      params: {
        order: 'date',
        where: { paid: false },
      },
    },

    modal: {
      key: 'AddPayment',
      data: {
        Component: AddPaymentScreen,
      },
    },
  },
}
```

## Methods

### locate(...routes)

*This method is only available on `LocatedRoute` objects -- i.e. those created by `converter.route()`. It is not available on routes created by `junction.createRoute()`.*

Create a new [Location](Location.md) from the Location of this [Route](Route.md), but with `next` routes replaced by the arguments (or removed entirely in the case of no arguments).

#### Arguments

-   `...routes` (*[Route](Route.md)*)

    Up to one `Route` for each `Junction` specified on the associated branch's `next` Junction

#### Returns

(*[Location](Location.md)*) A `Location` which includes this Route's `Location`, and extends it to also correspond to the passed in `Route` objects

#### Example

The `locate` method of a `LocatedRoute` is often passed to child components along with the route's `next` route. This allows child components to create `Location` objects linking within the component -- without knowing where in the application the component is mounted. For more details, read [The Screen Pattern](/docs/basics/the-screen-pattern.md) in the Junctions Guide.
