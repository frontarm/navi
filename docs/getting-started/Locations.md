# Locations

At its most basic, Junctions is a tool to help you manage your app's location. But what do I mean by location?

**Location refers to the state the browser keeps which is associated with the back and forward buttons.**

If we were writing our application in pure JavaScript, we'd need to use `window.location` and the HTML5 History API to access this information. This would be pretty painful. Fortunately, the excellent [history](https://github.com/mjackson/history) package gives us a browser-independent API for accessing this information.

In a nutshell, `history` is a way to manage a collection of `Location` objects which represent the browser history. A single `Location` object looks like this:

```js
{
  // These two parts correspond to the URL
  pathname: '/contact/15/payments',
  search: '?order=date&where=paid:false'

  // This part corresponds to the HTML5 History state
  state: {
    showAddContactModal: true,
  }

  // There are other options, but they're not used by Junctions
}
```

If you have a `Location` and a `history` object, navigating the browser to a new page is a simple as this:

```js
history.push(location)
```

Finding the current location is just as simple:

```js
history.location
```

Being able to find the current location is good, but what we'd really like is to be notified when the location *changes*. We can do this with `history.listen`:

```js
function handleLocationChange(nextLocation) {
  // Re-render your application
}

handleLocationChange(history.location)
history.listen(handleLocationChange)
```

Wait a moment - we've just built a funcional router! And if your application doesn't have many levels of URLs, this is a perfectly good router too.

But what if your application's URLs and component structure are nested a few levels deep? Deciding what to render based on this flat `Location` will be tedious. It'd be a lot easier to work with a Location object which mirrors the nested structure of your application. And that's where Routes come in.
