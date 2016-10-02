import { deserializeParams } from './SerializationUtils'
import { LocatedRoute } from './Routes'


function getDefaultChildren(baseLocation, isRouteInPath, junctionPath, junctionSet) {
  const children = {}

  if (junctionSet && junctionSet.junctions) {
    const junctionKeys = junctionSet.junctionKeys
    for (let i = 0, len = junctionKeys.length; i < len; i++) {
      const key = junctionKeys[i]
      const junction = junctionSet.junctions[key]
      
      if (junction.defaultKey) {
        const branch = junction.branches[junction.defaultKey]
        const routeJunctionPath = junctionPath.concat(key)
        const isBranchRouteInPath = isRouteInPath && key == junctionSet.primaryKey
        const route = children[key] = new LocatedRoute(baseLocation, isBranchRouteInPath, routeJunctionPath, branch)

        Object.assign(route.children, getDefaultChildren(route.baseLocation, isBranchRouteInPath, routeJunctionPath, branch.children))
      }
    }
  }

  return children
}


export default function getRouteSetFromLocation(parsePath, _baseLocation, junctionSet, location) {
  // TODO:
  // - memoize by object equality of the previous invocation (only need memory size of 1)

  const baseLocation = _baseLocation || {}
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

  let pathState = {}
  if (path !== '') {
    pathState = parsePath(path)
    if (!pathState) {
      return
    }
  }

  const query = {} // TODO: extract query string params and add to state
  const state = Object.assign({}, locationState.junctions, pathState)
  const routeSet = {}
  const baseSet = {}

  const walkOrder = Object.keys(state).sort()

  if (walkOrder.length === 0) {
    // We have a valid path but no state, so use defaults on the root junctions
    return getDefaultChildren(baseLocation, true, [], junctionSet)
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
      const junctionNode = junctionSetNode.junctions[key]
      const routeNode = routeSetNode[key]
      routeSetNode = routeNode.children
      junctionSetNode = junctionNode.branches[routeNode.branch.key].children
    }

    const junction = junctionSetNode.junctions[key]
    const { branchKey, serializedParams, routePath } = state[stateKey]
    const branch = junction.branches[branchKey]
    const params = deserializeParams(branch.params, serializedParams)

    // Copy all state paths except our children
    const newBaseState = {}
    const newBasePath = [basePath || '']
    let j = 0
    while (j < i) {
      const stateKey = walkOrder[j]
      // Only state keys returned by the path parser have a `routePath` attribute,
      // so we can use these to build our basePath
      if (state[stateKey].routePath) {
        newBasePath.push(state[stateKey].routePath)
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
        junctions: newBaseState
      }),
      // TODO: search
      search: baseLocation.search,
    } 

    const children = isChildless ? getDefaultChildren(routeBaseLocation, !!routePath, junctionPath, branch.children) : {}
    routeSetNode[key] = new LocatedRoute(routeBaseLocation, !!routePath, junctionPath, branch, params, children)
  }

  // TODO:
  // - walk routeSet and freeze everything
  
  return routeSet
}
