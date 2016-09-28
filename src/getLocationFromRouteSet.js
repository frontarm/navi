function getJunctionsLocation(routeSet, isRouteInPath, parentJunctionPath, junctionSet) {
  let path
  const state = {}
  const query = {}

  const junctionKeys = Object.keys(routeSet)
  for (let i = 0, len = junctionKeys.length; i < len; i++) {
    const junctionKey = junctionKeys[i]
    const junctionPath = parentJunctionPath.concat(junctionKey)
    const route = routeSet[junctionKey]

    const isPrimaryRoute = isRouteInPath && getPrimaryJunctionKey(junctionSet) == junctionKey
    if (isPrimaryRoute) {
      path = formatPattern(primaryRoute.branch.pattern, primaryRoute.params)

      // TODO:
      // - add query from rest of params
      // - throw error if there are remaining params
    }
    else {
      state[junctionPath.join('/')] = {
        branchKey: route.branch.key,
        serializedParams: serializeParams(route.branch.params, route.params),
      }
    }

    const childLocation = getJunctionsLocation(
      route.children,
      isPrimaryRoute,
      junctionPath
    )

    Object.assign(state, childLocation.state)

    if (childLocation.path) {
      path += '/' + childLocation.path
    }

    // TODO: handle child location query
  }

  return { state, path, query }
}


// Convert a RouteSet into a Location object for the `history` package,
// which is used to actually perform navigation.
//
// See https://github.com/mjackson/history
export function getLocationFromRouteSet(baseLocation, routeSet, isRouteInPath=true, parentJunctionPath=[], junctionSet) {
  const { state, path, query } = getJunctionsLocation(routeSet, isRouteInPath, parentJunctionPath, junctionSet)

  return {
    pathname: baseLocation.pathname + (path ? '/' + path : ''),
    // TODO: search: mergeQueryStrings(baseLocation.search, createQueryString(query)),
    hash: baseLocation.hash,
    state: Object.assign({}, baseLocation.state, { [JUNCTIONS_STATE]: Object.assign(state, baseLocation.state[JUNCTIONS_STATE]) }),
    key: baseLocation.key,
  }
}
