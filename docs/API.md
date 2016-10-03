# API

## Location

See documentation for [mjackson/history](https://github.com/mjackson/history#listening).

## Route

Routes are objects which represent your application's current state. Routes can contain further Routes as children -- the `Route` at the top-most level of your application will contain exactly the same information as your `Location` -- just in a different format.

## createConverter(junctionSet)

Create a `Converter` object with two methods two help you switch between `Route` and `Location` objects

### converter.getLocationFromRouteSet(routeSet): Location

Accepts an object mapping JunctionSet key to Route object, and converts it to a Location which can be used with `<Link>` components or with `history.pushState`.

### converter.getRouteSetFromLocation(location): RouteSet

Accepts a Location object (such as the current location from a history object), and converts it into a set of routes following the specification in the converter's JunctionSet

## JunctionSet({ [key: string]: Junction }, primaryJunctionKey): JunctionSet

Represents a group of Junctions, where your application will have at most one Route for each Junction 

The `primaryJunctionKey` is the route whose state will be stored in `location.pathname` and `location.query` if possible. All other state will be stored in `location.state`

## Junction({ [key: string]: BranchTemplate }, defaultBranchKey): Junction

Represents a point in your application where one of multiple branches must be selected

## Branch({ path, children, params, data }): BranchTemplate

Represents one possible type of Route which can be taken on a given Junction.

`path` will be automatically generated from the available params if not specified.

## Param({ default, required, serializer })

## Serializer({ serialize, deserialize })
