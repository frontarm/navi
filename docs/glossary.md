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
  next: Route | { [key: string]: Route };
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
  default: boolean;
  path: string;
  data: Object;
  paramTypes: { [key: string]: ParamType };
  next: Junction | { [key: string]: Junction };
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
  route: (location: Location) => Route | { [key: string]: Route };
  locate: (...routes: Route[]) => Location;
}
```

## Located Route

```js
class LocatedRoute extends Route {
  locate(...routes: Route[]): Location;
}
```
