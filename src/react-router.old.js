import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router'
import { compilePattern, formatPattern } from './PatternUtils'
import { desugarLinkOptions, getPrimaryJunction, DEFAULT_BRANCH } from './react-navi'

// - need to generate a set of routes based on the junction tree
// - need to generate a link function which can convert a full route tree to a location
// - need to convert the current route of the wrapper component into a route tree
// - need to add subtree link function to each route (probably not react router specific)

const QUERY_PREFIXES = 'abcdefghijklmnopqrstuvwxyz'

const JUNCTIONS_STATE = Symbol()


function createUnlinkableRoutes(junctions, primaryBranch, routes, state) {
  // TODO:
  // turn rouets/state into a react-navi Route object based on the
  // given junctions/primaryBranch
  console.log(junctions, primaryBranch, routes, state)
  return null
}

// Takes routes and a `link` fn, turns the routes into linkable routes
function createLinkableRoutes(routes, parentLink) {
  return null
}


// Convert routes into react-router location using branches in given routes 
function getRoute(primaryInPath, routes, primaryBranch) {
  return {}
}


export function createLinker(prefix, junctionSet) {
  // This should be used within wrapComponent, but should also be available
  // to create linkers independent of a Mount component
}



function wrapComponent(WrappedComponent, rootRoute, junctions, primaryJunction) {
  const link = (routes) => {
    var branches, primaryBranch // TODO: wtf are these?
    const { state, query, parts } = getRoute(true, desugarLinkOptions(routes, branches), primaryBranch)

    // for any known parameters in primary junction branches which are not part of the path, add them as part of the query string.
    // prefix them with a letter representing the depth of the branch. e.g. b.page=1&b.size=20

    // TODO: handle rootpath

    return {
      state: {
        [JUNCTIONS_STATE]: state,
        pathname: `${parts ? '/' + parts.join('/') : ''}`,
        query,
      }
    }
  }

  return class Mount extends Component {
    render() {
      const state = this.props.location.state
      const junctionsState = (state && state[JUNCTIONS_STATE]) || {}
      const junctionsRoutes = this.props.routes.slice(this.props.routes.indexOf(rootRoute))
      const unlinkableRoutes = createUnlinkableRoutes(junctions, primaryJunction, junctionsRoutes, junctionsState)

      return (
        React.createElement(WrappedComponent, {
          link,
          routes: unlinkableRoutes,
          //routes: createLinkableRoutes(unlinkableRoutes, link),
        })
      )
    }
  }
}


function createRoutesForJunctionSet(parentRoutes, junctionSet) {
  var primaryJunction = getPrimaryJunction(junctionSet)

  if (primaryJunction) {
    var childRoutes = []
    var indexRoute = null
    var primaryJunctionKeys = Object.keys(primaryJunction)

    for (var i = 0, len = primaryJunctionKeys.length; i < len; i++) {
      var key = primaryJunctionKeys[i]
      var branch = primaryJunction[key]
      var route = {
        path: branch.pattern.pattern,
        branch: branch,
      }

      if (branch.children) {
        Object.assign(route, createRoutesForJunctionSet(parentRoutes.concat(route), branch.children))
      }
      childRoutes.push(route)
    }

    if (primaryJunction[DEFAULT_BRANCH]) {
      var defaultBranch = primaryJunction[primaryJunction[DEFAULT_BRANCH]]

      indexRoute = {
        onEnter: function (nextState, replace) {
          var routeIndex = nextState.routes.indexOf(indexRoute);

          // If we're not the final route in the list, then we already
          // have a route for our primary child branch
          if (routeIndex === nextState.routes.length - 1) {
            var pattern = defaultBranch.pattern
            var defaultParams = {}          

            var remainingParams = Object.keys(branch.params)
            for (var i = 0, len = pattern.pathParamNames.length; i < len; i++) {
              var paramName = pattern.pathParamNames[i]
              var paramType = branch.params[paramName]

              remainingParams.splice(remainingParams.indexOf(paramName), 1)

              if (paramType.default) {
                defaultParams[paramName] = typeof paramType.default === 'function' ? paramType.default() : paramType.default
              }
              else if (paramType.required) {
                console.error(`Tried to navigate to a branch with an empty required param '${paramName}'. Try adding a default.`)
                return
              }
              else {
                defaultParams[paramName] = ''
              }
            }

            var location = nextState.location
            var params = nextState.params
            var query = Object.assign({}, location.query)

            for (var i = 0, len = remainingParams.length; i < len; i++) {
              var paramType = branch.params[paramName]

              if (paramType.default) {
                var prefix = QUERY_PREFIXES[parentRoutes.length]
                var queryName = [prefix, paramName].join('.')
                query[queryName] = typeof paramType.default === 'function' ? paramType.default() : paramType.default
              }
            }

            var pathname = nextState.location.pathname
            var routePath = formatPattern(pattern, defaultParams)

            replace({
              pathname: pathname + (pathname[pathname.length - 1] == '/' ? '' : '/') + routePath,
              query: query,
              state: route.state || location.state,
            });
          }
        }
      }
    }

    return { childRoutes, indexRoute }
  }
  else {
    return { childRoutes: [], indexRoute: null }
  }
}


// TODO: stop assuming component is a junctionSet
export function createRouteFor(component) {
  const junctions = component.junctions
  const primaryJunction = getPrimaryJunction(component)

  const rootRoute = createRoutesForJunctionSet([], component)
  return Object.assign(rootRoute, {
    component: wrapComponent(component, rootRoute, junctions, primaryJunction), 
  })
}


export class Mount extends Component {
  static displayName = 'Mount'

  static createRouteFromReactElement =
    function createRouteFromReactElement(element) {
      const route = createRouteFor(element.props.component)
      route.path = element.props.path
      return route
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
        parentRoute.indexRoute = createRouteFor(element.props.component)
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
