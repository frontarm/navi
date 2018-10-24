import * as React from 'react'
import { NavigationSnapshot, Segment } from 'navi'

export const NavContext = React.createContext<NavContext>(undefined as any)

export const NavConsumer = NavContext.Consumer

export interface NavContext extends NavigationSnapshot {
  // The routes that haven't been used yet. Initially identical to routingState.routes
  unconsumedSegments?: Segment[],
}
