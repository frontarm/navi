import { serializeParams } from './SerializationUtils'
import { formatPattern } from './PatternUtils'


function getJunctionsLocation(isRouteInPath, parentJunctionPath, junctionSet, routeSet) {
  let path
  const state = {}
  const query = {}

  const routeKeys = Object.keys(routeSet)
  for (let i = 0, len = routeKeys.length; i < len; i++) {
    const routeKey = routeKeys[i]
    const junctionPath = parentJunctionPath.concat(routeKey)
    const route = routeSet[routeKey]
    const branch = route.branch

    const isPrimaryRoute = isRouteInPath && junctionSet.primaryKey == routeKey
    if (isPrimaryRoute) {
      path = formatPattern(route.branch.pattern, route.params)

      // TODO:
      // - add query from rest of params
      // - throw error if there are remaining params
    }
    else {
      state[junctionPath.join('/')] = {
        branchKey: branch.key,
        serializedParams: serializeParams(route.branch.params, route.params),
      }
    }

    if (branch.children) {
      const childLocation = getJunctionsLocation(isPrimaryRoute, junctionPath, branch.children, route.children)

      Object.assign(state, childLocation.state)

      if (childLocation.path) {
        path += '/' + childLocation.path
      }
    }

    // TODO: handle child location query
  }

  return { state, path, query }
}


// Convert a RouteSet into a Location object for the `history` package,
// which is used to actually perform navigation.
//
// See https://github.com/mjackson/history
export default function getLocationFromRouteSet(baseLocation, isRouteInPath, parentJunctionPath, junctionSet, routeSet) {
  const { state, path, query } = getJunctionsLocation(isRouteInPath, parentJunctionPath, junctionSet, routeSet)
  const baseState = baseLocation.state || {}

  return {
    pathname: baseLocation.pathname + (path ? ((baseLocation.pathname.substr(-1) === '/' ? '' : '/') + path) : ''),
    hash: baseLocation.hash,
    state: Object.assign({}, baseState, { junctions: Object.assign(state, baseState.junctions) }),
    key: baseLocation.key,

    // TODO: search: mergeQueryStrings(baseLocation.search, createQueryString(query)),
    search: baseLocation.search,
  }
}
