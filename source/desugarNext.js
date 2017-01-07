import { Route } from './Routes'


export default function desugarNext(junctionSet, _next) {
  if (_next.length && !(_next[0] == undefined && _next.length == 1)) {
    if (!_next[0] || (_next[0] instanceof Route)) {
      // Find the junction keys of the passed in routes by looking through the available next of
      // the passed in branch. Use these junction keys to build a route set.
      if (!junctionSet) {
        throw new Error('You attempted to pass child routes when no child junctions are available')
      }

      const next = _next.filter(child => child)
      const routeSet = {}

      const childBranches = next.map(child => child.branch)
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
            routeSet[junctionKey] = next[branchIndex]
            next.splice(branchIndex, 1)
            childBranches.splice(branchIndex, 1)
            if (next.length === 0) {
              break outer
            }
            continue outer
          }
        }
      }

      if (next.length) {
        throw new Error(`A child route with key "${next[0].branch.key}" passed to createRoute could not be found in the passed-in branch's next.`)
      }

      return routeSet
    }
    else {
      return _next[0]
    }
  }
  return {}
}
