# The Basics

This package uses five major concepts:

1.  [**Junction**](#junction)

    A way to specify the **Branches** (or Route Types) which a component knows how to render.

2.  [**Route**](#route)

    An object representing the *current* state of one Junction.

3.  [**Junction Set**](#junction-set)

    The group of junctions associated with one component. Assigning multiple junctions to a component allows a component to have multiple active routes simultaneously.

4.  [**Location**](#location)

    An object usde by the [history](https://github.com/mjackson/history) package which contains one state of your browser history, including both URL and HTML5 History state.

5.  [**Converter**](#converter)

    Methods for converting between your application Location, and application Routes.

For Junctions, Routes and Junction Sets, you may find it easier to visualize them than read the above descriptions. Here's an example of the Junction Diagram for a simple application with a dashboard and contact list:

*TODO: diagram*

Let's go into a little more detail on each of these basic concepts.

## Junction

Junctions are pretty important. So important -- in fact -- that this package was named after them! But what actually are they?

Junctions represent places in your application where control can flow through **one** of many Branches, and where this decision depends on your application's current location. You can think of a Junction as a declaration that "there will be a switch somewhere in the application which expects a value following one of these patterns". That's why they're represented as a switch in a Junction Diagram:

*TODO: junction switch symbol*

Junctions are defined with the `Junction` function, and take two parameters: A list of Branches, and an optional *default* branch.

```js
const appContent = Junction({
  dashboard: Branch({ ... }),
  contacts: Branch({ ... }),
},

// This junction will default to the `dashboard` branch if no branch is specified in the location
'dashboard')
```

But what is a Branch? It defines one *type* of Route which flow can take through that Junction. You might like to think of it as a "Route Type". Or if you're used to react-router, you can think of a Branch like a `<Route>` declaration, as opposed to the routes which are actually passed into your component.

Branches take a few more options than Junctions. Here's a Branch with the kitchen sink:

```js
Branch({
  // Pathname is optional. If not given, it'll be automatically generated
  // based on its key in your `Junction` declaration, and its required
  // params.
  path: '/contacts',

  // Arbitrary data you want to have access to if this branch is active
  data: {
    title: 'Contacts',
    component: ContactsScreen,
  },

  // Params are pulled from the URL path/query string or HTML History
  params: {
    page: Param({
      required: true,
      default: 1,
      serializer: Serializer({
        serialize: x => String(x),
        deserialize: x => x === '' ? null : parseInt(x)
      }),
    })
  },

  // Child junctions can only be active if this branch is active
  children: ContactsScreen.junctionSet,
})
```

Just like Routes in other frameworks, branches can have params which are plucked from the URL. Of course, with Junctions, they can be stored with HTML5 History too. See the [Params](#param-default-required-serializer-) API documentation for more details.

Unlike the Routes you might be used to, a Branch does not have to correspond to a specific component. Instead, a Branch can have a `data` object whose value will be available in the corresponding `Route` object. You can include the component you'd like to render here to get behavior close to a standard router.

Note how the children are specified separately to the component. This ensures that your application can have a location tree which doesn't need components at each of its junctions. Importantly, it also ensures that junctions is not tied to any single view library. But if you'd prefer not to repeat yourself, the configuration object is plain old JavaScript -- so there's nothing stopping you from writing a helper which sets data and children for you!

---

The analogue of junctions in a traditional routing system would be the `children` of a route. So why are Junctions **not** represented as children? Because unlike a traditional routing system, one Branch (or a Route through it) can have *multiple* child Junctions, and multiple active child routes. Instead of a branch's children being a `Junction` object, it is a `JunctionSet`

## Junction Set

Junction sets are the objects most likely to correspond to a specific component within an application. Why? Because a Component may have multiple Junctions!

But this is probably best understood with an example. Here's a typical `JunctionSet`:

```js
const contactsContent =
  Junction({
    list: Branch({ ... }),
    edit: Branch({ ... }),
  },
  'list')

const contactsModal = 
  Junction({
    add: Branch({ ... }),
  })

ContactsScreen.junctionSet = 
  // Each of a JunctionSet's Junctions can have one active Branch simultaneously
  JunctionSet({
    content: contactsContent,
    modal: contactsModal,
  },

  // Only one junction's state can be stored in the URL. The rest are stored in HTML5 History
  'content')
```

This JunctionSet models a Master-Detail view, with an "Add" modal whose state is stored independently to the state of the Master-Detail view.

By modelling the modal state as a separate junction, you avoid the issue of "do I need two modal URLs to correspond to the two content URLs?" In fact, you don't need any URL. And because the state is stored with HTML5 History, the Back/Forward buttons just work.

From the above example, you can see how you might think of a `JunctionSet` as a "splitter". At allows the control flow of your application to continue down two paths instead of just one. This is why a `JunctionSet` is represented as a splitter in a Junction Diagram -- with the double line representing the Junction which corresponds to URL state:

*TODO: junction set symbol*

Now that you know about `JunctionSet` and `Junction`, you know everything there is to know about declaring your application's structure. But how do you actually *use* this information? For that, you'll need to learn about Routes.

## Route

Where a `Branch` object declares that your app "can" be in a state, a `Route` object represents "being" in that state.

One way you can think of this is that a Branch represents a "Route Type". But if you prefer to think with pictures, a Route represents which Branches control currently flows through in your Junction tree:

*TODO: route flow diagram*

While Junctions must be declared by you, Routes can come into exist in two ways. And actually, the type of route you get will differ based on how it comes into existence.

The first (and simplest) way a route can come into existence is that you create it. To do so, you use Branch factories -- functions on your `Junction` objects corresponding to each of their possible branches. Here's an example using the contacts branch we defined earlier:

```js
const route = appContent.contacts({
  params: { page: 5 },
  children: {
    content: contactsContent.list()
    modal: null,
  },
})
```

The returned `Route` object will then mirror exactly what you passed in, except it'll have a `branch` key too:

```js
route.branch == appContent.contacts // true
```

But here's the thing about these Route objects: while they do a perfectly good job of representing a location within one specific *Junction*, they don't have enough information to represent a location with your *application*. If you need to convince yourself of this, try to figure out how you'd generate a URL for a Route created this way -- you'd need to know the URL of the parent Junction too! And since the Route was created from a global object, it can't know this.

The only way to get a Route which knows where it is on an *application* level is to created a tree of routes for the entire location. The routes within this tree are actually a special type of route called `LocatedRoute`. And they're special because they let you convert a standard-issue `Route` into an application-wide `Location`. Behold:

```js
const location = appRoute.locate({ content: route })
```

`LocatedRoute` objects have a `locate` method which takes an object of Routes with the same keys as children of the Located Route's Branch. This is a bit of a moutheful, but its easy to get the hang of in real life. To see it in action, check out the [Example](#example).

Ok, you can pass a `Route` to the `locate` method to create a link within your component. And `locate` is a method on a `LocatedRoute`. You should have one `LocatedRoute` per Junction, representing the current state of that Junction. But how do you get your application's Located Routes? With the Converter. But before we look at the Converter, let's detour through Locations.

## Location

A `Location` object holds *one* state of your application. In a way, it is a lot like a `LocatedRoute` tree. The difference is that a `LocatedRoute` tree is structued after your Junctions, while a `Location` mirrors the state stored in your browser. Or more specifically, the part of your browser which the [history](https://github.com/mjackson/history) package exposes.

But enough rambling. Here is what a Location looks like:

```js
{
  pathname: '/my-awesome-application/contacts',
  query: '?page=1',
  state: {
    $$junctions: {
      // Stuff in here is generated and read by junctions. Don't worry about it.
    },
  },
}
```

Locations are useful in that they let you communicate with your browser. Otherwise, they're pretty ugly. Hell, if they weren't ugly, its not like we'd all be using routers.

But yeah, that's basically all there is to it. **Locations store ugly state. Routes store the same state, just in a more useful stucture. Junctions define that structure.** And -- you guessed it -- the converter swaps between a `Location` and a `LocatedRoute`

## Converter

The Converter is the code which ties everything together. It was the hardest part to write, but is ridiculously easy to understand. That's why junctions are so powerful. Ready to be amazed by the all powerful converter? Here it is:

```js
const locationConverter = createConverter(rootJunctionSet)

// Turn a Location into `LocatedRoute` trees corresponding to rootJunctionSet
const routes = locationConverter.getRouteSetFromLocation(location)

// Turn your `Route` trees back into the original location
const location = locationConverter.getLocationFromRouteSet(routes)
```

Obviously, you don't have to pass in the same routes as your current location. You can pass in any routes -- including the vanilla `Route` variety -- as long as they're routes for `rootJunctionSet`.

Actually, `LocatedRoute.prototype.locate` uses `getLocationFromRouteSet` under the hood. As does the `<Mount>` component for react-router in the [react-router-junctions](https://github.com/jamesknelson/react-router-junctions) package. In fact, other than a bunch of sanity checking code in the five declaration functions (`JunctionSet`, `Junction`, `Branch`, `Param`, `Serializer`), the entire library is basically these two functions. Which makes it hard to imagine the API will be changing any time soon.

But before we talk about the API, let's have a look at a quick example using React.
