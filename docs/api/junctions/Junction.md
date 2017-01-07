---
title: Junction
---

# Junction

Defines the types of [Route](Route) objects which a component can accept. The objects which represent route types are referred to as **Branches**.

Junctions must be created with the [createJunction](createJunction) factory function, which accepts an object with its branches' configuration.

You can think of Junctions as objects representing *points in your application where behavior depends on part of the application's [Location](Location)*.

## Branch Parameters

TODO:
- each branch has param types

## Composing Junctions

Junctions represent UI components, and components can be composed from other components. As a result, Junctions must be composable too.

To facilitate this, each Branch within a Junction can contain one or many `children` Junctions. The `children` property should contain the Junctions associated with the Components which are used to render a Branch.

TODO: 
- as components can be composed of other components, a format for specifying a component's possible routes must specify the possible routes of its child components.

## Junctions as Decision Trees

TODO: 
- a Junction object along with its branches' children is similar to a format for defining [decision trees](https://en.wikipedia.org/wiki/Decision_tree)
- each junction represents a single node in the tree, with the branches correspond to the tree's branches.
- Like a decision tree, there can only be one path through the tree
-  

## Junction Diagrams

A junction diagram is kind of like a schematic for your application. It represents all of the possible routes your application can take, using the following conventions:

1. Junctions are represented as rotary switches, with the default branch drawn as the currently selected arm of the switch.
2. Junction Sets are represented as splitters
3. Routes (and route sets) can be drawn onto the diagram by lighting up one path through a series of junctions

Here's an example. In fact, its pretty close to what you saw in the [Routes](Routes) page -- the main difference is that it now shows default branches.

![Junction Diagram](junction-diagram.png)

Junction diagrams are a great tool to reason about an application's structure. In fact, if we were to also write out the options for each Branch, these diagrams would contain enough information to perform a mapping between Locations and RouteSets. But as great as diagrams may be for humans, they're not very useful for machines. So let's learn how to declare Junctions with functions.



## Methods

### createRoute(name, params, ...children)



#### Arguments

* `name` (*string*): ...
* `params` (*object*): ...
* `...children` ([Route[]](Route)]*): ...

#### Returns

(*[Route](Route)*) 

#### Example:
