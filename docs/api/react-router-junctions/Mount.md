---
title: <Mount />
---

# `<Mount>`

Mount a Junctions Screen within a react-router application.

## Example

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import { Mount } from 'react-router-junctions'
import AppScreen from './screens/AppScreen'

ReactDOM.render(
  <Router history={browserHistory}>\
    <Mount path="/test" component={AppScreen} />
  </Router>,
  document.getElementById('app')
)
```
