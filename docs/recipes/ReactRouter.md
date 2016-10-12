# Usage with react-router

Components create with the [Screens](Screens.md) pattern can be mounted within an existing react-router app using the `Mount` component in the [react-router-junctions](https://github.com/jamesknelson/react-router-junctions) package.

They can be mounted at the root of your application, under an existing route, or even in both places at once.

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import { Mount } from 'react-router-junctions'
import AppScreen from './screens/AppScreen'


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
```
