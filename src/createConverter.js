import desugarChildren from './desugarChildren'
import getLocationFromRouteSet from './getLocationFromRouteSet'
import getRouteSetFromLocation from './getRouteSetFromLocation'
import { createPathParser } from './PathParser'
import hyphenize from './utils/hyphenize'
import { createSearch, parseSearch } from './utils/SearchUtils'


export default function createConverter(junctionSet, baseLocation={ pathname: '/' }) {
  const parsePath = createPathParser(junctionSet)
  const baseLocationWithQuery = Object.assign({}, baseLocation, { query: parseSearch(baseLocation.search) })
 
  return {
    getLocation(...children) {
      const location = getLocationFromRouteSet(baseLocationWithQuery, true, [], junctionSet, desugarChildren(junctionSet, children))
      location.search = createSearch(location.query)
      delete location.query
      return Object.freeze(location)
    },
    getRouteSet(location) {
      const locationWithQuery = Object.assign({}, location, { query: parseSearch(location.search) })
      return getRouteSetFromLocation(parsePath, baseLocationWithQuery, junctionSet, locationWithQuery)
    },
  }
}
