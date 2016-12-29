# Locations, Routes and Maps

- Routers are a way of adding structure to an application
- We say this back in "Do I need a router?"
- But why is it that application's need this extra structure?
- The answer stems from our first two principles

## Locations Ain't Routes

- The browser stores state in a flat format, while composable components require relative routes. and whats more - those routes can't be url-based
- Code examples
- There is a mismatch between the structure of the navigation state needed by components, and the structure where it is stored in the browser
- We have a Location, we need a Route
- This is the source of the difficulty with structure we encountered back in "Do I Need A Router?"

## Routers Find Routes

- This is where a router comes in. It helps to convert between the shape of data our browser expects (e.g. a Location), and that which our application requires (a Route)
- So how do routers go about this conversion?

- To find out, let's first consider what it is that locations and routes represents.
- Consider the difference between the meanings of the words "Location" and "Route" in another context
- Locations are a place. Routes are how to get there.
- Image: location vs routes (draw multiple routes for the one location)

- Similarly, Locations represent a single state of your application tree
- Routes contain the actual information on how to render it
- Image: component tree vs prop flow through component tree
- With this in mind, let's return to the question of how we pick a Route for a given Location

## To Find A Route, You Need A Map

- In our real world example, its simple. We need a road map.
- Image: tree if routes
- And in our application example, we need a component map. Or as we'd refer to it in the Junctions library, a *Junction Map*.
- Image: tree of components, labelling sections with url part
- This image is actually generated from the Junction map of one of our example applications. And you can generate maps for your applications, too!
- In fact, see how the map looks like a tree of Junctions? That's where this package's name comes from.

## Math Over Magic

- Junctions is a tool which converts Locations into Routes, and vice versa, using a map of Junctions.
- And that's pretty much all it does. Which might be a surprise to you. What about all the magic which other routers perform?
- In Junctions, *you don't need any magic* to get your routing information to where it is needed.
- Because of hour our data is structured, it is already there.
- But don't take my word for it. Let's go over the three basic data structures in Junctions: Locations, Routes and Maps.
