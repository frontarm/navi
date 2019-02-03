import * as React from 'react'
import { Router } from 'navi'
import { NavContext } from './NavContext'


export function useRouter() {
  return React.useContext(NavContext).navigation.router
}


export interface NavRouterProps {
  children: (router: Router) => React.ReactNode,
}

export namespace NavRouter {
  export type Props = NavRouterProps
}

export function NavRouter(props: NavRouterProps) {
  return (
    <NavContext.Consumer>
      {context => props.children(context.navigation.router)}
    </NavContext.Consumer>
  )
}