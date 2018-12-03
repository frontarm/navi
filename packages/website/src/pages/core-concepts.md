Core Concepts
=============

See that URL bar at the top of your browser? As you navigate through an app, the value of that URL will change. But it'll always contain at most three parts: 

- a **pathname**, e.g. `'/navi/core-concepts'`
- a **search**, e.g. `'?id=abc'`
- a **hash**, e.g. `'#history'`

Browsers expose the pathname, search and hash for the current URL through the `window.location` object. By reading this object you can check the current URL, or by setting its parts you'll cause the browser to navigate.

```js
console.log(window.location.pathname)

// Click the button to update the search,
// causing the browser to navigate
document.querySelector('button').onclick = () => {
  window.location.search = '?time='+Date.now()
}
```

You can imagine how it'd be possible to build a router with nothing but `window.location`. But as this app grows, this simple app will run into a major problem: each time the URL changes, the entire app will reload, and all it's state will disappear.

In order to solve this, you'll need a way to update the location *without* reloading. Of course, you'll then also need to be able to handle clicks on the browser's back/forward buttons. And while you *could* do this manually through the browser's `history` object and `popstate` and `hashchange` events, it turns out that there's an easier way.


History
-------




te peform routing by manually checking and updating `window.location`. But 




While this array stores the navigation *history*, in all likelihood, you probably only care about the *current* location. The thing is, the current location will change if the user navigates. So you'll want to be able to both access the current location, as well as subscribe to any new locations.

```js
let history = {
  entries: entries,
  location: { pathname: '/demoboard', search: '?id=abc', hash: '' },
  subscribe: (listener) => {
    // call `listener` each time the current location changes
  }
}
```

Finally, you'll want a way to actually *change* the location. In fact, you'll want *two* ways to change the location:

- You might want to `push()` a new location onto the history, so the user can click *back* to undo the change.
- You might want to `replace()` the current location, without affecting the back and forward buttons.







See that URL bar at the top of your browser? Let's call that the *location*, since it's represented by JavaScript's `window.location` object.



history

- just a more friendly wrapper around browser history
- plain javascript
- written by mjackson (who is the maintainer of react-router), and is also used in react-router
- you can programatically navigate by interacting with a history object
- you could even subscribe to history object and react to new URLs yourself, but it gets
  messy because URLs are flat, depend on async things like imports and fetches, etc.
- navi lets you declare how URLs map to content and handles all of that for you. and the
  way that you make this declaration is with pages

- aside: because react-router and navi both use the same history package, it's possible to use navi within a react-router route or vice versa. see guide &raquo;

for more details, see the history docs


pages

- navi apps are built around pages
- they're a way of declaring how URLs map to content

- pages are kind of like components; they can be reused across apps
- in fact, you can think of their `getContent` method a bit like an async render
- just as a React component re-renders each time its state changes or it's parent re-renders, a Navi page's content will be recomputed each time the user navigates, or it's parent is recomputed.

- not all URLs are pages; sometimes they redirect. So navi gives you redirects.

- all Navi URLs should map to a page or a redirect. But defining all of these in a
  flat file would suck. so navi gives you two tools to share info between multiple pages/redirects:
  switches and contexts
  
for more details, see the "Declaring pages" section of the API reference


routes

- routes are objects that contain a url, as well as any information that have been associated with them via pages, as well as the *status*
- > example of route object
- you can see how having a route object makes it easier to render your content than it would be if you just had a plain old URL
- but how do you get a route? with a navigation.

for more details, see the API reference's "routes and segments" section


navigation

- each app has a navigation object, which manages your app's history, and outputs route objects as the history changes / as content loads
- navigaiton objects contain a history
- navigation objects are observables
- you can have browser or memory navigation
- can think of it kind of like a store

for more details, see the API reference's "navigation objects" section