import { formatPattern } from './PatternUtils'
import { serializeParams } from './SerializationUtils'
import getLocationFromRouteSet from './getLocationFromRouteSet'


function getRouteBaseLocation(baseLocation, isRouteInPath, junctionPath, branch, params) {
  if (isRouteInPath) {
    // TODO: put hidden params in state regardless

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
        junctions: Object.assign({}, baseLocation.state.junctions, {
          [junctionPath.join('/')]: {
            branchKey: branch.key,
            serializedParams: serializeParams(branch.params, params),
          }
        }),
      }),
      key: baseLocation.key,
    }
  }
}


function getDefaultParams(branchParams, knownParams={}) {
  const paramKeys = Object.keys(knownParams)
  const remainingParamKeys = Object.keys(branchParams)
  const paramsCopy = Object.assign({}, knownParams)

  for (let i = 0, len = paramKeys.length; i < len; i++) {
    const key = paramKeys[i]
    const branchParam = branchParams[key]

    if (!branchParam) {
      throw new Error(`Could not create a route. A param with key '${key}' was specified, but this key is not listed in the corresponding Branche's params.`)
    }

    remainingParamKeys.splice(remainingParamKeys.indexOf(key), 1)
  }

  for (let i = 0, len = remainingParamKeys.length; i < len; i++) {
    const key = remainingParamKeys[i]
    const branchParam = branchParams[key]

    if (branchParam.default) {
      paramsCopy[key] = branchParam.default
    }
    else if (branchParam.required) {
      throw new Error(`Cannot create route without required key '${key}'`)
    }
  }

  return paramsCopy
}


export class Route {
  constructor(branch, params={}, children={}) {
    this.branch = branch
    this.data = branch.data
    this.params = getDefaultParams(branch.params, params)
    this.children = children
  }

  get getLocation() {
    throw new Error(`You cannot access the 'getLocation' function on routes created directly with Branch. Instead, use the 'link' passed in via your component's props.`)
  }
}

export class LocatedRoute extends Route {
  constructor(parentBaseLocation, isRouteInPath, junctionPath, branch, params, children) {
    super(branch, params, children)

    this.baseLocation = getRouteBaseLocation(parentBaseLocation, isRouteInPath, junctionPath, branch, params)
    this.isRouteInPath = isRouteInPath
    this.junctionPath = junctionPath
  }
  
  getLocation(routeSet) {
    return (
      routeSet
        ? getLocationFromRouteSet(this.baseLocation, this.isRouteInPath, this.junctionPath, this.branch.children, routeSet)
        : baseLocation
    )
  }
}
