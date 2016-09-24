# Design

JunctionSet(primary=key1)

- key1: Junction
  - branch (default)
    - pathPattern
    - paramTypes
    - junctions
    - primaryJunction
  - branch

- key2: Junction
  - branch
    - pathPattern

- key3: Junction
  - branch (default)
  - branch


RouteSet(JunctionSet)

- key1: Route (branch, params, children: RouteSet)
- key2: Route (branch, params)
- key3: Route (branch, params)


---

State tree:

- key1:
  - branch key
  - serialized param values
  - children

---

API:

- getLocatedRoutes: (junctionSet, location, baseLocation) => LocatedRouteSet
  Take a `history` location and junctionSet, and the `base location` (i.e. where
  the junction set is mounted). Return a Located Route Set, i.e. a route tree
  with `locate` functions which allow new Locations to be created to child
  locations within that route tree.


Route
- branch
- params
- data
- children: RouteSet

RouteSet
- [key]: Route

LocatedRoute extends Route
- isRouteInPath: boolean
- baseLocation
  The location of this Route, excluding children
- getLocation: (RouteSet) => Location
  Take a RouteSet of the same type of JunctionSet as Route, and return a Location to it

LocatedRouteSet
- [key]: LocatedRoute


Sugar:

<Link to={route}> / <LinkContext currentRoute={this.props.route}> / <HistoryContext history={}>
- Like react-router's link, but the context to check if the given route is the current
  route is, and to figure out the parent location, is specified with a LinkContext
- Forces re-render of appropriate Links when routes/locate updates
- Attempt to make sure nobody else can use the context of LinkContext

withJunctions(junctions, primary)
- Adds a LinkContext, adds propTypes to confirm we receive `route`, and
  sets `junctions` / `primaryJunction` as static properties


react-router adapter:

- create a route, and onEnter:
  - find baseLocation from `routes`
  - find current route from History.Location using `getLocatedRoutes`
  - get Location for the current route. If different from the input route, run `replace`
