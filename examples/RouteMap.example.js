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


AppScreen.junction = createJunction({
  about: {},
})
function AppScreen({ route, locate }) {
  const junction = AppScreen.junction

  let content
  switch (route && route.key) {
    case 'about':
      content = <About />
      break

    default:
      content = <Home />
  }

  return (
    <div>
      <nav>
        <Link to={locate()}>Home</Link>
        <Link to={locate(junction.createRoute('about'))}>About</Link>
      </nav>
      {content}
    </div>
  );
}


export default function MenuExample({ history }) {
  return (
    <Router
      history={history}
      junction={AppScreen.junction}
      render={AppScreen}
    />
  )
}
