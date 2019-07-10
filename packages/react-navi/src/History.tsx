import * as React from 'react'
import { History as IHistory } from 'history'
import { NaviContext } from './NaviContext'


export function useHistory() {
  return React.useContext(NaviContext).navigation.history
}


export interface HistoryProps {
  children: (history: IHistory) => React.ReactNode,
}

export namespace History {
  export type Props = HistoryProps
}

export function History(props: HistoryProps) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Deprecation Warning: "<History>" is deprecated. From Navi 0.14, ` +
          `you'll need to use the "useHistory()" hook instead.`
      )
    }
  }, [])

  return (
    <NaviContext.Consumer>
      {context => props.children(context.navigation.history)}
    </NaviContext.Consumer>
  )
}