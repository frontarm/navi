export function createPathParser(junctionSet) {
  const tree = {}
  const queue = [[junctionSet, tree, []]]
  while (queue) {
    const [junctionNode, treeNode, junctionPath] = queue.pop()
    const primaryJunctionKey = getPrimaryJunctionKey(junctionNode)

    if (primaryJunctionKey) {
      const junctionNode.junctions[primaryJunctionKey]
      const branchKeys = Object.keys(primaryJunction)

      for (let i = 0, len = branchKeys.length; i < len; i++) {
        const branch = primaryJunction[branchKeys[i]]
        const childNode = {}
        const nextJunctionPath = junctionPath.concat(primaryJunctionKey)
        treeNode[branch.pattern.id] = {
          branch,
          childNode,
          junctionPath: nextJunctionPath.join('/'),
        }
        queue.push([branch.children, childNode, nextJunctionPath])
      }
    }
  }

  return function parsePath(path) {
    // TODO: Do we actually need to strip leading and trailing '/'? Does history do it for us?
    const strippedPath = path.replace(/^\/|\/($|\?)/g, '')
    const branches = {}

    let pathParts = strippedPath === '' ? [] : path.split('/')
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
          if (patternPart) {
            if (patternPart != pathPart) {
              return
            }
          }
          else {
            serializedParams[paramNames.shift()] = pathPart
          }
        }

        branches[junctionPath] = {
          branchKey: branch.key,
          serializedParams: serializedParams,
          routePath: pathParts.slice(0, i).join('/')
        }

        next = childNode
      }
    }

    return branches
  }
}
