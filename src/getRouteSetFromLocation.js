
function getDefaultChildren(branch, baseLocation, isRouteInPath, junctionPath) {
  const children = {}

  const junctionSet = branch.children
  if (junctionSet && junctionSet.junctions) {
    const junctionKeys = Object.keys(junctionSet.junctions)
    for (let i = 0, len = junctionKeys.length; i < len; i++) {
      const key = junctionKeys[i]
      const junction = junctionSet.junctions[key]
      const defaultBranchKey = junction[DEFAULT_KEY]

      if (defaultBranchKey) {
        const branch = junction[defaultBranchKey]
        const routeJunctionPath = junctionPath.concat(key)
        const routeChildren = {}
        const isBranchRouteInPath = isRouteInPath && key == getPrimaryJunctionKey(junctionSet)
        
        children[key] = new LocatedRoute(
          branch,
          routeChildren,
          baseLocation,
          isBranchRouteInPath,
          routeJunctionPath
        )

        Object.assign(routeChildren, getDefaultChildren(branch, children[key].baseLocation, isBranchRouteInPath, routeJunctionPath),)
      }
    }
  }

  return children
}


export function getRouteSetFromLocation(location, parsePath, junctionSet, baseLocation) {
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
  const state = Object.assign({}, location.state[JUNCTIONS_STATE], parsePath(path))
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
    const baseState = {}
    const basePath = [basePath]
    let j = 0
    let key
    while (j < i)
      key = walkOrder[j]
      baseState[key] = state[key]
      if (state[key].routePath) {
        basePath.push(state[key].routePath)
      }
      j++
    }
    while (junctionPaths[j].length > junctionPath.length) {
      j++
    }
    while (j < len) {
      key = walkOrder[j]
      baseState[key] = state[key]
      j++
    }

    const routeBaseLocation = {
      pathname: basePath.join('/'),
      hash: baseLocation.hash,
      state: Object.assign({}, baseLocation.state, {
        [JUNCTIONS_STATE]: baseState
      })
      hash: baseLocation.query,
      // TODO: search
    } 

    const children = isChildless ? getDefaultChildren(branch, routeBaseLocation, !!routePath, junctionPath) : {}
    
    routeSetNode[key] = new LocatedRoute(branch, params, children, routeBaseLocation, !!routePath, junctionPath)
  }

  // TODO:
  // - walk routeSet and freeze everything
}
