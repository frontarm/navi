import * as React from 'react'
import { Route } from 'navi'
import { NavContext } from './NavContext'


export function useCurrentRoute() {
  let { steadyRoute, busyRoute } = React.useContext(NavContext)
  return steadyRoute || busyRoute
}


export interface NavRouteProps {
  /**
   * A render function that can be used to access the current route.
   */
  children: (route: Route) => React.ReactNode
}

export namespace NavRoute {
  export type Props = NavRouteProps
}

export const NavRoute: React.SFC<NavRouteProps> = function NavRoute(props: NavRouteProps) {
  if (!props.children) {
    console.warn(`Deprecation Warning: From Navi 0.11, the <NavRoute> component will no longer have a default renderer, and will throw any errors on the route object. Consider switching to <NavContent> instead.`)
  }

  return (
    <NavContext.Consumer>
      {context => {
        let route = (context.steadyRoute || context.busyRoute)!

        let content: React.ReactNode
        let render: undefined | ((route: Route) => React.ReactNode)
        if (props.children) {
          render = props.children as (route: Route) => React.ReactNode
          if (typeof render !== "function") {
            throw new Error(`<NavRoute> expects its children to be a function, but instead received "${render}".`)
          }
        }
        else if (route && route.content) {
          if (typeof route.content === 'function') {
            if (route.content.prototype instanceof React.Component) {
              content = React.createElement(route.content as any, route)
            }
            else {
              render = route.content
            }
          }
          else if (React.isValidElement(route.content)) {
            content = route.content
          }
        }

        if (render) {
          content = render(route)
        }
        if (content === undefined) {
          if (context.steadyRoute) {
            throw new Error("<NavRoute> was not able to find a `children` prop, or a `render` function in the consumed RouteSegment's `content`.")
          }
          else {
            content = null
          }
        }

        return content
      }}
    </NavContext.Consumer>
  )
}
