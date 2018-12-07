Integrating with react-router
=============================

Navi works great with react-router. Internally, they both interact with `window.history` through the same [history](https://www.npmjs.com/package/history) package, ensuring consistency between both routers.

For the react-router `<Route>` that you'd like to render with Navi, you'll need to pass a component that creates a `Navigation` object with the route's `history`, and a `basename` option that matches its parent route's URL. Then, just pass through the `navigation` object to a component that renders its content -- like with any other Navi project:

```js
///App.js
import * as Navi from 'navi'
import React from 'react'
import { BrowserRouter, Route } from 'react-router'
import NestedApp from './NestedApp'
import pages from './pages'

// This route handler will receive a `history` and `match` object from
// react-router, which can be used to create a scoped Navigation object
// for Navi.
class NaviRouteHandler extends React.Component {
  constructor(props) {
    super(props)

    // Because the `history` object is mutable, this can be created in
    // the constructor.
    this.navigation = Navi.createBrowserNavigation({
      pages: pages,

      history: props.history,
      basename: props.match.url,
    })
  }

  componentWillUnmount() {
    delete this.navigation.dispose()
  }

  render() {
    return <NestedApp navigation={this.navigation} />
  }
}

export default function App(props) {
  return (
    <BrowserRouter>
      <Route path="/nested-app" component={NaviRouteHandler} />
    </BrowserRouter>
  )
}
///index.js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

ReactDOM.render(
  <App />,
  document.getElementById("root")
)
```

Caution: Avoid using react-router within Navi content

Because react-router handles navigation synchronously while Navi handles it asynchronously, you'll always want your Navi routes to be nested *within* the react-router routes -- never the other way around.

Unfortunately, this means that Navi's static generation tools will not work with an app that uses react-router.

End Caution
