import * as React from 'react'
import { History } from 'history'
import { NavigationContext } from './NavigationContext'

export interface HistoryProps {
  children: (history: History) => React.ReactNode,
}

export function History(props: HistoryProps) {
  return (
    <NavigationContext.Consumer>
      {context => props.children(context.history)}
    </NavigationContext.Consumer>
  )
}