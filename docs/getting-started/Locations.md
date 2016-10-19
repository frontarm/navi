# Locations

At its most basic, Junctions is a tool to help you manage your app's location. But what do I mean by location?

**Location refers to any state associated with your browser's back and forward buttons.**

If we were writing our application in pure JavaScript, we'd need to use `window.location` and the HTML5 History API to access this information. This would be pretty painful. Fortunately, the excellent [history](https://github.com/mjackson/history) package gives us a browser-independent API to use instead, through `history` objects.

In a nutshell, a `history` is an object which makes your browser's history available as a collection of of `Location` objects. Each `Location` object looks a little like this:

```js
{
  // These two parts correspond to the URL
  pathname: '/contact/15/payments',
  search: '?order=date&where=paid:false'

  // This part corresponds to the HTML5 History state
  state: {
    $$junctions: {
      'main': { branchKey: 'AddContactModal' },
    }
  }

  // There are other options, but they're not used by Junctions
}
```

If you have a `Location` and a `history` object, navigation is performed with a simple call to `push`:

```js
history.push(location)
```

And the current location is just a property of `history`:

```js
history.location
```

Being able to find the current location is a good start, but it'd be even better if we could be notified when the location *changes*. And it turns out we can do this with `history.listen`:

```js
function handleLocationChange(nextLocation) {
  // Re-render your application
}

handleLocationChange(history.location)
history.listen(handleLocationChange)
```

Wait a moment - we've just built a funcional router! And if your application doesn't have many levels of nesting, this is really all you need.

But what if your application's URLs and component structure are nested a few levels deep? Deciding what to render based on this flat `Location` will be tedious. It'd be a lot easier to work with a Location object which mirrors the nested structure of your application. And that's where Routes come in.
