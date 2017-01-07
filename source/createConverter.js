import getLocationFromRouteSet from './getLocationFromRouteSet'
import getRouteSetFromLocation from './getRouteSetFromLocation'
import { createPathParser } from './PathParser'
import hyphenize from './utils/hyphenize'
import JunctionSet from './JunctionSet'
import { createSearch, parseSearch } from './utils/SearchUtils'


export default function createConverter(junctionSetOptions, baseLocation={ pathname: '/' }) {
  const junctionSet = JunctionSet(junctionSetOptions)

  const parsePath = createPathParser(junctionSet)
  const baseLocationWithQuery = Object.assign({}, baseLocation, { query: parseSearch(baseLocation.search) })
 
  return {
    locate(...next) {
      if (next.length === 0) return baseLocation

      const location = getLocationFromRouteSet(baseLocationWithQuery, true, [], junctionSet, next)
      location.search = createSearch(location.query)
      delete location.query
      return Object.freeze(location)
    },
    route(location) {
      const locationWithQuery = Object.assign({}, location, { query: parseSearch(location.search) })
      return getRouteSetFromLocation(parsePath, baseLocationWithQuery, junctionSet, locationWithQuery)
    },
  }
}
