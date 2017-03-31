import { LocatedRoute } from './Routes'
import { serializeParams, deserializeParams, addDefaultParams } from './Params'
import omit from './utils/omit'
import joinPaths from './utils/joinPaths'
import { formatPattern } from './utils/PatternUtils'


function getRouteBaseLocation(parentBaseLocation, isRouteInPath, junctionPath, branch, params) {
  if (isRouteInPath) {
    const queryParams = {}
    for (let i = 0, len = branch.queryKeys.length; i < len; i++) {
      const key = branch.queryKeys[i]
      const value = params[key]
      if (value !== undefined && value !== branch.paramTypes[key].default) {
        queryParams[key] = value
      }
    }

    const serializedQuery = serializeParams(branch.paramTypes, queryParams)
    const serializedPathParams = serializeParams(branch.paramTypes, omit(params, branch.queryKeys))

    const query = Object.assign({}, serializedQuery, parentBaseLocation.query)
    return {
      pathname: joinPaths(parentBaseLocation.pathname, formatPattern(branch.pattern, serializedPathParams)),
      query: query,
      hash: parentBaseLocation.hash,
      state: parentBaseLocation.state,
      key: parentBaseLocation.key,
    }
  }
  else {
    const baseState = parentBaseLocation.state || {}

    return {
      pathname: parentBaseLocation.pathname,
      query: parentBaseLocation.query,
      hash: parentBaseLocation.hash,
      state: Object.assign({}, baseState, {
        $$junctions: Object.assign({}, baseState.$$junctions, {
          [junctionPath.join('#')]: {
            branchKey: branch.key,
            serializedParams: serializeParams(branch.paramTypes, params),
          }
        }),
      }),
      key: parentBaseLocation.key,
    }
  }
}


function createLocatedRouteSetFor(junctionSetMeta, parentRouteOptions, routeSetOptions={}) {
  const routeSet = {}
  const junctionKeys = junctionSetMeta.junctionKeys

  for (let i = 0, len = junctionKeys.length; i < len; i++) {
    const key = junctionKeys[i]
    
    if (routeSetOptions[key]) {
      const routeOptions = routeSetOptions[key]
      const childJunctionSet = junctionSetMeta.junctions[key].$$junctionMeta.branches[routeOptions.branch.key].next
      const routeNext = childJunctionSet && createLocatedRouteSetFor(childJunctionSet.$$junctionSetMeta, routeOptions, routeOptions.next)

      routeSet[key] = new LocatedRoute(
        routeOptions.baseLocation,
        routeOptions.isRouteInPath,
        routeOptions.junctionPath,
        routeOptions.branch,
        routeOptions.params,
        routeNext
      )
    }
    else {
      const junctionMeta = junctionSetMeta.junctions[key].$$junctionMeta

      if (junctionMeta.defaultKey) {
        const branch = junctionMeta.branches[junctionMeta.defaultKey]
        const routeJunctionPath = parentRouteOptions.junctionPath.concat(key)
        const isBranchRouteInPath = parentRouteOptions.isRouteInPath && key == junctionSetMeta.primaryKey
        const routeParams = addDefaultParams(branch.paramTypes)
        const routeBaseLocation = getRouteBaseLocation(parentRouteOptions.baseLocation, parentRouteOptions.isRouteInPath, routeJunctionPath, branch, routeParams)

        const defaultRouteOptions = {
          baseLocation: routeBaseLocation,
          isRouteInPath: isBranchRouteInPath,
          junctionPath: routeJunctionPath,
          branch,
          params: routeParams,
        }

        const routeNext = branch.next && createLocatedRouteSetFor(branch.next.$$junctionSetMeta, defaultRouteOptions)

        routeSet[key] = new LocatedRoute(
          routeBaseLocation,
          isBranchRouteInPath,
          routeJunctionPath,
          branch,
          routeParams,
          routeNext
        )
      }
    }
  }

  return routeSet
}


