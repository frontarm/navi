# Usage with React

Junctions works great with React. To use it with a React application, you'll need to:

- Create a `history` object using the [history](https://github.com/mjackson/history) package
- Listen to changes the current location with `history.listen`, and calculate a new RouteSet
- Optionally replace the history with the [Canonical Location](CanonicalURLs.md)
- Re-render your React application, passing in the new RouteSet

Because Junctions makes your entire app's location state available in a single `routeSet` object, it is up to you to actually use this to render the correct Route. If you'd like some ideas on how to do this, the [Screens](Screens.md) pattern makes this really easy.

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { createConverter, locationsEqual } from 'junctions'
import { HistoryContext } from 'react-junctions'
import createHistory from 'history/createBrowserHistory'
import AppScreen from './screens/AppScreen'


const history = createHistory()
const locationConverter = createConverter(AppScreen.junctionSet)
const locate = routeSet => locationConverter.getLocationFromRouteSet(routeSet)

function render(routes) {
  ReactDOM.render(
    <HistoryContext history={history}>
      <AppScreen
        routes={routes}
        locate={locate}
      />
    </HistoryContext>,
    document.getElementById('app')
  )
}

function handleLocationChange(location) {
  const routes = locationConverter.getRouteSetFromLocation(location)
  const canonicalLocation = locate(routes)

  if (!locationsEqual(location, canonicalLocation)) {
    history.replace(canonicalLocation)
  }

  render(routes)
}

handleLocationChange(history.location)
history.listen(handleLocationChange)
```
