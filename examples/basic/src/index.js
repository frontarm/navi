import './index.css'

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
