import desugarChildren from './desugarChildren'
import getLocationFromRouteSet from './getLocationFromRouteSet'
import { createSearch } from './utils/SearchUtils'
import { addDefaultParams } from './Params'


export class Route {
  constructor(branch, params={}, children={}) {
    this.childRouteSet = children
    
    this.branch = branch
    this.children = branch.children && (branch.children.$$junctionSetMeta.isSingle ? children.main : children)
    this.data = branch.data
    this.key = branch.key
    this.params = params
  }

  locate() {
    throw new Error(`You cannot access the 'locate' function on routes created directly with Branch. Instead, use the 'link' passed in via your component's props.`)  
  }
}

export class LocatedRoute extends Route {
  constructor(baseLocation, isRouteInPath, junctionPath, branch, params, children) {
    super(branch, params, children)

    this.baseLocation = baseLocation
    this.isRouteInPath = isRouteInPath
    this.junctionPath = junctionPath

    Object.freeze(this)
  }

  locate(...children) {
    const location =
      children.length > 0
        ? getLocationFromRouteSet(this.baseLocation, this.isRouteInPath, this.junctionPath, this.branch.children, children)
        : Object.assign({}, this.baseLocation)

    location.search = createSearch(location.query)
    delete location.query

    return Object.freeze(location)
  }
}


export function createRoute(branch, params, ...children) {
  const desugaredChildren = desugarChildren(branch.children, children) || {}

  const childKeys = Object.keys(desugaredChildren)
  for (let i = 0, len = childKeys.length; i < len; i++) {
    const key = childKeys[i]
    if (!branch.children[key]) {
      throw new Error(`A Route cannot be created with child key "${key}" which is not in the associated branch's children`)
    }
    if (desugaredChildren[key] && !(desugaredChildren[key] instanceof Route)) {
      throw new Error(`A Route cannot be created with a non-Route child (see child key "${key}")`)
    }
    if (desugaredChildren[key] && !branch.children[key].$$junctionMeta.branchValues.includes(desugaredChildren[key].branch)) {
      throw new Error(`A Route cannot be created with an unknown Branch type for key "${key}"`)
    }
  }

  return Object.freeze(new Route(
    branch, 
    addDefaultParams(branch.paramTypes, params),
    desugaredChildren,
  ))
}

