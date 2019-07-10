import * as React from 'react'
import { Route } from 'navi'
import { NaviContext } from './NaviContext'


export function useCurrentRoute() {
  let { steadyRoute, busyRoute } = React.useContext(NaviContext)
  return (steadyRoute || busyRoute)!
}


export interface CurrentRouteProps {
  /**
   * A render function that can be used to access the current route.
   */
  children: (route: Route) => React.ReactNode
}

export namespace CurrentRoute {
  export type Props = CurrentRouteProps
}

export function CurrentRoute(props: CurrentRouteProps) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Deprecation Warning: "<CurrentRoute>" is deprecated. From Navi 0.14, ` +
          `you'll need to use the "useCurrentRoute()" hook instead.`
      )
    }
  }, [])

  return (
    <NaviContext.Consumer>
      {context => props.children((context.steadyRoute || context.busyRoute)!)}
    </NaviContext.Consumer>
  )
}
