import './loadServiceWorker'
import './global.less'
import React from 'react'
import ReactDOM from 'react-dom'
import Junctions, { createJunction } from 'junctions'
import ReactJunctions, { Router } from 'react-junctions'
import createBrowserHistory from 'history/createBrowserHistory'
import Link from './controls/Link'


window.Junctions = Junctions
window.ReactJunctions = ReactJunctions
console.log(`
------------------------------------
G'day. Thank's for trying Junctions.

Want to play around? Just type "Junctions" to see what's available.
Or want to see inside a Junction object? Here's one:", site.root.junctio
Also, I'll log your current route to the console each time you navigate.

Happy JavaScripting!
------------------------------------

`)


function camelize(string) {
  return string.replace(/-(.)/g, (_, character) => character.toUpperCase())
}
function convertIdToKey(id) {
  return camelize(id.split('/').reverse()[0])
}


const site = require('../SITE.js').initialize(page => {
  if (page.contentWrapper) {
    page.contentWrapper = require('./wrappers/'+page.contentWrapper+'.js').default
  }
  if (page.indexWrapper) {
    page.indexWrapper = require('./wrappers/'+page.indexWrapper+'.js').default
  }
  if (page.index) {
    const branches = {}
    for (let i = 0, len = page.index.length; i < len; i++) {
      const childPage = page.index[i]

      const key = convertIdToKey(childPage.id)

      if (childPage !== page) {
        branches[key] = {
          path: '/'+childPage.id.split('/').reverse()[0],
          next: childPage.junction || null,
          data: {
            page: childPage,
          },
        }
      }
    }
    if (Object.keys(branches).length > 0) {
      page.junction = createJunction(branches)
    }
  }
})


// Create a route for the page with the given id
function createRoute(pageId) {
  let currentId = pageId
  let page = site.pages[currentId]
  if (page) {
    let route
    while (page.parent) {
      currentId = page.id
      page = page.parent
      route = page.junction.createRoute(convertIdToKey(currentId), {}, route)
    }
    return route
  }
  else {
    return null
  }
}


function Route({route, locate, navigateToPage}) {
  const page = route.data.page
  const wrapperOptions = {
      root: site.root,
      page: page,
      route: route,
      locate: locate,
  }
  let content
  if (route.next && route.next.data.page) {
    content = <Route route={route.next} locate={route.locate} navigateToPage={navigateToPage} />
  }
  else {
    content = React.createElement(page.contentWrapper, { page, navigateToPage })
  }

  if (page != site.root && page.indexWrapper) {
    return React.createElement(page.indexWrapper, Object.assign(wrapperOptions, { children: content }))
  }
  else {
    return content
  }
}


const history = createBrowserHistory()
ReactDOM.render(
  <Router
    history={history}
    junction={site.root.junction}
    render={({route, locate}) => {
      console.log("JUNCTIONS: Route changed to: ", route)

      function navigateToPage(url) {
        const [pageId, hash] = url.split('#')
        history.push(Object.assign({}, locate(createRoute(pageId)), { hash }))

        const el = document.getElementById(hash)
        if (el) {
          el.scrollIntoView(true);
        }
        else {
          window.scroll(0, 0)
        }
      }

      const content =
        route
          ? <Route route={route} locate={locate} navigateToPage={navigateToPage} />
          : (
            route === null
              ? React.createElement(site.root.contentWrapper, { page: site.root, navigateToPage })
              : <h1>404 - Computer Says No</h1>
          )
      
      const wrappedContent = 
        site.root.indexWrapper
          ? React.createElement(site.root.indexWrapper, { route, locate, root: site.root, page: site.root, children: content })
          : content

      return (
        <Link.Context
          createRoute={createRoute}
          currentRoute={route}
          locate={locate}>
          {wrappedContent}
        </Link.Context>
      )
    }}
  />,
  document.getElementById('app')
)

