import * as React from 'react'
import { NavigationSnapshot } from 'junctions'
import { NaviContext } from './NaviContext'

export interface SnapshotProps {
  children: (snapshot: NavigationSnapshot) => React.ReactNode,
}

export function History(props: SnapshotProps) {
  return (
    <NaviContext.Consumer>
      {context => props.children(context)}
    </NaviContext.Consumer>
  )
}