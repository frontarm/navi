import * as React from 'react'
import { NaviContext } from './NaviContext'

export function useCurrentRoute() {
  let { steadyRoute, busyRoute } = React.useContext(NaviContext)
  return (steadyRoute || busyRoute)!
}
