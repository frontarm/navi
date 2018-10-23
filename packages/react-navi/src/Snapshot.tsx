import * as React from 'react'
import { NavigationSnapshot } from 'navi'
import { NaviContext } from './NaviContext'

export interface SnapshotProps {
  children: (snapshot: NavigationSnapshot) => React.ReactNode,
}

export function Snapshot(props: SnapshotProps) {
  return (
    <NaviContext.Consumer>
      {context => props.children(context)}
    </NaviContext.Consumer>
  )
}