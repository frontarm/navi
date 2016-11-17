# Glossary

This is a glossary of the core terms in Junctions, along with their type signatures. The types are documented using [Flow notation](http://flowtype.org/docs/quick-reference.html).

## Location

```js
type Location = {
  pathname: string,
  search: string,
  state: Object,
}
```

## Route

```js
class Route {
  key: string;
  data: Object;
  params: { [key: string]: any };
  children: Route | ParallelRoutes;
}
```

## Junction

```js
type Junction = {
  [key: string]: Branch
}
```

## Branch

```js
type Branch = {
  key: string;
  data: Object;
  paramTypes: { [key: string]: ParamType };
  children: Junction | ParallelJunctions;
}
```

## ParamType

```js
type ParamType = {
  required: bool,
  default: any | () => any,
  serializer: Serializer,
}
```

## Serializer

```js
type Serializer = {
  serialize: (x: any) => string,
  deserialize: (x: string) => any,
}
```

## Converter

```js
type Converter = {
  route: (location: Location) => Route | ParallelRoutes;
  locate: (routes: Route | ParallelRoutes) => Location;
}
```

## Located Route

```js
class LocatedRoute extends Route {
  locate(Route | ParallelRoutes): Location;
}
```

## Parallel Routes

```js
type ParallelRoutes = {
  [key: string]: Route
}
```

## Parallel Junctions

```js
type ParallelJunctions = {
  [key: string]: Junctions
}
```
