import { composeMatchers, map, route, withView } from 'navi'
import React from 'react'
import { NaviView } from 'react-navi'
import AppLayout from '../components/AppLayout'

// The `composeMatchers()` function lets you build up your Route object
// from multiple matcher functions.
const routes = composeMatchers(
  // This is the first view that is matched, so it will be rendered by the
  // app's top level `<Navi>` component. The nested `<NaviView />` will
  // render the matched child view.
  withView(
    <AppLayout>
      <NaviView />
    </AppLayout>
  ),

  // Continue adding content to the route depending on the current URL...
  map({
    '/': route({
      // Add a title to the route, which will be automatically used as
      // the document's `<title>`
      title: 'Home',

      // Define a nested view, which can be rendered by calling `<NavView />`
      // inside a parent view.
      getView: () => import('./home')
    }),
      
    '/about': route({
      title: "About",
      getView: async () => {
        // This simulates some async content loading, so that
        // you can test the site's loading bar.
        await new Promise(resolve => setTimeout(resolve, 1000))

        return import('./about')
      }
    }),
  })
)

export default routes