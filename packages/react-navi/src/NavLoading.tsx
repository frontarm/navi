import * as React from 'react'
import { Route } from 'navi'
import { NavContext } from './NavContext'


export function useLoadingRoute() {
  return React.useContext(NavContext).busyRoute
}


export interface NavLoadingProps {
  children: (busyRoute?: Route) => React.ReactNode,
}

export namespace NavLoading {
  export type Props = NavLoadingProps
}

// This is a PureComponent so that setting state to loading
// when it is already loading won't cause a re-render
export function NavLoading(props: NavLoadingProps) {
  return (
    <NavContext.Consumer>
      {context => props.children(context.busyRoute)}
    </NavContext.Consumer>
  )
}