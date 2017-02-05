**Note: The Guide is still only an outline. [Pull Requests](https://github.com/jamesknelson/junctions) would be greatly appreciated!** 

# The Screen Pattern

*Junctions* is a single tool for converting between Routes and Locations -- and that's it. But while this gives you a huge amount of flexibility, it can also leave you scratching your head as to the best way to use it.

**Screen Components** are a solution to this. They're a pattern for components which specify junctions and consume matching routes. And while they still give you flexibility to use *Junctions* whichever way you see fit, they take the guesswork out of getting started.

So what do Screen components look like?

- They have a static `junction` property
- They accept a `route` prop
- Their route's `child`, if it exists, is passed to a child screen

For example:

**TODO: example**

Let's go over this example one step at a time

## The static `junction` property

- Like React's `propTypes`, this specifies the types which can be passed in
- But unlike `propTypes`, it is actually used at runtime in production:
    - If this is the root screen, the converter will use it directly
    - If this is a nested screen, the parent screen's Junction needs to access it
**TODO: example**
- Because we know that any screen component has a `junction` property, composing screens becomes simply a matter of passing that junction to our junction branch's `child` property

## The `route` prop

- A screen's *current* Route object is always passed in via the component's `route` prop
- This route will match one of the junction branches specified on the screen's junction, as we trust that anybody using a screen knows where to find our Junction

## Handling route's `child` property

- If a Screen component's Junction specifies child Screens, then a Screen needs to handle the routes for child screens too.
- To do so, the screen should pass its `route.child` through to the child Screen's `route` prop
- `route.child` will differ based on which branch is currently active, so regardless of which child component you're rendering for the current route, *its* children will still be `route.child`


