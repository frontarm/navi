import * as React from 'react'
import { Router } from 'navi'
import { NaviContext } from './NaviContext'


export function useRouter() {
  return React.useContext(NaviContext).navigation.router
}


export interface NavRouterProps {
  children: (router: Router) => React.ReactNode,
}

export namespace NavRouter {
  export type Props = NavRouterProps
}

export function NavRouter(props: NavRouterProps) {
  return (
    <NaviContext.Consumer>
      {context => props.children(context.navigation.router)}
    </NaviContext.Consumer>
  )
}