import * as React from 'react'
import { NavigationState, Route } from 'junctions'

export const NavigationContext = React.createContext<NavigationContext>(undefined as any)

export interface NavigationContext extends NavigationState {
  // The routes that haven't been used yet. Initially identical to routingState.routes
  unusedRoutes?: Route[],
}
