import { compilePattern } from './PatternUtils'
import hyphenize from './hyphenize'


const IS_JUNCTION = Symbol()
const IS_BRANCH = Symbol()
const IS_ROUTE = Symbol()
const IS_TYPE = Symbol()
const IS_PARAM = Symbol()

const JUNCTIONS_STATE = Symbol()

const DEFAULT_BRANCH = Symbol()


export function Junction(branches, def) {
  if (branches.link) {
    throw new Error(`A Junction was created with a 'link' key, but this key is reserved for use by react-navi.`)
  }
  if (def && !branches[def]) {
    throw new Error(`The key '${def}' was specified for a Junction's default value, but no matching branch was given.`)
  }

  var junction = {}
  var branchKeys = Object.keys(branches)
  for (var i = 0, len = branchKeys.length; i < len; i++) {
    var key = branchKeys[i]
    var branch = branches[key]

    // TODO: ensure key is alphanumeric

    if (!branch[IS_BRANCH]) {
      throw new Error(`An object was passed to Junction which is not a Branch. See key '${key}'.`)
    }

    if (!branch.pattern) {
      Object.assign(branch, { pattern: createDefaultPattern(key, branch.params) })
    }

    junction[key] = branch
  }

  // TODO: extract key from pattern, with rule:
  // - if first component is a placeholder, use ':'
  // - otherwise use the value between two slashes

  // TODO: enforce that no two branches have the same key

  Object.defineProperty(junction, IS_JUNCTION, { value: true })

  if (def) {
    Object.defineProperty(junction, DEFAULT_BRANCH, { value: def })
  }
    
  return junction
}


export function Branch(options = {}) {
  var data = Object.freeze(options.data || {})
  var paramTypes = options.paramTypes || {}

  if (data === undefined && typeof data !== 'object') {
    throw new Error(`The data option to Branch must be an object, if given.`)
  }
  if ('children' in options && !options.children) {
    throw new Error(`A 'children' key was specified for a Branch, but no value was specified.`)
  }

  function createRoute(params={}, children={}) {
    var paramKeys = Object.keys(params)
    var remainingParamKeys = Object.keys(paramTypes)

    params = Object.assign({}, params)
    
    for (var i = 0, len = paramKeys.length; i < len; i++) {
      var key = paramKeys[i]
      var paramType = paramTypes[key]

      if (!paramType) {
        throw new Error(`Could not create a route. A param with key '${key}' was specified, but this key is not listed in the corresponding Branche's params.`)
      }

      remainingParamKeys.splice(remainingParamKeys.indexOf(key), 1)
    }

    for (var i = 0, len = remainingParamKeys.length; i < len; i++) {
      var key = remainingParamKeys[i]
      var paramType = paramTypes[key]

      if (paramType.default) {
        params[key] = paramType.default
      }
      else if (paramType.required) {
        throw new Error(`Cannot create route without required key '${key}'`)
      }
    }

    var route = {
      params: params,
      data: data,
      children: children,
      branch: createRoute,
      get link() {
        throw new Error(`You cannot access the 'link' function on routes created directly with Branch. Instead, use the 'link' passed in via your component's props.`)
      }
    }

    Object.defineProperty(route, IS_ROUTE, { value: true })

    return Object.freeze(route)
  }

  // TODO:
  // - ensure reserved characters including * are not used in pattern
  // - split pattern into parts which can be used with the lookup tree, complain if anything doesn't make sense

  createRoute.pattern = options.pattern && compilePattern(options.pattern)
  // TODO:
  // - createRoute.aliases: a set of alias patterns which redirect to the primary pattern
  createRoute.data = data
  createRoute.params = paramTypes

  if (options.children) {
    createRoute.children = options.children
  }

  Object.defineProperty(createRoute, IS_BRANCH, { value: true })

  // TODO:
  // - figure out how to assocoiate a `link` method with a constant branch

  return createRoute
}


export function Param(options = {}) {
  if (options.type && !options.type[IS_TYPE]) {
    throw new Error (`Param expects the 'type' option to an object returned by react-navi's Type function.`)
  }

  const param = {
    default: options.default,
    required: options.required || false,
    hidden: options.hidden || false,
    type: options.type || nonEmptyStringType,
  }

  Object.defineProperty(param, IS_PARAM, { value: true })

  return param
}


export function Type(options) {
  if (
    !options ||
    typeof options.serialize !== 'function' ||
    typeof options.deserialize !== 'function' ||
    typeof options.exists !== 'function'
  ) {
    throw new Error(`A react-navi Type must specify serialize, deserialize and exists functions`)
  }

  const type = Object.assign({}, options)

  Object.defineProperty(type, IS_TYPE, { value: true })

  return type
}


const nonEmptyStringType = Type({
  serialize: x => x || '',
  deserialize: x => x == '' ? null : x,
  exists: x => x !== '',
})


function createDefaultPattern(key, paramTypes) {
  return compilePattern(
    [hyphenize(key)]
      .concat(
        Object.entries(paramTypes)
          .filter(entry => entry.required || entry.default)
          .map(([key]) => ':'+key)
      )
      .join('/')
  )
}

export function desugarLinkOptions(routeOrKeyedRoutes, keyedJunctions) {
  // if given a route, turn it into a set of keyed routes with the other keys being empty
}

export function getPrimaryJunction(junctionSet) {
  return 'primaryJunction' in junctionSet ? junctionSet.primaryJunction : Object.values(junctionSet.junctions)[0]
}




function lookupTreeReducer(tree, part) {
  return tree && (tree[part] || tree[':'])
}

class LookupTree() {
  constructor() {
    this.tree = {}
  }

  find(parts) {
    return (parts.reduce(lookupTreeReducer, this.tree) || {})['']  
  }

  add(parts, data) {
    var i, branch
    var branches = parts.map(function(part) { return part[0] == ':' ? ':' : part })
    var currentTree = this.tree

    for (i = 0; i < branches.length; i++) {
      branch = branches[i]  
      if (!currentTree[branch]) {
        currentTree[branch] = {}
      }
      currentTree = currentTree[branch]
    }

    assert(
      !currentTree[branch],
      "Path `%s` conflicts with another path", parts.join('/')
    )

    currentTree[''] = data
  }
}


class Route {
  // - branch
  // - params
  // - data
  // - children: RouteSet
}

class LocatedRoute extends Route {
  // - isRouteInPath: boolean
  // - baseLocation
  //   The location of this Route, excluding children
  // - getLocation: (RouteSet) => Location
  //   Take a RouteSet of the same type of JunctionSet as Route, and return a Location to it
  
  getLocation(routeSet) {
    // - create a copy of baseLocation
    // - add path for primary child branch if isRouteInPath
    // - add state for remaining child branches
    // - recurse, somehow
  }
}


export function getLocatedRoutes(location, junctionSet, baseLocation) {
  // - memoize by object equality of the previous invocation (only need memory size of 1)

  // - filter out baseLocation's path from location's path
  // - use lookup tree to return an array of branch keys and associated string parts along the remaining path
  // - combine junctionSet w/ the returned string parts to pull out actual branch and serialized params
  // - extract query string params and add them to state as well
  // - add these branch keys and params to 
  // - add the remaining part of the path to location's state
  // - walk down location[JUNCTIONS_STATE] until we find something which doesn't mirror baseLocation
  // - create routes from this, recursively calling getLocatedRoutes w/ a further narrowed down base location
  // - if we encounter something with no children which expects a default, add it in
}


export function createLocationFactory(junctionSet, baseLocation) {
  return routeSet => {

  }
}
