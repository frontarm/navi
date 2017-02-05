**Note: The Guide is still only an outline. [Pull Requests](https://github.com/jamesknelson/junctions) would be greatly appreciated!** 

# Locations

- One of the things that makes the web *the web* is that everything has a URL.
- In fact, everything that is displayed in a browser has a URL, which is displayed in the address bar.
- But applications can't see the address bar, so how do they know the current URL?

- There is a JavaScript object containing this information that every application automatically has access to. It is old as JavaScript itself.
- This object is `window.location`, and it looks something like this:

```js
{
    pathname: '/some/path',
    search: '?page=1&pageSize=20',
    hash: '#top',
}
```

- Within *junctions.js*, this object would be called a `Location` object.
- It represents a single *location* within your application.

- While a URL is certainly one way to represent a location, not all locations be represented with a single URL.
- For example, some applications contain modals. Modals *feel* like locations -- it makes sense that after opening a modal, clicking the *Back* button should close it.
- But not every modal needs its own URL.
- How do we solve this?

- Modern browsers also have the concept of location `state`.
- This is an arbitrary object that can be associated with any item within your browser history, by using the browser's `window.history.pushState()` method.
- The application's current location `state` can be viewed at `window.history.state`.
- But to make things easier for you, Junctions assumes that your current `state` will be stored as part of a `Location` object.
- With this in mind, a `Location` object can look like this:

```js
{
    pathname: '/some/path',
    search: '?page=1&pageSize=20',
    hash: '#top',
    state: {
        showAddModal: true,
    },
}
```

- In fact, the format of this `Location` object is not unique to *junctions.js*. It is also used by the popular [history](https://github.com/mjackson/history) package.

- For small applications, these `Location` objects provide all the information we need to handle routing.
- But as your app grows, feeding pieces of data from the current `Location` into associated components will become a hassle.
- The problem is that `Location` objects are *flat*, while a component-based application will be nested.
- To fix this problem, *junctions.js* gives you a more suitable way to represent location information, called [Routes](./routes.md).


