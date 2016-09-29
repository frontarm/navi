import { deserializeParams } from './SerializationUtils'
import { LocatedRoute } from './Routes'


function getDefaultChildren(baseLocation, isRouteInPath, junctionPath, branch) {
  const children = {}

  const junctionSet = branch.children
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

        Object.assign(route, getDefaultChildren(route.baseLocation, isBranchRouteInPath, routeJunctionPath, branch))
      }
    }
  }

  return children
}


export default function getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location) {
  // TODO:
  // - memoize by object equality of the previous invocation (only need memory size of 1)

  const basePath = baseLocation.path

  let path
  if (basePath) {
    if (location.pathname.indexOf(basePath) === -1) {
      throw new Error(`The specified "location" and "baseLocation" don't match. Expected location to start with "${basePath}" but instead found "${location.path}".`)
    }

    path = location.path.substr(basePath.length)
  }
  else {
    path = location.path || ''
  }

  const query = {} // TODO: extract query string params and add to state
  const state = Object.assign({}, location.state.junctions, parsePath(path))
  const routeSet = {}
  const baseSet = {}

  const walkOrder = Object.keys(state).sort()
  const junctionPaths = walkOrder.map(key => key.split('/'))
  for (let i = 0, len = walkOrder.length; i < len; i++) {
    const stateKey = walkOrder[i]
    const junctionPath = junctionPaths[i].split('/')
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
    const baseState = {}
    const basePath = [basePath]
    let j = 0
    while (j < i) {
      const stateKey = walkOrder[j]
      baseState[stateKey] = state[stateKey]
      if (state[stateKey].routePath) {
        basePath.push(state[stateKey].routePath)
      }
      j++
    }
    while (junctionPaths[j].length > junctionPath.length) {
      j++
    }
    while (j < len) {
      const stateKey = walkOrder[j]
      baseState[stateKey] = state[stateKey]
      j++
    }

    const routeBaseLocation = {
      pathname: basePath.join('/'),
      hash: baseLocation.hash,
      state: Object.assign({}, baseLocation.state, {
        junctions: baseState
      }),
      hash: baseLocation.query,
      // TODO: search
    } 

    const children = isChildless ? getDefaultChildren(routeBaseLocation, !!routePath, junctionPath, branch) : {}
    routeSetNode[key] = new LocatedRoute(routeBaseLocation, !!routePath, junctionPath, branch, params, children)
  }

  // TODO:
  // - walk routeSet and freeze everything
}
