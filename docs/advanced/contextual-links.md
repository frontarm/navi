---
title: Contextual Links
---

# Pass history via context

By wrapping your application with the [&lt;HistoryContext&gt;](/docs/api/react-junctions/HistoryContext) and [&lt;Router&gt;](/docs/api/react-junctions/Router)  components from the `react-junctions` package, you eliminate the need to pass `history` via props to each [&lt;Link&gt;](/docs/api/react-junctions/Link).

## Example

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { HistoryContext } from 'react-junctions'
import AppScreen from './screens/AppScreen'

function render(history, locate, route) {
  ReactDOM.render(
    <HistoryContext history={history}>
      <AppScreen
        routes={route}
        locate={locate}
      />
    </HistoryContext>,
    document.getElementById('app')
  )
}
```
