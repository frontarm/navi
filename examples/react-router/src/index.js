import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import { Mount } from 'react-router-junctions'
import AppScreen from './screens/AppScreen'
import './index.css'


ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/some-route">
      <Mount path="test-1" component={AppScreen} />
    </Route>
    <Mount path="/test-2" component={AppScreen} />
    <Mount path="/" component={AppScreen} />
  </Router>,
  document.getElementById('app')
)
