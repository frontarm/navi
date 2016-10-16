# What are Routes?

Routes are objects which have a similar purpose to Location objects -- they contain instructions on which parts of the application to display. In fact, both Locations objects and Route objects store *exactly the same information*. The difference is in how this information is structured.

**`Route` objects have a structure which mirrors your component hierarchy. `Location` objects have a structure which mirrors your browser's History and URL API.**

If this feels a little like word soup, it might help to consider what the words "Route" and "Location" mean in plain English. While a "Location" is like a point on a map, a "Route" contains the information on how to actually get there. So where a `Location` can hold the absolute location of *any* point within your app, a `Route` holds a tree of *decisions* on which branch to follow at a given point.

**TODO: junction diagram on left, single junction with many choices on right**

So what does a `Route` object look like in practice? Here's a really simple one:

```js
{
  // The type of child to render for this component
  branch: PaymentList,

  // An object which holds aribtrary data, based on the current branch
  data: { ... },

  // Any extra information you need to render that child
  params: {
    order: 'date',
    where: { paid: false },
  },

  children: null,
}
```

This Route represents one part of the `Location` from the previous page. The `params` here come from the location's `search` property, while the `branch` is taken from the `pathname`. You'll see where `PaymentList` comes from in a moment, but for now all you need to know is that it represents one of a list of patterns within a certain slice of the URL.

Ok, so this gives us the right hand side of the URL. How do include the left hand side?

```js
{
  branch: Contacts,
  data: { ... },
  params: {
    id: '15',
  },
  children: /* ... */,
}
```

Looks pretty much the same as the first `Route`, right? The difference is that this Route has a non-null value of `children`. In fact, the first route is *included* in the `children` of this route.

Ok, so now we've converted the URL to a Route. But the `Location` still has some data in its `state` property -- how do we deal with this?

It turns out that we don't yet know enough to say exactly how that state will convert to a `Route`, but let's make a guess. Given the `state` object's value is `{ showAddContactModal: true }`, we can assume that it means there'll be a child `Route` within the `Contacts` branch which indicates that a modal is open. And this presents a problem. How can we have two child Routes active at one time?

## Route Sets

Where a single `Route` object represents the path taken at a single junction, a `RouteSet` object represents multiple paths taken through different junctions. And by setting our route's `children` to a `RouteSet` object, we're able to record  *multiple* active child routes. For example, a modal *and* a tab.

This is an important difference between Junctions and URL-based routers, so it is worth spending a moment to really get your head around how this works.

The thing about URLs is that they're like a list of instructions -- "take this branch, then take that branch, then take that branch". This means that you represent a URL as a *list* of routes, or as a "tree" where each Route only has one child.

**todo: diagram with a path through a number of junctions**

But by using `state`, we're no longer limited in this way. We can now take multiple paths at once, and render mutiple child components with their own routes from within a single component. Or in other words, we can have **superimposed** routes.

**todo: diagram with a splitter and multiple active routes**

## Example

Now that you know about Routes and Route Sets, let's have a look at a complete pair of `Location` and `Route`:

```js
// Location
{
  pathname: '/contact/15/payments',
  search: '?order=date&where=paid:false'
  state: {
    $$junctions: {
      'main': { branchKey: 'AddContactModal' },
    }
  }
}

// Route
{
  branch: Contacts,
  data: { ... },
  params: {
    id: '15',
  },

  // A `RouteSet` is just an object mapping string keys to `Route` values
  children: {
    // The `main` Route always corresponds to the URL part of the `Location`
    main: {
      branch: PaymentList,
      data: { ... },
      params: {
        order: 'date',
        where: { paid: false },
      },
    },

    // Other Routes correspond to the `state` part of the `Location`
    modal: {
      branch: AddContactModal,
      data: { ... },
    },
  },
}
```

## Next Steps

You should have a basic grasp of what exactly a Route is now - but what about the details? The `Contacts`, `PaymentList` and `AddContactModal` objects in the above example have to come from somewhere, as does the value of the `data` props.

Actually, these objects are something that we need to declare. They're how we teach Junctions how to map between Locations and Route Sets. And they're part of what gives this package its name.
