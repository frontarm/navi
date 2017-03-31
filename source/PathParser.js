export function createPathParser(junctionSet) {
  const tree = {}
  const queue = [[junctionSet.$$junctionSetMeta, tree, []]]
  while (queue.length) {
    const [junctionSetMetaNode, treeNode, junctionPath] = queue.shift()
    const primaryJunctionKey = junctionSetMetaNode.primaryKey

    if (primaryJunctionKey) {
      const primaryJunction = junctionSetMetaNode.junctions[primaryJunctionKey]
      const branchKeys = primaryJunction.$$junctionMeta.branchKeys
      const nextJunctionPath = junctionPath.concat(primaryJunctionKey)

      for (let i = 0, len = branchKeys.length; i < len; i++) {
        const branch = primaryJunction[branchKeys[i]]
        const parts = branch.pattern.parts
        const finalIndex = parts.length - 1
        let intermediateNode = treeNode
        for (let j = 0; j < finalIndex; j++) {
          const part = parts[j] || ':'
          if (!intermediateNode[part]) {
            intermediateNode[part] = { childNode: {} }
          }
          else if (intermediateNode[part].branch) {
            throw new Error('Conflicting paths')
          }
          intermediateNode = intermediateNode[part].childNode
        }
        const finalPart = parts[finalIndex] || ':'
        const childNode = {}
        intermediateNode[finalPart] = {
          branch,
          childNode,
          junctionPath: nextJunctionPath.join('#'),
        }
        if (branch.next) {
          queue.push([branch.next.$$junctionSetMeta, childNode, nextJunctionPath])
        }
      }
    }
  }

  return function parsePath(path, query) {
    const strippedPath = path.replace(/^\/|\/($|\?)/g, '')
    const branches = {}

    if (strippedPath === '') {
      return
    }

    let serializedParamValues = []
    let pathParts = strippedPath.split('/')
    let next = tree
    let i = 0
    while (i < pathParts.length) {
      const pathPart = pathParts[i++]
      let node = next[pathPart]

      if (!node && next[':']) {
        serializedParamValues.push(pathPart)
        node = next[':']
      }

      if (!node) {
        return
      }

      const { branch, childNode, junctionPath } = node
      next = childNode

      if ((!branch || branch.intermediate) && i === pathParts.length) {
        return
      }
      if (!branch) {
        continue
      }

      const paramNames = branch.pattern.paramNames
      const serializedParams = {}
      for (let j = 0, len = paramNames.length; j < len; j++) {
        serializedParams[paramNames[j]] = serializedParamValues[j]
      }
      serializedParamValues = []

      const queryParts = {}
      for (let i = 0, len = branch.queryKeys.length; i < len; i++) {
        const queryKey = branch.queryKeys[i]
        if (query[queryKey] !== undefined) {
          const value = query[queryKey]
          queryParts[queryKey] = value
          serializedParams[queryKey] = value
        }
      }

      branches[junctionPath] = {
        branchKey: branch.key,
        serializedParams: serializedParams,
        routePath: pathParts.slice(0, i).join('/'),
        queryParts: queryParts,
      }
    }

    return branches
  }
}
