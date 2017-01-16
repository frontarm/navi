---
title: What You Get
---

# What You Get

It's time to talk specifics. What *in particular* does Junctions give you that don't get from the hand-rolled router in [Do I Need A Router?](do-i-need-a-router)?

Well, Junctions gives you all sorts of things -- you can read about them in the API Reference. But by far, **the most important thing that Junctions gives you is structure**. In fact, if you `npm install` junctions today, you will receive not one, but *three* structures:

1. A `Route` structure that represents nested routing information
2. A `Converter` object that converts URLs into `Route` objects
3. A `Junction` structure that is used to configure your `Converter`

These three structures are the foundation of Junctions, so let's take a look at why they exist, and what they do.

## Routes Aint Locations

The best way to understand a `Route` object is to compare it to the `Location` objects that we first encountered in [Do I Need A Router?](do-i-need-a-router). Recall that [Location](/api/junctions/Location) objects each hold a single URL and some arbitrary state:

```js
{
  pathname: '/todos',
  search: '?page=2',
  state: {
    some_arbitrary_stuff: '人参'
  }
}
```

The problem that we encountered with `Location` objects is that their structure doesn't fit with React; while Locations are flat, Components are trees. Splitting up the information in a `Location` object and passing it to the correct component is cumbersome and repetitive.

IMAGE: flat location, vs nested components using parts of that location

Routes, like Locations, are a way of representing navigation state. But unlike Locations, `Route` objects are structured to match your component tree *perfectly*. Routes can also be nested and composed, just like React components. And most importantly, they're relative. They only contain the state relevant to one component -- not the entire application.

IMAGE: nested routes vs nested components

But how do we get `Route` objects? The browser API only understands absolute `Location` objects, so we're going to need some way of converting between `Location` and `Route`. And that's what the `Converter` is for.

## Converters Convert

Converters do exactly what you would expect them to do. That is, they convert between `Route` and `Location` objects. The question is -- *how?*

The problem is that the information within a `Location` object isn't sufficient to find a `Route`. To demonstrate, consider the URL `/invoices/add`. Should the converter create a single-level route, or two nested routes?

```
const option1 = { key: 'AddInvoice' }
const option2 = { key: 'Invoices', next: { key: 'Add' } }
```

And does this URL represent an "Add Invoice" screen, or an Invoice with the id "add"?

```
const option3 = {
    key: 'Invoices',
    next: {
        key: 'Details',
        params: { id: 'add' }
    }
}
```

To find out, let's take a little detour and consider what the words "location" and "route" actually *mean*. According to the Oxford Dictionary of English:

- A location is "a particular place or position"
- A route is "a way or course taken in getting from a starting point to a destination"

Or to put this into pixels,

IMAGE: location vs routes (draw multiple nested routes for the one location)

You can think of a `Converter` just like a navigator in the physical world. It finds routes based on locations. Or more specifically, it uses the information within a `Location` to build a `Route` object, which specifies a path through your component tree.

IMAGE: prop flow through a component tree

So how would a navigator find a route to a location? Well, they'd need to know all of the possible actions at any possible point. Or to put it simply, they'd need a map!

IMAGE: CAPTION: Which is the best path? without map, with map.

And as you may have guessed, in the Junctions world, these maps take the form of `Junction` objects.

## Junctions Are Maps

- Junctions are objects which specify all possible routes from the location at where they are mounted
- If you know all the permissible next URL segments, then the converter can pick one.
- Example: create a junction for the above URL

- Put them together, and you get something which looks like a map.
- IMAGE: decision tree
- But there is another word for this: A Decision Tree
- Each node is a possible location.
- And looking at this example, you can see exactly how you'd nest Routes for any possible Location.
- As you might guess, the Converter can too.
- As it happens, the convert can also convert from a route back to a location.
- And with that, you solve the Location-Component mismatch. And with barely any API surface area, you have a "router".


