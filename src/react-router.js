import React, { Component, PropTypes } from 'react'
import { getLocatedRoutes, createLocationFactory } from './react-navi'


function getJunctionSetFromComponent(component) {
  const junctionSet = { junctions: component.junctions }
  if (component.primaryJunction) {
    junctionSet.primaryJunction = component.primaryJunction
  }
  return junctionSet
}


function locationsEqual(x, y) {
  // TODO: implement this
  return true
}


// TODO: stop assuming component is a junctionSet
export function createRoute(component, junctionSet, path) {
  const route = {}

  if (path) {
    route.path = `${path}(/**)`
  }
  else {
    route.childRoutes = [
      { path: '**' }
    ]
  }

  function getBaseLocation(routerState) {
    // TODO: memoize by object equality with memory size of 1

    const baseRoutes = nextState.routes.slice(0, this.props.routes.indexOf(rootRoute))
    
    // TODO:
    // - calculate base path (path part of URL for baseRoutes)
    // - calculate base query (query parts which don't match our format)
    // - return
  }



  class JunctionMount extends Component {
    render() {
      const baseLocation = getBaseLocation(nextState)
        
      return (
        React.createElement(WrappedComponent, {
          routes: getLocatedRoutes(junctionSet, nextState.location, baseLocation),
          locate: createLocationFactory(junctionSet, baseLocation),
        })
      )
    }
  }

  function handleChange(_, nextState, replace) {
    const baseLocation = getBaseLocation(nextState)
    const currentRoutes = getLocatedRoutes(junctionSet, nextState.location, baseLocation)      
    const locate = createLocationFactory(junctionSet, baseLocation)
    const canonicalLocation = locate(currentRoutes)
    if (!locationsEqual(canonicalLocation, nextState.location)) {
      replace(canonicalLocation)
    }
  }

  route.component = JunctionMount
  route.onEnter = handleChange.bind(null, {})
  route.onChange = handleChange

  return route
}


export class Mount extends Component {
  static displayName = 'Mount'

  static createRouteFromReactElement =
    function createRouteFromReactElement(element) {
      const component = element.props.component
      const junctionSet = getJunctionSetFromComponent(component)
      return createRoute(component, junctionSet, element.props.path)
    }

  static propTypes = {
    path: PropTypes.string.isRequired,
    component: PropTypes.func.isRequired,
  }

  render() {
    throw new Error('<Mount> elements are for router configuration and should not be rendered')
  }
}


export class IndexMount extends Component {
  static displayName = 'IndexMount'

  static createRouteFromReactElement =
    function createRouteFromReactElement(element, parentRoute) {
      if (parentRoute) {
        const component = element.props.component
        const junctionSet = getJunctionSetFromComponent(component)
        parentRoute.indexRoute = createRoute(component, junctionSet)
      } else {
        throw new Error('An <IndexMount> does not make sense at the root of your route config')
      }
    }

    static propTypes = {
      path: PropTypes.string.isRequired,
      component: PropTypes.func.isRequired,
    }

  render() {
    throw new Error('<IndexMount> elements are for router configuration and should not be rendered')
  }
}
