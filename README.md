# Junctions

Declarative, composable routing for modern web applications. Built on top of [@mjackson](https://twitter.com/mjackson)'s [history](https://github.com/mjackson/history) package.

```
npm install junctions junctions-react --save
```

## Overview

Junctions is a way to convert object representing your application **Location** (i.e. URL, HTML5 History State, etc.) into objects which represent your application *Routes*, and then back again.

To facilitate this, it provides 5 types of object for you to define your application structure:

- JunctionSet
- Junction
- Branch
- Param
- Serializer

## Example: Defining application structure

```js
import { Junction, Branch, Param } from 'junctions'

import ContactsScreen from './ContactsScreen'
import DashboardScreen from './DashboardScreen'


const Content = Junction({
  Dashboard: Branch({
    data: {
      Component: DashboardScreen,
    },
  }),
  Contacts: Branch({
    path: '/contacts',
    children: ContactsScreen.junctionSet,
    params: {
      page: Param({ default: 1 }),
      pageSize: Param({ default: 20 }),
    },
    data: {
      Component: ContactsScreen
    }
  }),
}, 'Dashboard')
```

## Example: Associating routes with a component

```js
import { JunctionSet } from 'junctions'
import Link from 'react-junctions/Link'


export default class AppScreen extends Component {
  static junctionSet = JunctionSet({ content: Content }, 'content')

  render() {
    const locate = this.props.locate
    const { content } = this.props.routes

    return (
      <div>
        <nav>
          <Link to={locate({ content: Content.Contacts() })}>Contacts</Link>
          <Link to={locate({ content: Content.Dashboard() })}>Dashboard</Link>
        </nav>
        <content.data.Component
          locate={content.locate}
          routes={content.children}
          params={content.params}
        />
      </div>
    );
  }
}
```


## Example: Adding junctions to a React application

```js
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
```

## Example: Mounting a junctions-based component in an application using react-router

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import { Mount } from 'react-junctions/react-router'
import AppScreen from './screens/AppScreen'


ReactDOM.render(
  <Router history={browserHistory}>
    <Mount path="/root-path" component={AppScreen} />
  </Router>,
  document.getElementById('root')
)
```
