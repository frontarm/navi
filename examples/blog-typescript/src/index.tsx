import register from 'navi-scripts/register'
import * as Navi from 'navi'
import React from 'react'
import ReactDOM from 'react-dom'
import { NaviProvider, View } from 'react-navi'
import './index.module.css'
import routes from './routes'
import * as serviceWorker from './serviceWorker'

// `register()` is responsible for exporting your app's pages and App
// component to the static renderer, and for starting the app with the
// `main()` function when running within a browser.
register({
  // Specify the pages that navi-app should statically build, by passing in a
  // Switch object.
  routes,

  // This will only be called when loading your app in the browser. It won't
  // be called when performing static generation.
  async main() {
    let navigation = Navi.createBrowserNavigation({ routes })

    // Wait until the navigation has loaded the page's content, or failed to do
    // so. If you want to load other data in parallel while the initial page is
    // loading, make sure to start loading before this line.
    await navigation.steady()

    // React requires that you call `ReactDOM.hydrate` if there is statically
    // rendered content in the root element, but prefers us to call
    // `ReactDOM.render` when it is empty.
    let hasStaticContent = process.env.NODE_ENV === 'production'
    let renderer = hasStaticContent ? ReactDOM.hydrate : ReactDOM.render

    // Start react, passing in the current navigation state via the
    // NaviProvider.
    renderer(
      <NaviProvider navigation={navigation}>
        <View />
      </NaviProvider>,
      document.getElementById('root')
    )

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: http://bit.ly/CRA-PWA
    serviceWorker.unregister()
  },
})
