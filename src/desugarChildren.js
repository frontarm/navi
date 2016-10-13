import { Route } from './Routes'


export default function desugarChildren(junctionSet, children) {
  if (children.length) {
    if (children[0] instanceof Route) {
      // Find the junction keys of the passed in routes by looking through the available children of
      // the passed in branch. Use these junction keys to build a route set.
      if (!junctionSet) {
        throw new Error('You attempted to pass child routes when no child junctions are available')
      }

      const routeSet = {}

      const childBranches = children.map(child => child.branch)
      const junctionKeys = junctionSet.$$junctionSetMeta.junctionKeys

      outer:
      for (let i = 0, len = junctionKeys.length; i < len; i++) {
        const junctionKey = junctionKeys[i]
        const junction = junctionSet[junctionKey]
        const branchKeys = Object.keys(junction)
        for (let j = 0, len = branchKeys.length; j < len; j++) {
          const branch = junction[branchKeys[j]]
          const branchIndex = childBranches.indexOf(branch)
          if (branchIndex !== -1) {
            routeSet[junctionKey] = children[branchIndex]
            children.splice(branchIndex, 1)
            childBranches.splice(branchIndex, 1)
            if (children.length === 0) {
              break outer
            }
            continue outer
          }
        }
      }

      if (children.length) {
        throw new Error(`A child route with key "${children[0].branch.key}" passed to createRoute could not be found in the passed-in branch's children.`)
      }

      return routeSet
    }
    else {
      return children[0]
    }
  }
}
