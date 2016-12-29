import { Route, LocatedRoute } from './Routes'


export function isJunction(x) {
  return x instanceof Object && x.$$junctionMeta
}
export function isBranch(x) {
  return x instanceof Object && x.$$branch
}
export function isRoute(x) {
  return x instanceof Route
}
export function isLocatedRoute(x) {
  return x instanceof LocatedRoute
}
