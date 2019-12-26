import * as React from 'react'
import { NaviContext } from './NaviContext'

export function useLoadingRoute() {
  return React.useContext(NaviContext).busyRoute
}
