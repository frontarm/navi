/**
 * This example shows a simple application with nested components
 * and route parameters. Its routing is handled by a <Router>
 * component from `react-junctions`.
 */

import React from 'react'
import { createJunction } from 'junctions'
import { Link, Router } from 'react-junctions'

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  )
}

function About() {
  return (
    <div>
      <h2>About</h2>
    </div>
  )
}

function Topic({ id }) {
  return (
    <div>
      <h3>{id}</h3>
    </div>
  )
}

TopicsScreen.junction = createJunction({
  details: {
    path: '/:id',
    paramTypes: {
      id: { required: true },
    },
  },
})
function TopicsScreen({ route, locate }) {
  const junction = TopicsScreen.junction

  return (
    <div>
      <h2>Topics</h2>
      <nav>
        <Link to={locate(junction.createRoute('details', { id: 'rendering' }))}>
          Rendering with React
        </Link>
        <Link to={locate(junction.createRoute('details', { id: 'components' }))}>
          Components
        </Link>
        <Link to={locate(junction.createRoute('details', { id: 'props-v-state' }))}>
          Props v. State
        </Link>
      </nav>

      {
        route
          ? <Topic id={route.params.id} />
          : <h3>Please select a topic</h3>
      }
    </div>
  )
}

AppScreen.junction = createJunction({
  about: {},
  topics: { next: TopicsScreen.junction },
})
function AppScreen({ route, locate }) {
  const junction = AppScreen.junction

  let content
  switch (route && route.key) {
    case 'about':
      content = <About />
      break

    case 'topics':
      content = <TopicsScreen route={route.next} locate={route.locate} />
      break

    default:
      content = <Home />
  }

  return (
    <div>
      <nav>
        <Link to={locate()}>Home</Link>
        <Link to={locate(junction.createRoute('about'))}>About</Link>
        <Link to={locate(junction.createRoute('topics'))}>Topics</Link>
      </nav>
      {content}
    </div>
  );
}


export default function BasicExample({ history }) {
  return (
    <Router
      history={history}
      junction={AppScreen.junction}
      render={AppScreen}
    />
  )
}


