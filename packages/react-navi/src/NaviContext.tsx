import * as React from 'react'
import { NavigationSnapshot, Segment } from 'navi'

export const NaviContext = React.createContext<NaviContext>(undefined as any)

export interface NaviContext extends NavigationSnapshot {
  // The routes that haven't been used yet. Initially identical to routingState.routes
  unconsumedSegments?: Segment[],
}
