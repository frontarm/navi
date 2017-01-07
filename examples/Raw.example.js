import React, { Component, PropTypes } from 'react'
import { createJunction, createConverter, locationsEqual } from 'junctions'
import { Link } from 'react-junctions'


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
  home: {},
})
function AppScreen({ route, locate, history }) {
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
        <Link history={history} to={locate()}>Home</Link>
        <Link history={history} to={locate(AppScreen.junction.createRoute('about'))}>About</Link>
      </nav>
      {content}
    </div>
  );
}

export default class BasicExample extends Component {
  componentWillMount() {
    this.converter = createConverter(AppScreen.junction)
    this.handleLocationChange(this.props.history.location)
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(this.handleLocationChange.bind(this))
  }

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten()
      this.unlisten = null  
    }
  }

  handleLocationChange(location) {
    const route = this.converter.route(location)
    const canonicalLocation = route && this.converter.locate(route)

    if (route && !locationsEqual(location, canonicalLocation)) {
      this.props.history.replace(canonicalLocation)
    }

    this.setState({ route })
  }

  render() {
    return (
      <AppScreen
        route={this.state.route}
        locate={this.converter.locate}
        history={this.props.history}
      />
    )
  }
}


