import { serializeParams } from './SerializationUtils'
import { formatPattern } from './PatternUtils'


function getJunctionsLocation(isRouteInPath, parentJunctionPath, junctionSet, routeSet) {
  let path
  const state = {}
  const query = {}

  const junctionKeys = junctionSet.junctionKeys
  for (let i = 0, len = junctionKeys.length; i < len; i++) {
    const junctionKey = junctionKeys[i]
    const junctionPath = parentJunctionPath.concat(junctionKey)
    const route = routeSet[junctionKey]
    const branch = route.branch

    const isPrimaryRoute = isRouteInPath && junctionSet.primaryKey == junctionKey
    if (isPrimaryRoute) {
      path = formatPattern(primaryRoute.branch.pattern, primaryRoute.params)

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

  return {
    pathname: baseLocation.pathname + (path ? '/' + path : ''),
    // TODO: search: mergeQueryStrings(baseLocation.search, createQueryString(query)),
    hash: baseLocation.hash,
    state: Object.assign({}, baseLocation.state, { junctions: Object.assign(state, baseLocation.state.junctions) }),
    key: baseLocation.key,
  }
}
