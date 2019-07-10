import * as React from 'react'
import { History as IHistory } from 'history'
import { NaviContext } from './NaviContext'

export function useHistory() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Deprecation Warning: "useHistory()" is deprecated. It will be removed in a future version.`,
    )
  }

  return React.useContext(NaviContext).navigation._history
}

export interface HistoryProps {
  children: (history: IHistory) => React.ReactNode
}

export namespace History {
  export type Props = HistoryProps
}

export function History(props: HistoryProps) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Deprecation Warning: "<History>" is deprecated. It will be removed in a future version.`,
      )
    }
  }, [])

  return (
    <NaviContext.Consumer>
      {context => props.children(context.navigation._history)}
    </NaviContext.Consumer>
  )
}
