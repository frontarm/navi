import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import { Mount } from 'react-navi/react-router'
import AppScreen from './screens/AppScreen'
import './index.css'

ReactDOM.render(
  <Router history={browserHistory}>
    <Mount path="/" component={AppScreen} />
  </Router>,
  document.getElementById('root')
);
