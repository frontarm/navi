---
---

# Pass history via context

By wrapping your application with the [&lt;HistoryContext&gt;](../../api/react-junctions/HistoryContext.md) and [&lt;Router&gt;](../../api/react-junctions/Router.md)  components from the `react-junctions` package, you eliminate the need to pass `history` via props to each [&lt;Link&gt;](../../api/react-junctions/Link.md).

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
