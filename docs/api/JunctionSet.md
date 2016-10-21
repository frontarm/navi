# `JunctionSet(junctions)`

Represents a group of Junctions, where your application will have at most one Route for each Junction 

#### Arguments

* `junctions` (*{ [key]: [Junction](Junction.md) }*): A keyed set of junctions.

#### Returns

(*JunctionSet*) 

#### Example:

```
JunctionSet({
  main: Junction(...),
  modal: Junction(...),
})
```
