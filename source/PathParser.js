export function createPathParser(junctionSet) {
  const tree = {}
  const queue = [[junctionSet.$$junctionSetMeta, tree, []]]
  while (queue.length) {
    const [junctionSetMetaNode, treeNode, junctionPath] = queue.shift()
    const primaryJunctionKey = junctionSetMetaNode.primaryKey

    if (primaryJunctionKey) {
      const primaryJunction = junctionSetMetaNode.junctions[primaryJunctionKey]
      const branchKeys = primaryJunction.$$junctionMeta.branchKeys

      for (let i = 0, len = branchKeys.length; i < len; i++) {
        const branch = primaryJunction[branchKeys[i]]
        const childNode = {}
        const nextJunctionPath = junctionPath.concat(primaryJunctionKey)
        treeNode[branch.pattern.id] = {
          branch,
          childNode,
          junctionPath: nextJunctionPath.join('/'),
        }
        if (branch.children) {
          queue.push([branch.children.$$junctionSetMeta, childNode, nextJunctionPath])
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

    let pathParts = strippedPath.split('/')
    let next = tree
    let i = 0
    while (i < pathParts.length) {
      const pathPart = pathParts[i]
      const node = next[pathPart] || next[':']

      if (!node) {
        return
      }
      else {
        const { branch, childNode, junctionPath } = node
        const patternParts = branch.pattern.parts
        const paramNames = branch.pattern.paramNames.slice(0)

        const serializedParams = {}
        for (let j = 0, len = patternParts.length; j < len; j++) {
          const patternPart = patternParts[j]

          const pathPart = pathParts[i++]
          if (i > pathParts.length) {
            return
          }
          else if (patternPart) {
            if (patternPart != pathPart) {
              return
            }
          }
          else {
            serializedParams[paramNames.shift()] = pathPart
          }
        }

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

        next = childNode
      }
    }

    return branches
  }
}
