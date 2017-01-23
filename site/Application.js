import React, { Component, PropTypes } from 'react'
import Junctions from 'junctions'
import ReactJunctions, { Router } from 'react-junctions'
import convertIdToKey from './utils/convertIdToKey'
import Link from './controls/Link'

// Create a route for the page with the given id
function createSiteRoute(site, pageId) {
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


function Route({site, route, locate, navigateToPage}) {
  const page = route.data.page
  const wrapperOptions = {
      root: site.root,
      page: page,
      route: route,
      locate: locate,
  }
  let content
  if (route.next && route.next.data.page) {
    content = <Route site={site} route={route.next} locate={route.locate} navigateToPage={navigateToPage} />
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


export default class Application extends Component {
  componentDidMount() {
    window.$site = this.props.site
    window.Junctions = Junctions
    window.ReactJunctions = ReactJunctions

    console.log(`
    ------------------------------------
    G'day. Thank's for trying Junctions.

    Want to play around? Just type "Junctions" to see what's available.
    Or want to see inside a Junction object? Here's one:`, this.props.site.root.junction)
    console.log(`
    Also, I'll log your current route to the console each time you navigate.

    Happy JavaScripting!
    ------------------------------------

    `)
  }

  render() {
    const { history, site } = this.props

    const createRoute = createSiteRoute.bind(null, site)

    return (
      <Router
        history={history}
        junction={site.root.junction}
        render={({route, locate}) => {
          //console.log("JUNCTIONS: Route changed to: ", route)

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
              ? <Route site={site} route={route} locate={locate} navigateToPage={navigateToPage} />
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
      />
    )
  }
}
