---
metaTitle: Does my React app need a Router?
metaDescription: So you've decided to build a new React app. And usually, your first step would be to add a routing library. *But do you really need one?*
---
# Do I Need A Router?

So you've decided to build a new React app. And usually, your first step would be to add a routing library. *But do you really need one?*

## What Routers Do

The first step to understand whether you need a routing library is to understand what routing libraries do. Which is something along the lines of:

- Smooth over inconsistencies between browsers
- Provide helpers for working with React
- Respond to browser navigation events

Of course, most routing libraries do a lot more. But we probably don't *need* features like loading entire scripts dynamically or JSX-based definitions of available routes. So let's keep to the basics as we go over the details.

### Smoothing over inconsistencies between browsers

While modern web browsers supposedly all respect the same standards, the reality is that each browser still has its own quirks. Not to mention that the standards sometimes leave a little room for interpretation.

One example is the [popstate](https://developer.mozilla.org/en-US/docs/Web/Events/popstate) event. The browser emits this every time time the location changes. Or at least some browsers do; Chrome and Firefox also emit it on load, while safari doesn't. And none of the browsers emit it when *you* change the state by calling [pushState()](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method).

To write a router using the browser's raw History API, we'd need to smooth over all these differences. And even then, our application shouldn't care *why* the location changed -- it should respond to navigation events regardless. Given all this, it seems like the browser API is going to make life difficult for us. So does that mean we need a routing library? Kind of. But kind of not.

*It means we need a browser inconsistency smoothing library.*

And thats what the [history](https://github.com/mjackson/history) package is for. [react-router](https://github.com/ReactTraining/react-router) uses it internally, but it is a completely independent library. And it is a very useful library too. It lets you avoid all the browser inconsistencies by sticking to this pretty simple API:

```js 
import createHistory from 'history/createBrowserHistory'
const history = createHistory()

function handleNavigation(location) {
  console.log(location.pathname)
}

// Handle the initial location
handleNavigation(history.location)

// Handle subsequent navigation events
history.listen(handleNavigation)
```

Ok, so with history, we now have access to the latest location. But these history objects present a new problem: `<a>` tags don't work with the History API. In fact, every time we click an `<a>` which holds anything other than a hash fragment like `#butterflies`, the entire page reloads! In order to navigate without a page reload, we'll need to call `history.push()`. And to do that, a routing library will often supply some tools.

### Helpers for working with React

Because of the situation with `<a>` not working with push state, you'll find that routing libraries include a fix. This commonly takes the form of a `<Link>` component -- which renders an `<a>`, but adds an `onClick` handler to capture any clicks and redirect them to `history.push()`. In practice, this looks something like this:

```js
class Link extends React.component {
  constructor(props) {
    super(props)

    // The `bind` is necessary to make `this` work within the `handleClick`  
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    if (event.defaultPrevented ||
        isModifiedEvent(event) ||
        !isLeftClickEvent(event)) {
      return
    }

    event.preventDefault()

    // It only makes sense for an application to have one history, so we can
    // make it global
    history.push(this.props.to)
  }

  render() {
    var props = Object.assign({}, this.props)

    
    props.onClick = this.handleClick
    props.href = this.props.to.pathname + (this.props.to.search || '')
    delete this.props.to

    return <a {...props}>{props.children}</a>
  }
}
```

A full featured implementation of `<Link>` will probably want a few extra features; for example, accepting a `history` object from [Context](https://facebook.github.io/react/docs/context.html). But even with these features, `<Link>` doesn't need to be hugely complicated. After all, `<a>` isn't hugely complicated either.

And while most routing libraries will probably provide some other bits and pieces, it is unlikely you'll actually need them. I mean, you don't even really need a `<Link>` component; if you use a [hash based](http://jamesknelson.com/push-state-vs-hash-based-routing-with-react-js/) router instead, then you'll be fine without it. But assuming you're using push state, it isn't a huge problem to just roll your own.

So maybe we don't need a routing library? But there is still one thing we need to take care of. Even if we can render `<Link>` tags and receive a notification when the user navigates, we still don't know what to actually *do* with the received locations.

### Responding to browser navigation events

Given we have a `history.listen()` handler, our application is going to receive a series of `location` objects. Each one looks something like this:

```js
{
  pathname: '/todos',
  search: '?page=2',
  state: {
    some_arbitrary_stuff: '人参'
  }
}
```

You can think of these locations as one way of specifying what the application should render. For example, the object above may specify that we'd like to see page two of a *Todos* screen. Easy, right?

But let me ask you a question. Given the user has just clicked a `<Link>` and we've received this new location, *how does React know what to actually render*? And this brings up another question: *how does React even know it has to re-render?*

#### Telling React about location changes

One of the best things about React is that it is pretty dumb. It doesn't try and guess when things like your location change. You need to tell it.

The most common way of doing so is with a component's [setState()](https://facebook.github.io/react/docs/react-component.html#setstate) method. But in order to use `setState()` from within our navigation handler, our handler will need to have access to `setState()`. And this means that we'll need to create the handler function and pass it to `history.listen()` within the component itself. Like this:

```js
class Application extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      location: history.location
    }

    history.listen(this.handleNavigation.bind(this))
  }

  handleNavigation(location) {
    this.setState({
      location: location,
    })
  }

  // ...
}
```

With this, you can now always access the most recent location at `this.state.location`. So the obvious question is: what should you actually do with it?

#### Rendering your routes

In React, rendering your routes is really no different than rendering anything else. You just take the location at `this.state.location`, and return an element based on its value. Like this:

```js
render() {
  const pathname = this.state.location.pathname

  if (pathname === '/todos') {
    return <Todos search={this.state.location.search} />
  }
  else if (pathname === '/reminders') {
    return <Reminders search={this.state.location.search} />
  }
  else {
    return <NotFound />
  }
}
```

Simple, right? Or at least, simple so long as we don't add a bunch more routes. Once your application starts to grow in size, you're going to want to find a better way of processing the location than a giant `if-else` or `switch` statement. And that is going to mean a better way of representing the Location than two gnarly strings.

The thing about the two strings you get from a `Location` object is they're made that way due to browser limitations. The browser has a URL bar, so your application receives URLs -- even if it would make way more sense to receive some sort of *Route* object which matches the structure of your application.

This is where routing libraries really do shine -- they can convert `Location` objects into something more useful. Or to put it another way, good libraries add useful functionality. They don't replace it.

## To Route Or Not To Route

But to return to the original question; *do I even need a routing library?* The answer is (of course) it depends.

Are you writing a simple application where you've got few enough URLs that a simple `<Application>` component is easily comprehensible? Then you probably don't need a routing library. Using the history package with a custom `<Link>` component is nice and simple. And if your application grows, you can always add appropriate tools down the track.

But maybe your URLs are complex enough that you'd like to break them down into more manageable parts. Or maybe you want individual screens to manage their own routes -- as opposed to a single application-wide `<Application>` component. Or maybe you just want some well-defined patterns to follow. In this case, Junctions is just what you need!

