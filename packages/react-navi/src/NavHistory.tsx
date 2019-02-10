import * as React from 'react'
import { History } from 'history'
import { NaviContext } from './NaviContext'


export function useHistory() {
  return React.useContext(NaviContext).navigation.history
}


export interface NavHistoryProps {
  children: (history: History) => React.ReactNode,
}

export namespace NavHistory {
  export type Props = NavHistoryProps
}

export function NavHistory(props: NavHistoryProps) {
  return (
    <NaviContext.Consumer>
      {context => props.children(context.navigation.history)}
    </NaviContext.Consumer>
  )
}