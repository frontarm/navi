# JunctionSet({ [key: string]: Junction }, primaryJunctionKey): JunctionSet

Represents a group of Junctions, where your application will have at most one Route for each Junction 

The `primaryJunctionKey` is the route whose state will be stored in `location.pathname` and `location.query` if possible. All other state will be stored in `location.state`
