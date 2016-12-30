import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { createConverter, locationsEqual } from 'junctions'
import { HistoryContext } from 'react-junctions'
import createHistory from 'history/createBrowserHistory'
import AppScreen from './screens/AppScreen'


const history = createHistory()
const converter = createConverter(AppScreen.junction)

function render(route) {
  ReactDOM.render(
    <HistoryContext history={history}>
      <AppScreen
        route={route}
        locate={converter.locate}
      />
    </HistoryContext>,
    document.getElementById('app')
  )
}

function handleLocationChange(location) {
  const route = converter.route(location)
  const canonicalLocation = converter.locate(route)

  if (!locationsEqual(location, canonicalLocation)) {
    history.replace(canonicalLocation)
  }

  render(route)
}

handleLocationChange(history.location)
history.listen(handleLocationChange)
