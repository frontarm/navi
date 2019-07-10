import * as React from 'react'
import { Route, Navigation, Chunk } from 'navi'

export const NaviContext = React.createContext<NaviContext>({} as any)

export const NavConsumer = NaviContext.Consumer

export interface NaviContext {
  navigation: Navigation

  steadyRoute?: Route
  busyRoute?: Route

  // The routes that haven't been used yet. Initially identical to routingState.routes
  unconsumedSteadyRouteChunks?: Chunk[]
}

export const NavContextProvider = NaviContext.Provider
