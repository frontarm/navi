import * as React from 'react'
import { Route } from 'navi'
import { NaviContext } from './NaviContext'


export function useLoadingRoute() {
  return React.useContext(NaviContext).busyRoute
}


export interface LoadingRouteProps {
  children: (busyRoute?: Route) => React.ReactNode,
}

export namespace LoadingRoute {
  export type Props = LoadingRouteProps
}

// This is a PureComponent so that setting state to loading
// when it is already loading won't cause a re-render
export function LoadingRoute(props: LoadingRouteProps) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Deprecation Warning: "<LoadingRoute>" is deprecated. From Navi 0.14, ` +
          `you'll need to use the "useLoadingRoute()" hook instead.`
      )
    }
  }, [])

  return (
    <NaviContext.Consumer>
      {context => props.children(context.busyRoute)}
    </NaviContext.Consumer>
  )
}