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
    const baseState = baseLocation.state || {}

    return {
      pathname: baseLocation.pathname,
      // TODO: search: mergeQueryStrings(baseLocation.search, createQueryString(query)),
      hash: baseLocation.hash,
      state: Object.assign({}, baseState, {
        junctions: Object.assign({}, baseState.junctions, {
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
    const defaultParam = branchParam.default
    if (defaultParam) {
      paramsCopy[key] = typeof defaultParam == 'function' ? defaultParam() : defaultParam
    }
    else if (branchParam.required) {
      throw new Error(`Cannot create route without required key '${key}'`)
    }
  }

  return paramsCopy
}


export class Route {
  constructor(branch, params={}, children={}) {
    const childKeys = Object.keys(children)
    for (let i = 0, len = childKeys.length; i < len; i++) {
      const key = childKeys[i]
      if (!branch.children.junctions[key]) {
        throw new Error(`A Route cannot be created with child key "${key}" which is not in the associated branch's children`)
      }
      if (children[key] && !(children[key] instanceof Route)) {
        throw new Error(`A Route cannot be created with a non-Route child (see child key "${key}")`)
      }
      if (children[key] && !branch.children.junctions[key].branchValues.includes(children[key].branch)) {
        throw new Error(`A Route cannot be created with an unknown Branch type for key "${key}"`)
      }
    }

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

    this.baseLocation = getRouteBaseLocation(parentBaseLocation, isRouteInPath, junctionPath, branch, this.params)
    this.isRouteInPath = isRouteInPath
    this.junctionPath = junctionPath
  }
  
  getLocation(routeSet) {
    return (
      routeSet
        ? getLocationFromRouteSet(this.baseLocation, this.isRouteInPath, this.junctionPath, this.branch.children, routeSet)
        : this.baseLocation
    )
  }
}
