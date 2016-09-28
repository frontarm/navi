
function getRouteBaseLocation(branch, baseLocation, params, junctionPath) {
  if (isRouteInPath) {
    const path = formatPattern(branch.pattern, params)
    const query = {} // TODO: handle query
    return {
      pathname: baseLocation.pathname + '/' + path,
      // TODO: search: mergeQueryStrings(baseLocation.search, createQueryString(query)),
      hash: baseLocation.hash,
      state: baseLocation.state,
      key: baseLocation.key,
    }
  }
  else {
    return {
      pathname: baseLocation.pathname,
      // TODO: search: mergeQueryStrings(baseLocation.search, createQueryString(query)),
      hash: baseLocation.hash,
      state: Object.assign({}, baseLocation.state, {
        [JUNCTIONS_STATE]: Object.assign({}, baseLocation.state[JUNCTIONS_STATE], {
          [junctionPath.join('/')]: {
            branchKey: branch.key,
            serializedParams: serializeParams(params),
          }
        }),
      }),
      key: baseLocation.key,
    }
  }
}


function getDefaultParams(branch, knownParams={}) {
  const paramTypes = branch.paramTypes
  const paramKeys = Object.keys(knownParams)
  const remainingParamKeys = Object.keys(paramTypes)
  const paramsCopy = Object.assign({}, knownParams)

  for (let i = 0, len = paramKeys.length; i < len; i++) {
    const key = paramKeys[i]
    const paramType = paramTypes[key]

    if (!paramType) {
      throw new Error(`Could not create a route. A param with key '${key}' was specified, but this key is not listed in the corresponding Branche's params.`)
    }

    remainingParamKeys.splice(remainingParamKeys.indexOf(key), 1)
  }

  for (let i = 0, len = remainingParamKeys.length; i < len; i++) {
    const key = remainingParamKeys[i]
    const paramType = paramTypes[key]

    if (paramType.default) {
      paramsCopy[key] = paramType.default
    }
    else if (paramType.required) {
      throw new Error(`Cannot create route without required key '${key}'`)
    }
  }
}


class Route {
  constructor(branch, params, children={}) {
    this.branch = branch
    this.data = branch.data
    this.params = getDefaultParams(branch, params)
    this.children = children
  }

  get getLocation() {
    throw new Error(`You cannot access the 'getLocation' function on routes created directly with Branch. Instead, use the 'link' passed in via your component's props.`)
  }
}

class LocatedRoute extends Route {
  constructor(branch, params, children, baseLocation, isRouteInPath, junctionPath) {
    super(branch, params, children)

    this.baseLocation = getRouteBaseLocation(branch, baseLocation, params, junctionPath)
    this.isRouteInPath = isRouteInPath
    this.junctionPath = junctionPath
  }
  
  getLocation(routeSet) {
    return (
      routeSet
        ? getLocationFromRouteSet(this.baseLocation, routeSet, this.isRouteInPath, this.junctionPath, this.branch.children)
        : baseLocation
    )
  }
}
