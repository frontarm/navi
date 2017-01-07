import { isRoute } from './TypeGuards'
import { serializeParams } from './Params'
import objectsEqual from './utils/objectsEqual'

export default function routesMatch(specificRoute, partialRoute, exact=true) {
  const a = specificRoute
  const b = partialRoute

  if (!a && !b) {
    return true
  }
  if (!a || !b) {
    return false
  }

  if (isRoute(a) || isRoute(b)) {
    if (!isRoute(a) || !isRoute(b)) {
      return false
    }

    if (a.branch !== b.branch) {
      return false
    }

    const branch = a.branch

    if (!objectsEqual(serializeParams(branch.paramTypes, a.params), serializeParams(branch.paramTypes, b.params))) {
      return false
    }

    return !branch.next || (!exact && specificRoute.next && !partialRoute.next) || routesMatch(a.next, b.next)
  }

  if (typeof a !== 'object' || typeof b !== 'object') {
    return false
  }

  return objectsEqual(a, b, routesMatch)
}
