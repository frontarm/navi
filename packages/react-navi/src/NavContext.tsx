import * as React from 'react'
import { Route, Navigation, Segment } from 'navi'

export const NavContext = React.createContext<NavContext>(undefined as any)

export const NavConsumer = NavContext.Consumer

export interface NavContext {
  navigation: Navigation

  steadyRoute?: Route
  busyRoute?: Route
  
  // The routes that haven't been used yet. Initially identical to routingState.routes
  unconsumedSteadyRouteSegments?: Segment[],

  onRendered?: () => void,
}

export const NavContextProvider = NavContext.Provider