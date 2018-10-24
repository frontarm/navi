import * as React from 'react'
import { History } from 'history'
import { NavContext } from './NavContext'

export interface NavHistoryProps {
  children: (history: History) => React.ReactNode,
}

export namespace NavHistory {
  export type Props = NavHistoryProps
}

export function NavHistory(props: NavHistoryProps) {
  return (
    <NavContext.Consumer>
      {context => props.children(context.history)}
    </NavContext.Consumer>
  )
}