# <a href='https://github.com/jamesknelson/junctions/blob/master/README.md'><img src='https://raw.githubusercontent.com/jamesknelson/junctions/master/media/logo-title-dark.png' alt="Junctions" width='232'></a>

Composable and context-free routing for React, built on the excellent [history](https://github.com/mjackson/history) package.

Why use Junctions?

- They're **composable**. Re-use components, even if they contain links!
- They're **superimposable**. Because sometimes two routes can be active at once.
- They're **context-free**. Now you can understand how your own app works!
- They're **simple**. Don't believe me? Click the link on the next line.*

## Demo

See [live demo](http://jamesknelson.com/react-junctions-example/), with source available in [examples/raw-react](https://github.com/jamesknelson/junctions/tree/master/examples/raw-react).

## Installation

At minimum, you'll need the junctions package

```
npm install junctions --save
```

If you want a `<Link>` component to get `pushState` working with React, install `react-junctions`

```
npm install react-junctions --save
```

Or if you want to use junctions-based components within a react-router application, install `react-router-junctions`

```
npm install react-router-junctions --save
```

Alternatively, use plain-ol' script tags with unpackage. See the live demo source for an example.

```
<script src="https://unpkg.com/junctions@0.0.5/dist/junctions.js"></script>
<script src="https://unpkg.com/react-junctions@0.0.5/dist/index.js"></script>
```

## Introduction

1. [Motivation](#motivation)
2. [Three Principles](#the-three-principles)
3. [The Basics](#the-basics)
4. [An Example](#example)

### Motivation

Once upon a time, maybe 3 years ago, most buttons on a web page caused a request to be sent to a server in a far away land. The request's address and contents were encoded in a URL. Upon receipt of the request, the server then rendered a response as a HTML page and sent it back to your browser. We called this the information superhighway, and after the novelty wore off and that sounded kinda stupid, we called it "the web".

But let's fast forward to the modern world, where you're writing a modern JavaScript application. Instead of waiting for some machine on the other side of the planet, you now want to give your users *immediate* feedback each time they do something. And to make this happen, you've needed to decouple your client URLs from your backend URLs. **The URL the user sees is no longer an instruction to "GET this", but is just a map to some spot within your application.**

Application URLs have changed from an implementation detail to a UX optimization, but **the tooling hasn't caught up**. Routing tools still assume that you'll write your application *around* your Routes, instead of using Routes *within* your application. They still assume that your application's URL hierarachy will map *directly* to your view hierarchy, *preventing you from creating URLs which don't map directly to Views*. And they still assume that you're going to have a server somewhere which for some reason does *exactly the same thing as your client*.

Put simply -- Routers want to be the *core* of an app, but in client-side apps they just *aren't*. And don't take my word for it -- even react-router's authors think their API is ["fighting against React"](https://github.com/ReactTraining/react-router/commit/743832c559e7f9a5c8278c247e52730917333f82).

Junctions solve all this by *not* doing three things.
 
### The Three Principles

#### Don't store state

**Location state is aleady stored in the browser. It doesn't need to be stored again.** 

In the React and Redux world, this is often phrased as having a "single source of truth".

The browser already stores your current location -- both as a URL, and as HTML5 History. It already has APIs for reading and updating it. And even if the APIs differ between browsers, the excellent [history] library provides a unified interface.

In the server side world, Routers need to manage your location. In the client side world, Junctions can leave it to the browser.

#### URLs should not map directly to components

**URLs are optional in client side apps. They should be optional for your components, too.** 

In a server side application, *every request has a URL*. As such, it makes sense to use the URL as a switch between available outputs.

In a client side application, a URL is just a UX optimization. In fact, HTML5 History can store additional information which is linked with the Back/Forward buttons, but is hidden from the user-facing URL. And importantly, HTML5 History means that *you're no longer limited to having one route active at once*. Which makes dealing with modals a whole lot easier.

Junctions does not assume that your URLs correspond to component hierarchy. Instead, it maps your entire [Location](#location) to a set of plain old JavaScript objects. It is then up to your components to render their current location in whichever way works best -- whether that is by delegating to a child component, displaying a modal, or even ignoring the information completely.

#### Routing should not prevent reusability

**Components cannot refer to external locations without receiving those locations as parameters.** 

The biggest win of any modern JavaScript framework is the ability to create re-usable components. And one of the biggest losses of a traditional router is how they complicate this.

One of the goals of Junctions is to allow components which can be re-used across applications. This has a number of implications:

- There can be no reliance on [Context](https://facebook.github.io/react/docs/context.html), [prototypical inheritance](https://docs.angularjs.org/guide/scope#scope-hierarchies), or framework-specific features.
- References to locations must be relative, not absolute
- Links can only be made to parents without receiving information on how to do so

So now you know what Junctions don't do. But you're probably more interested in what they *do* do.

### The Basics

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

#### Junction

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

#### Junction Set

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

#### Route

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

#### Location

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

#### Converter

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

### Example

Let's put this all together with an example of Junctions usage which follows the above Junctions diagram. I've written the example in React, but you should be able to use Junctions with any component-based view library.

```jsx
const history = History.createBrowserHistory()
const { JunctionSet, Junction, Branch, Param, Serializer } = Junctions
const { Link } = ReactJunctions


/*
 * Dashboard Screen
 */

const DashboardScreen = React.createClass({
  render: function() {
    return (
      <div>
        <h2>Dashboard</h2>
      </div>
    )
  },
})


/*
 * Contacts Screen
 */

const ContactsContent = Junction({
  list: Branch({}),

  id: Branch({
    path: '/:id',
    params: {
      id: Param({ required: true }),
    }
  }),
},
'list')

const ContactsModal = Junction({
  add: Branch({}),
})


const ContactsScreen = React.createClass({
  statics: {
    junctionSet:
      JunctionSet({
        content: ContactsContent,
        modal: ContactsModal,
      },
      'content')
  },

  render: function() {
    const locate = this.props.locate
    const { page, pageSize } = this.props.params
    const { content, modal } = this.props.routes

    const detail = 
      content &&
      content.branch == ContactsContent.id &&
      <div>
        <h3>Contact #{content.params.id}</h3>
      </div>

    const modalElement =
      modal &&
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{backgroundColor: 'white'}}>
          <h1>Add</h1>
          <nav>
            <Link to={ locate({ content, modal: null }) } history={history}>Close</Link>
          </nav>
        </div>
      </div>

    return (
      <div>
        <div>
          <h2>Contacts Page {this.props.params.page}</h2>
          <nav>
            <Link to={ locate({ content, modal: ContactsModal.add() }) } history={history}>Add</Link>
          </nav>
          <ul>
            <li><Link to={ locate({ content: ContactsContent.id({ id: 'james-nelson' }) }) } history={history}>James K Nelson</Link></li>
          </ul>
        </div>
        {detail}
        {modalElement}
      </div>
    )
  },
})


/*
 * App Screen
 */

const AppContent = Junction({
  dashboard: Branch({
    data: {
      Component: DashboardScreen,
    },
  }),
  contacts: Branch({
    path: '/contacts',
    data: {
      Component: ContactsScreen,
    },
    children: ContactsScreen.junctionSet,
    params: {
      page: Param({
        default: 1,
        serializer: Serializer({ serialize: x => String(x), deserialize: x => x === '' ? null : parseInt(x) })
      }),
      pageSize: Param({
        default: 20,
        serializer: Serializer({ serialize: x => String(x), deserialize: x => x === '' ? null : parseInt(x) })
      }),
    },
  }),
},
'dashboard')


const AppScreen = React.createClass({
  statics: {
    junctionSet:
      JunctionSet({
        content: AppContent,
      },
      'content')
  },

  render: function() {
    const locate = this.props.locate
    const { content } = this.props.routes

    return (
      <div>
        <p>
          Hi! This is a demo for the <a href="https://github.com/jamesknelson/junctions">Junctions</a> routing system for React.
        </p>
        <p>
          The source is all contained in old-school script tags. View source to get smarter. Also check out the <a href="">Junction Diagram</a>.
        </p>
        <hr />
        <nav>
          <Link to={ locate({ content: AppContent.dashboard() }) } history={history}>Dashboard</Link>
          <Link to={ locate({ content: AppContent.contacts() }) } history={history}>Contacts</Link>
        </nav>
        <content.data.Component
            routes={content.children}
            locate={content.locate}
            params={content.params}
        />
      </div>
    )
  },
})


/*
 * Entry Point
 */

const baseLocation = { pathname: '/' }
const locationConverter = Junctions.createConverter(AppScreen.junctionSet)
const locate = routeSet => locationConverter.getLocationFromRouteSet(routeSet, baseLocation)

function render(routes) {
  ReactDOM.render(
    <AppScreen
      routes={routes}
      locate={locate}
    />,
    document.getElementById('app')
  )
}

function handleLocationChange(location) {
  const routes = locationConverter.getRouteSetFromLocation(location, baseLocation)
  const canonicalLocation = locate(routes)

  if (!Junctions.locationsEqual(location, canonicalLocation)) {
    history.replace(canonicalLocation)
  }

  render(routes)
}

handleLocationChange(history.location)
history.listen(handleLocationChange)
```


## API

The API for Junctions follows directly for the above concepts. It consists of:

- 5 functions for declaring your Junctions and Junction sets
- 2 methods for converting between Locations and Routes
- 2 methods for creating Routes/Locations for use in navigation

### Junctions and Junction Sets

#### JunctionSet({ [key: string]: Junction }, primaryJunctionKey): JunctionSet

Represents a group of Junctions, where your application will have at most one Route for each Junction 

The `primaryJunctionKey` is the route whose state will be stored in `location.pathname` and `location.query` if possible. All other state will be stored in `location.state`

#### Junction({ [key: string]: BranchTemplate }, defaultBranchKey): Junction

Represents a point in your application where one of multiple branches must be selected

#### Branch({ path, children, params, data }): BranchTemplate

Represents one possible type of Route which can be taken on a given Junction.

`path` will be automatically generated from the available params if not specified.

#### Param({ default, required, serializer })

Represents one parameter which routes through a Branch can take

#### Serializer({ serialize, deserialize })

Defines a way to serialize and deserialize parameters. This allows your parameters to be any type of object, while still appearing as user friendly strings in URLs.

### Branches and Routes

#### `RouteSet` object

#### `Route` object

#### `branch() -> Route`

### Located Routes

Located Routes vs. Routes

#### LocatedRoute.prototype.locate(RouteSet) -> Location

### Conversion

#### createConverter(junctionSet) -> Converter

Create a `Converter` object with two methods two help you switch between `Route` and `Location` objects

#### converter.getLocationFromRouteSet(routeSet): Location

Accepts an object mapping JunctionSet key to Route object, and converts it to a Location which can be used with `<Link>` components or with `history.pushState`.

#### converter.getRouteSetFromLocation(location): RouteSet

Accepts a Location object (such as the current location from a history object), and converts it into a set of routes following the specification in the converter's JunctionSet

## More Examples

### Example: Defining application structure

```js
import { Junction, Branch, Param } from 'junctions'

import ContactsScreen from './ContactsScreen'
import DashboardScreen from './DashboardScreen'


const Content = Junction({
  Dashboard: Branch({
    data: {
      Component: DashboardScreen,
    },
  }),
  Contacts: Branch({
    path: '/contacts',
    children: ContactsScreen.junctionSet,
    params: {
      page: Param({ default: 1 }),
      pageSize: Param({ default: 20 }),
    },
    data: {
      Component: ContactsScreen
    }
  }),
}, 'Dashboard')
```

### Example: Associating routes with a component

```js
import { JunctionSet } from 'junctions'
import Link from 'react-junctions/Link'


export default class AppScreen extends Component {
  static junctionSet = JunctionSet({ content: Content }, 'content')

  render() {
    const locate = this.props.locate
    const { content } = this.props.routes

    return (
      <div>
        <nav>
          <Link to={locate({ content: Content.Contacts() })}>Contacts</Link>
          <Link to={locate({ content: Content.Dashboard() })}>Dashboard</Link>
        </nav>
        <content.data.Component
          locate={content.locate}
          routes={content.children}
          params={content.params}
        />
      </div>
    );
  }
}
```

### Example: Adding junctions to a React application

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { createConverter } from 'junctions'
import HistoryContext from 'react-junctions/HistoryContext'
import createHistory from 'history/createBrowserHistory'
import AppScreen from './screens/AppScreen'


const history = createHistory()
const locationConverter = createConverter(AppScreen.junctionSet)


function render(location) {
  const routes = locationConverter.getRouteSetFromLocation(location)
  const locate = routeSet => locationConverter.getLocationFromRouteSet(routeSet)

  ReactDOM.render(  
    <HistoryContext history={history}>
      <AppScreen locate={locate} routes={routes} />
    </HistoryContext>,
    document.getElementById('root')
  )
}


render(history.location)
history.listen(render)
```

### Example: Mounting a junctions-based component in an application using react-router

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import { Mount } from 'react-junctions/react-router'
import AppScreen from './screens/AppScreen'


ReactDOM.render(
  <Router history={browserHistory}>
    <Mount path="/root-path" component={AppScreen} />
  </Router>,
  document.getElementById('root')
)
```
