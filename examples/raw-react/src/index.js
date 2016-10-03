import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { createConverter } from 'junctions'
import HistoryContext from 'react-junctions/HistoryContext'
import createHistory from 'history/createBrowserHistory'
import AppScreen from './screens/AppScreen'


const history = createHistory()
const locationConverter = createConverter(AppScreen.junctionSet)


function render(location) {
  const routes = locationConverter.getRouteSetFromLocation(location)
  const locate = routeSet => locationConverter.getLocationFromRouteSet(routeSet)

  ReactDOM.render(  
    <HistoryContext history={history}>
      <AppScreen locate={locate} routes={routes} />
    </HistoryContext>,
    document.getElementById('root')
  )
}


render(history.location)
history.listen(render)
