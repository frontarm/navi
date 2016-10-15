import { Route, LocatedRoute } from './Routes'


export function isJunctionSet(x) {
  return x instanceof Object && x.$$junctionSetMeta
}
export function isJunction(x) {
  return x instanceof Object && x.$$junctionMeta
}
export function isBranchTemplate(x) {
  return x instanceof Object && x.$$branchTemplate
}
export function isBranch(x) {
  return x instanceof Object && x.$$branch
}
export function isSerializer(x) {
  return x instanceof Object && x.$$serializer
}
export function isParam(x) {
  return x instanceof Object && x.$$param
}
export function isRoute(x) {
  return x instanceof Route
}
export function isLocatedRoute(x) {
  return x instanceof LocatedRoute
}
