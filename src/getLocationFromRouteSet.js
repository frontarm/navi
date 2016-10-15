import joinPaths from './utils/joinPaths'
import { formatPattern } from './utils/PatternUtils'
import { serializeParams } from './utils/SerializationUtils'


function getJunctionsLocation(isRouteInPath, parentJunctionPath, junctionSet, routeSet) {
  let path
  const state = {}
  const query = {}

  const routeKeys = Object.keys(routeSet)
  for (let i = 0, len = routeKeys.length; i < len; i++) {
    const routeKey = routeKeys[i]
    const junctionPath = parentJunctionPath.concat(routeKey)
    const route = routeSet[routeKey]

    if (route) {
      const branch = route.branch
      const serializedParams = serializeParams(branch.params, route.params)

      const isPrimaryRoute = isRouteInPath && junctionSet.$$junctionSetMeta.primaryKey == routeKey
      if (isPrimaryRoute) {
        for (let i = 0, len = branch.queryKeys.length; i < len; i++) {
          const key = branch.queryKeys[i]
          const value = serializedParams[key] 
          if (value !== undefined && route.params[key] !== branch.params[key].default) {
            query[key] = value
          }
          delete serializedParams[key]
        }

        path = formatPattern(branch.pattern, serializedParams)
      }
      else {
        state[junctionPath.join('/')] = {
          branchKey: branch.key,
          serializedParams: serializedParams,
        }
      }

      if (branch.children) {
        const childLocation = getJunctionsLocation(isPrimaryRoute, junctionPath, branch.children, route.children)

        Object.assign(state, childLocation.state)
        Object.assign(query, childLocation.query)

        if (childLocation.path) {
          path += '/' + childLocation.path
        }
      }
    }
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
  const finalQuery = Object.assign({}, baseLocation.query, query)

  return {
    pathname: joinPaths(baseLocation.pathname, path),
    hash: baseLocation.hash,
    state: Object.assign({}, baseState, { $$junctions: Object.assign(state, baseState.$$junctions) }),
    key: baseLocation.key,
    query: finalQuery,
  }
}
