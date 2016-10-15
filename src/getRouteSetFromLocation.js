import { LocatedRoute } from './Routes'
import omit from './utils/omit'
import { deserializeParams } from './utils/SerializationUtils'


function getDefaultChildren(baseLocation, isRouteInPath, junctionPath, junctionSetMeta) {
  const children = {}
  const junctionKeys = junctionSetMeta.junctionKeys
  for (let i = 0, len = junctionKeys.length; i < len; i++) {
    const key = junctionKeys[i]
    const junctionMeta = junctionSetMeta.junctions[key].$$junctionMeta
    
    if (junctionMeta.defaultKey) {
      const branch = junctionMeta.branches[junctionMeta.defaultKey]
      const routeJunctionPath = junctionPath.concat(key)
      const isBranchRouteInPath = isRouteInPath && key == junctionSetMeta.primaryKey
      const route = children[key] = new LocatedRoute(baseLocation, isBranchRouteInPath, routeJunctionPath, branch)

      if (branch.children) {
        Object.assign(route.children, getDefaultChildren(route.baseLocation, isBranchRouteInPath, routeJunctionPath, branch.children.$$junctionSetMeta))
      }
    }
  }

  return children
}


export default function getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location) {
  // TODO:
  // - memoize by object equality of the previous invocation (only need memory size of 1)

  const basePath = baseLocation.pathname

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
  const routeSet = {}
  const baseSet = {}

  const walkOrder = Object.keys(state).sort()

  if (walkOrder.length === 0) {
    // We have a valid path but no state, so use defaults on the root junctions
    return getDefaultChildren(baseLocation, true, [], junctionSet.$$junctionSetMeta)
  }

  const junctionPaths = walkOrder.map(key => key.split('/'))
  for (let i = 0, len = walkOrder.length; i < len; i++) {
    const stateKey = walkOrder[i]
    const junctionPath = junctionPaths[i]
    const isChildless = (i == walkOrder.length - 1) || junctionPaths[i + 1].length <= junctionPath.length
    const key = junctionPath.slice(-1)
    
    let routeSetNode = routeSet
    let junctionSetNode = junctionSet
    for (let i = 0, len = junctionPath.length - 1; i < len; i++) {
      const key = junctionPath[i]
      const junctionNode = junctionSetNode[key]
      const routeNode = routeSetNode[key]
      routeSetNode = routeNode.children
      junctionSetNode = junctionNode[routeNode.branch.key].children
    }

    const junction = junctionSetNode[key]
    const { branchKey, serializedParams, routePath } = state[stateKey]
    const branch = junction[branchKey]
    const params = deserializeParams(branch.params, serializedParams)

    // Copy all state paths except our children
    const newBaseState = {}
    const newBaseQuery = {}
    const newBasePath = [basePath || '']
    let j = 0
    while (j < i) {
      const stateKey = walkOrder[j]
      // Only state keys returned by the path parser have a `routePath` attribute,
      // so we can use these to build our basePath
      if (state[stateKey].routePath) {
        newBasePath.push(state[stateKey].routePath)

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

    const routeBaseLocation = {
      pathname: newBasePath.join('/'),
      hash: baseLocation.hash,
      state: Object.assign({}, baseLocation.state, {
        $$junctions: newBaseState
      }),
      query: Object.assign({}, baseLocation.query, newBaseQuery),
    } 

    const children =
      isChildless && branch.children
        ? getDefaultChildren(routeBaseLocation, !!routePath, junctionPath, branch.children.$$junctionSetMeta)
        : {}

    routeSetNode[key] = new LocatedRoute(routeBaseLocation, !!routePath, junctionPath, branch, params, children)
  }

  // TODO:
  // - walk routeSet and freeze all routes and route sets
  
  return routeSet
}
