import React from 'react'
import { route } from 'navi'
import { RoutingContext } from '../../types/RoutingContext'

export default route((request, context: RoutingContext) => {
  return {
    view: (
      <div>
        {JSON.stringify(context.currentUser && context.currentUser.email)}
      </div>
    )
  }
})