**Note: The Guide is still only an outline. [Pull Requests](https://github.com/jamesknelson/junctions) would be greatly appreciated!**

# Junctions

- So far, we've discussed the two types of objects which *hold* our state - Locations and Routes.
- But `Junction` objects are a little different. Instead of holding navigation state itself, they **describe the set of possible values** which the application's navigation state can take -- allowing Junctions to automatically convert between Location and Route objects.

- Junction objects are found wherever Routes are consumed. In practice, this means that your Screen Components have junctions associated with them. 
- For example, a screen which can render one of these two routes would declare this by setting a static `junction` property like so

- each of these possibilities is called a **branch**
- branches can specify information
- for example, you can specify arbitrary data associated with a branch. This data will be passed through to a route on its **data** property
- and where routes can have parameters, junctions declare the types of parameters (see API ref for details)

- but junctions aren't just a way of specifying route types. they're a way to specify navigation state types.
- junctions specify possible URLs too. and this can be used to map between Locations and Routes

- junctions are nested, like routes
- unlike routes, junctions are aren't onions
- each junction can have multiple children
- junctions are trees. In fact, they're decision trees.

**TODO: decision tree image**

## Junctions are decision trees

- this section started by stating that junction objects describe your navigation state.
- but the key to understanding Junction objects is to understanding *why* Junctions are described in the format they are.
- Your Root Junction object describes all possible values of your application's Location or Root Route, in the form of a decision tree which lets you convert between both forms - Location and Route
- to see this, consider the following URL. How do you split it into routes?

```
`/invoices/add`
```

- but given the following decision tree, the conversion becomes obvious

**TODO: decision tree image**

- You can think of your application's root Junction object as a Map which let's this package's tooling automatically find a Route to a given Location.
- As you see, Junctions are really the core of this package. And to forgo all decorum and state the obvious, that is why the package is called Junctions.


