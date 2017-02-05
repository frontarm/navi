**Note: The Guide is still only an outline. [Pull Requests](https://github.com/jamesknelson/junctions) would be greatly appreciated!** 

# Routes

- A `Route` is an object which contains a portion of your app's Navigation state.
- But where a `Location` describes the state of your entire application, a `Route` typically describes the portion of navigation state corresponds to one specific component within your application

**TODO: Example of screen which can render one of two routes, each with different keys**

- You'll often render different types of components based on the key. But how can you pass other information to the component?
- Route objects can also hold a **params** object with further details on the route

- Example of a screen rendering something based on its parameters

## Nesting Routes

- Each Route represents the navigation state of a single Screen. But what happens if one Screen contains another screen?
- *The Route for the parent screen must contain the Route for the child screen.*
- This is accomplished through the **children** property of a Route.

**TODO: Example of a Route which holds another Route under its children property**

- One of the most important concepts to grasp about Junctions is that **Routes are relative**.
- Routes only ever contain the information about their state and their children's state. But they don't know anything about their parents.
- This means that any Route can be included in the children of another Route. And **any navigable screen can be mounted in any other navigable screen**

- Example where the above route is mounted inside another screen, along with screen code

## Routes are like Onions

- One way of visualising this is to think of Routes as onions.

**TODO: Image: Onion vs. Route**

- Like an onion, Each Route can contain a number of layers, linked by `children` properties.
- Also like an onion, you only have access to the outermost layer of an Route.
- But luckily, one screen generally only needs access to the information in the outermost layer.
- Once we've got our information, we can peel off that layer by accessing the `children` prop, and passing it through to our child Screen.
- Conversely, just because we have a route, we cannot say where it came from. It may have had many layers. Thus routes must be relative.

- In fact, its not just Routes which are like onions. React components are like onions too.

**TODO: Image: React Component Block Diagram vs. Route Object block Diagram**

- It is this similarity that allows Junctions to meet its third principle: Pass your own props
- Because the structures of React components and Route objects are so similar, manually passing the correct information to a child component is as simple as peeling off a layer and passing in the result.

- Both React Components and Junctions `Route` objects do not include any information about their original context. In onion terms, once you peel a layer away from a Route, the remaining Route will not know that the layer existed.
- But even if a Route doesn't know where it came from, it still has to have come from somewhere.

## The Root Route

- Your Root route is the single Route object within your application which is absolute.
- This is the Route which corresponds to the most top-level Screen in your application
- It also contains all the information in your application's current `Location`.
- But the route is only absolute in some contexts. 
- It isn't absolute when used within a screen.
- So what makes it absolute?
- The thing which makes this route absolute isn't that it contains this information, but that you *know* there are no parent layers. And you know this because you'll have built this Route by converting a `Location`
- You could do this conversion manually. But this package provides helpers to do it for you. And to do so, it'll need a Map. And that map is composed of `Junction` objects.