export default function getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location) {
  // TODO:
  // - memoize by object equality of the previous invocation (only need memory size of 1)

  // TODO:
  // - if junctionSet's main junction is a hostname junction, merge the hostname into the
  //   beginning of the location path

  const basePath = baseLocation.pathname || ''

  const locationState = location.state || {}

  let path
  if (basePath) {
    if (location.pathname.indexOf(basePath) === -1) {
      throw new Error(`The specified "location" and "baseLocation" don't match. Expected location to start with "${basePath}" but instead found "${location.path}".`)
    }

    path = location.pathname.substr(basePath.length)
  }
  else {
    path = location.pathname || ''
  }


  const query = omit(location.query, Object.keys(baseLocation.query))
  let pathState = {}
  if (path !== '') {
    pathState = parsePath(path, query)
    if (!pathState) {
      return
    }
  }

  const state = Object.assign({}, locationState.$$junctions, pathState)
  const routeSetOptions = {}
  const baseSet = {}
  const rootParentOptions = {
    baseLocation,
    isRouteInPath: true,
    junctionPath: [],
  }

  const walkOrder = Object.keys(state).sort()

  if (walkOrder.length === 0) {
    // We have a valid path but no state, so use defaults on the root junctions
    const routeSet = createLocatedRouteSetFor(junctionSet.$$junctionSetMeta, rootParentOptions, routeSetOptions)

    // Emit null insteaed of undefined to indicate that it is still a known route
    return junctionSet.$$junctionSetMeta.isSingle ? (routeSet.main || null) : routeSet
  }

  const junctionPaths = walkOrder.map(key => key.split('#'))
  for (let i = 0, len = walkOrder.length; i < len; i++) {
    const stateKey = walkOrder[i]
    const junctionPath = junctionPaths[i]
    const key = junctionPath.slice(-1)
    
    let routeSetOptionsNode = routeSetOptions
    let junctionSetNode = junctionSet
    for (let i = 0, len = junctionPath.length - 1; i < len; i++) {
      const key = junctionPath[i]
      const junctionNode = junctionSetNode[key]
      const routeOptionsNode = routeSetOptionsNode[key]
      routeSetOptionsNode = routeOptionsNode.next
      junctionSetNode = junctionNode[routeOptionsNode.branch.key].next
    }

    const junction = junctionSetNode[key]
    const { branchKey, serializedParams, routePath } = state[stateKey]
    const branch = junction[branchKey]
    const params = addDefaultParams(branch.paramTypes, deserializeParams(branch.paramTypes, serializedParams))
    const isRouteInPath = !!routePath

    // Copy all state paths except our next
    const newBaseState = {}
    const newBaseQuery = {}
    let newBasePath = basePath
    let j = 0
    while (j < i) {
      const stateKey = walkOrder[j]
      // Only state keys returned by the path parser have a `routePath` attribute,
      // so we can use these to build our basePath
      if (state[stateKey].routePath) {
        newBasePath = joinPaths(basePath, state[stateKey].routePath)

        if (state[stateKey].queryParts) {
          Object.assign(newBaseQuery, state[stateKey].queryParts)
        }
      }
      else {
        newBaseState[stateKey] = state[stateKey]
      }
      j++
    }
    while (j < len && junctionPaths[j].length >= junctionPath.length) {
      j++
    }
    while (j < len) {
      const stateKey = walkOrder[j]
      newBaseState[stateKey] = state[stateKey]
      j++
    }

    const routeParentBaseLocation = {
      pathname: newBasePath,
      hash: baseLocation.hash,
      state: Object.assign({}, baseLocation.state, {
        $$junctions: newBaseState
      }),
      query: Object.assign({}, baseLocation.query, newBaseQuery),
    }
    
    routeSetOptionsNode[key] = {
      baseLocation: getRouteBaseLocation(routeParentBaseLocation, isRouteInPath, junctionPath, branch, params),
      isRouteInPath,
      junctionPath,
      branch,
      params,
      next: {}
    }
  }

  const routeSet = createLocatedRouteSetFor(junctionSet.$$junctionSetMeta, rootParentOptions, routeSetOptions)

  // Emit null insteaed of undefined to indicate that it is still a known route
  return junctionSet.$$junctionSetMeta.isSingle ? (routeSet.main || null) : routeSet
}
