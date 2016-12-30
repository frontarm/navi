import desugarNext from './desugarNext'
import getLocationFromRouteSet from './getLocationFromRouteSet'
import { createSearch } from './utils/SearchUtils'
import { addDefaultParams } from './Params'


export class Route {
  constructor(branch, params={}, next={}) {
    this.childRouteSet = next
    
    this.branch = branch
    this.next = branch.next && (branch.next.$$junctionSetMeta.isSingle ? next.main : next)
    this.data = branch.data
    this.key = branch.key
    this.params = params
  }

  locate() {
    throw new Error(`You cannot access the 'locate' function on routes created directly with Branch. Instead, use the 'link' passed in via your component's props.`)  
  }
}

export class LocatedRoute extends Route {
  constructor(baseLocation, isRouteInPath, junctionPath, branch, params, next) {
    super(branch, params, next)

    this.baseLocation = baseLocation
    this.isRouteInPath = isRouteInPath
    this.junctionPath = junctionPath

    this.locate = (...next) => {
      const location =
        next.length > 0
          ? getLocationFromRouteSet(this.baseLocation, this.isRouteInPath, this.junctionPath, this.branch.next, next)
          : Object.assign({}, this.baseLocation)

      location.search = createSearch(location.query)
      delete location.query

      return Object.freeze(location)
    }

    Object.freeze(this)
  }
}


export function createRoute(branch, params, ...next) {
  const desugaredNext = desugarNext(branch.next, next) || {}

  const childKeys = Object.keys(desugaredNext)
  for (let i = 0, len = childKeys.length; i < len; i++) {
    const key = childKeys[i]
    if (!branch.next[key]) {
      throw new Error(`A Route cannot be created with child key "${key}" which is not in the associated branch's next`)
    }
    if (desugaredNext[key] && !(desugaredNext[key] instanceof Route)) {
      throw new Error(`A Route cannot be created with a non-Route child (see child key "${key}")`)
    }
    if (desugaredNext[key] && !branch.next[key].$$junctionMeta.branchValues.includes(desugaredNext[key].branch)) {
      throw new Error(`A Route cannot be created with an unknown Branch type for key "${key}"`)
    }
  }

  return Object.freeze(new Route(
    branch, 
    addDefaultParams(branch.paramTypes, params),
    desugaredNext,
  ))
}

