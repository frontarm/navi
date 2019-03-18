import React from 'react'
import { lazy, map, mount, redirect, route } from 'navi'

export default mount({
  '/': redirect('/login'),

  '/welcome': map(async req => {
    let name = req.params.name || 'Stranger'

    return route({
      title: 'Welcome',
      view: 
        <>
          <h1>Howdy, {name}!</h1>
          <p>Welcome to this demo!</p>
        </>
    })
  }),
    
  '/login': lazy(() => import('./login'))
})