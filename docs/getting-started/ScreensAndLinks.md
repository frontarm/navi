# Screens and Links

Assuming we have a `Route` object like the following, what should we actually do with it?

```js
{
  // We reference branch objects as proprties of their Junction declaration objects
  branch: ContactScreenMain.ContactDetails,
  data: { 
    Component: ContactDetailsScreen,
  },
  params: {
    contactId: '15',
  },
  children: {
    main: {
      branch: ContactDetailsScreenMain.PaymentList,
      data: { 
        Component: PaymentListScreen
      },
      params: { ... },
      children: { ... },
    },
  },
}
```

First, I want to stress the point that *there is no wrong answer* to this question. How you use a `Route` is completely up to you! Of course, this isn't very helpful if you're just getting started. So let's work through an example of how we'd consume a hypothetical route with a React component.

## Screens consume `RouteSet` objects

But first, let's ammend the problem. The thing is, we generally don't want to pass a single `Route` into a component. This would limit us to rendering a single child route. And while we could fix this by passing multiple Route objects via different props, this would introduce an annoying step into our design process where we need to think about prop names. So instead of passing a `Route`, let's pass a `RouteSet`. 

Where does this Route Set come from? Well, `RouteSet` objects are plain old JavaScript objects. So we could put a route set together from scratch:

```js
const routeSet = {
  main: route,
}
```

*But wait a minute*. Every `Route` object has a `RouteSet` stored on its `children` property already. And the only information from our `Route` which may be of any use to those children are the params. So let's say that our route handling components will have those as their `propTypes`.

```js
ScreenComponent.propTypes = {
  // A RouteSet object containing the location state for our child components
  routes: React.PropTypes.object.isRequired,

  // Any params which were associated with the above RouteSet
  params: React.PropTypes.object,
}
```

What would the render function look like for this component, assuming it receives the `children` from the above route set as its `routes`? Actually, it'll look basically identical to whatever rendered *this* component. That is, it'll pass the children and params of its routes into their respective components.

```jsx
render() {
  const { main } = this.props.routes

  return (
    <main.data.Component
      routes={main.children}
      params={main.params}
    />
  )
}
```

In my experience, any component which handles a route set is probably going to follow this pattern. These components are so common, in fact, that they have their own name -- Screen Components.

## Screen Components

Screens are a type of [Container Component](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.7m0cmw2xj) which are responsible for rendering one `RouteSet` and its associated params. At minimum, they'll render a single child screen based on `this.props.routes` -- just like the above example. But in general, they can do a lot more. Here are a few examples:

- Fetch data in lifecycle methods
- Render layouts which contain multiple child routes
- Render navigation components

While we're speaking about navigation, there is something should mention. Screens actually receive *three* props. In addition to `routes` and `params`, they also receive a `locate` function.

What is `locate`? It is a function which allows you to convert a Route Set (or list of routes) into a `Location`. So in a sense, it is just like `converter.getLocation`. Indeed - for the very root component, `locate` will actually *be* `converter.getLocation`.

## Links

While `locate` will return a `Location` object, `<a>` tags only understand URLs. And even if our `Location` can be represented as a URL, `<a>` tags still can't do `history.pushState`. So to deal with this, the [react-junctions](https://github.com/jamesknelson/react-junctions) package provides a `<Link>` tag, which you'd use as so:

```jsx
<Link to={ locate( someRoute ) }>James Nelson</Link>
```

## `createRoute`

While our screen components will receive the active route under `this.props.route`, any link we make is more than likely going to point to a route which is *not* active. This means that we'll need to create a new `Route` object, which is accomplished with the `createRoute` function.

```
// Comes in two delicious flavors
createRoute(branch: Branch, params: object, children: RouteSet)
createRoute(branch: Branch, params: object, ...children: Route[])
```

This might feel familiar. If it does, its because it follows the same format of React's `createElement`. Just like with React, the first argument represents the *type* of the route we're creating. The second element holds its options. And the third remaining options contain its children.

Our above `<Link>` example uses a shitty magical `someRoute` property. Let's replace it with a call to `createRoute`:

```jsx
<Link to={ locate( createRoute(ContactScreenMain.ContactDetails, { contactId: '9001' }) ) }>
  James Nelson
</Link>
```

## Floating vs Located Routes

With this, you can now define your junctions, convert a location into a route set, use that to render a Screen component, and then render a link to a new route -- *so long as that route happens to be through your application's root junction set*.

But why this limitation?

So far, we've assumed that our `locate` function is just a reference to `converter.getLocation`. But this only works with the root `RouteSet` -- the one containing the entire application's location state. And while we *could* build an application this way, it wouldn't add a much benefit over just using standard `Location` objects.

**One of the major reasons for this package's existence was to provide a way to create *real, re-usable components* which can also have *links*.**

Passing a `RouteSet` representing the application's *entire* state to each `locate` call makes this impossible. The problem is that a `Route` created with `createRoute` is basically *floating*. It doesn't have any information about where the route's *context*, so `locate` doesn't know how to create a `Location` to it.

Of course, not all route objects are created with `createRoute`. For instance, any route which is passed into a Screen Component will have a list of ancestors, terminating in a `RouteSet` returned from `converter.getRouteSet`. And given that `getRouteSet` takes a `Location`, it stands to reason that we should be able to convert updated versions of these routes -- and their children -- into a `Location`.

To do this, each `Route` object in the tree returned by `getRouteSet` actually provides one extra property - a `locate` function. And that's why these routes are called **Located Routes**. Unlike floating routes, they know where they fit within a real application. And they can use this knowledge to take a floating `RouteSet` representing its children, and give *it* a location too.

```js
// Now we can create links, even if we don't know where our component is mounted
parentRoute.locate(
  createRoute(ContactScreenMain.ContactDetails, { contactId: '9001' })
)
```

## Composable Screens

Instead of accessing `locate` directly on its route, we'd generally pass it through to a Screen Component via its props. And with this knowledge, we can unlock a full example of a Screen Component.

```jsx
const ContactsMain = Junction({
  Details: Branch({
    path: '/:contactId',
    params: {
      contactId: Param({ required: true }),
    },
    data: {
      Component: ContactDetailsScreen,
    },
    children: ContactDetailsScreen.junctionSet,
  }),
})

const ContactsModal = Junction({
  Add: Branch({}),
})

class ContactsScreen extends React.Component {
  static junctionSet =
    JunctionSet({
      main: ContactsMain,
      modal: ContactsModal,
    })

  static propTypes = {
    routes: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
    locate: React.PropTypes.func.isRequired,
  }

  render() {
    const locate = this.props.locate
    const { main, modal } = this.props.routes

    return (
      <div>
        {
          modal &&
          <div>
            Add A Contact
          </div>
        }
        <div>
          <nav>
            <Link to={ locate(main, createRoute(ContactsModal.Add)) }>Add</Link>
          </nav>
          <ul>
            <li>
              <Link to={ locate(createRoute(ContactsMain.Details, { id: 'abcdef' })) }>James Nelson</Link>
            </li>
          </ul>
        </div>
        {
          main.data.Component &&
          <main.data.Component
            locate={main.locate}
            routes={main.children}
            params={main.params}
          />
        }
      </div>
    )
  }
}
```

## Next steps

Now that you know about Routes, Locations, Junctions and Screens, you know everything there is to know about Junctions. Congratulations!

Let's put this all together into a simple example application which includes the above screen, as well a `history` and the entry point to stitch it all together.
