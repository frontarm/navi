# Pass history via context

By wrapping your application with the `<HistoryContext>` component from [react-junctions](https://github.com/jamesknelson/react-junctions), you eliminate the need to pass `history` via props to each `<Link>`.

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { HistoryContext } from 'react-junctions'
import AppScreen from './screens/AppScreen'

function render(history, locate, routes) {
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
```
