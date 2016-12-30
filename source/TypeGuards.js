import { Route, LocatedRoute } from './Routes'


export function isJunction(x) {
  return x && !!x.$$junctionMeta
}
export function isRoute(x) {
  return x instanceof Route
}
export function isLocatedRoute(x) {
  return x instanceof LocatedRoute
}
