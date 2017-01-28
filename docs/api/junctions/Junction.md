---
title: Junction
---

# Junction

Junctions are objects which represents a number of possible *choices* -- for example, the choices on a tab bar, a navigation menu, or the choice between whether a modal is displayed or not.

Within a `Junction` object, each *possibility* is represented by a *Branch* object. And within your application, a single *state* of a `Junction` is represent by a [Route](Route.md) object.

To create a `Junction`, use the [createJunction](createJunction.md) function. Once you have a Junction, use its [createRoute()](#createroutekey-params-next) method to create [Route](Route.md) objects which represent states of that Junction.

To learn more about what Junctions are and how they're used, read [What You Get From Junctions](/docs/introduction/what-you-get-from-junctions.md) and [Junctions](/docs/basics/junctions.md) in the Junctions Guide.

### Component Junctions

By adding a Junction to a Component, you're indicating that the Component expects to receive a single `route` prop, whose value must be a `Route` object following one of the formats defined by the Junctions's branches.

```js
// Create a Junction which can hold one of three Route Types
const junction = createJunction({
  Dashboard: { default: true },
  Invoices: {},
  Help: {},
})

class ApplicationScreen extends React.Component {
  // By adding `junction`, you're specifying that this component should
  // receive a `Route` object on its `route` property with one of the
  // keys defined above.
  static junction = junction

  // ...
}
```

*See a similar in use at the [Raw](/examples/Raw.example.js) live example!*

### Composing Junctions

The main purpose of a Junction is to represent the possible navigation states of a single Component. But what if that Component is composed of *other* components, each of which has its own navigation states?

As an example, imagine that the Component in the above example renders a `<HelpScreen>` component when the `Help` branch is selected. But then say that this `<HelpScreen>` component itself can take one of two possible states
In order to represent the possible navigation states within a single component.

```js
class HelpScreen extends React.Component {
  static junction = createJunction({
    DashboardHelp: { default: true },
    InvoicesHelp: {},
  })
}
```

Because the `<ApplicationScreen>` component composes the `<HelpScreen>`, the possible states of `<HelpScreen>` are *also* possible states of `<ApplicationScreen>` -- but *only* when `<ApplicationState>` is rendering a `Help` route.

In order to represent this, each Branch within a `Junction` can also define its own `next` junction -- representing the next choice which needs to be made if that branch is selected.

```js
const junction = createJunction({
  Dashboard: { default: true },
  Invoices: {},
  Help: {
    // Indicates that if this branch is selected, a selection from
    // the help screen's junction will also need to be made
    next: HelpScreen.junction,
  },
})
```

The end result of this is that each `Junction` is effectively a [Decision tree](https://en.wikipedia.org/wiki/Decision_tree). The branches at each node represent the possible things that one single component can render.

### Parallel Junctions

A single `Junction` only allows you to represent a single choice. But what if your component needs to be able to represent *multiple* choices -- for example, the choice between which tab to render, and the choice between which modal to render?

In order to facilitate this, each Branch can be assigned *multiple* `next` junctions. To do so, instead of passing a single `Junction` object to `next`, pass an object containing `Junction` objects. This will cause the `next` property of associated `Route` objects to use an object with the same shape.

*Note: When providing an object of parallel junctions, only the state of the junction with the key `main` will be added to the path of `Location` objects. The state of any other junctions will be added to the Location `state`.*

```js
const invoiceMainJunction = createJunction({
  Details: { default: true },
  Payments: {},
})

const invoiceModalJunction = createJunction({
  AddPayment: {},
})

const invoicesJunction = createJunction({
  List: { default: true },
  Invoice: {
    paramTypes: {
      id: { required: true },
    },
    next: {
      main: invoiceMainJunction,
      modal: invoiceModalJunction,
    }
  },
})

class InvoicesScreen extends React.Component {
  static junction = invoicesJunction

  render() {
    const route = this.props.route

    if (route.key == 'Invoice') {
      // When rendering an `Invoice` route, it will have *two* next routes.
      console.log(route.next.main.key)
      console.log(route.next.modal.key)
    }
  }
}
```

## Methods

### createRoute(key, params, ...next)

Create a `Route` object representing one state of this Junction.

Use this method when you need an arbitrary `Route` object. For example, when you'd like to link to a specific route within your current component, or when you'd like to programatically navigate to a specific route.

#### Arguments

* `key` (*string*): The key of the branch which this `Route` will follow
* `params` *<small>optional</small>* (*object*): An object containing values of the created route's `params`
* `...next` *<small>optional</small>* (*[Route](Route.md)]*): `Route` objects representing the state of the branch's `next` junctions

*If you're familiar with [React.createElement()](https://facebook.github.io/react/docs/react-api.html#createelement), note that `createRoute()` uses exactly the same format. Theoretically, you could even create routes with JSX.*

#### Returns

(*[Route](Route.md)*)

#### Example

This example puts together all of the different forms of Junction, to create a single route linking deep into an application.

Note that this is rather contrived. A more realistic example would have these junctions defined over multiple files, with routes mostly being created only a single level deep.

```jsx
const invoiceMainJunction = createJunction({
  Details: { default: true },
  Payments: {},
})

const invoiceModalJunction = createJunction({
  AddPayment: {},
})

const invoicesJunction = createJunction({
  Add: {},
  Invoice: {
    path: '/:id',
    paramTypes: {
      id: { required: true },
    },
    next: {
      main: invoiceMainJunction,
      modal: invoiceModalJunction,
    }
  },
})

const appJunction = createJunction({
  Dashboard: { default: true },
  Invoices: {
    next: invoicesJunction,
  },
})

const converter = createConverter(appJunction)

const route =
  appJunction.createRoute('Invoices', {},
    invoicesJunction.createRoute('Invoice', { id: '123' },
      invoiceMainJunction.createRoute('Details'),
      invoiceModalJunction.createRoute('AddPayment')
    )
  )

history.push(converter.locate(route))
```
