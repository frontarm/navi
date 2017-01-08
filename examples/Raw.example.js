/**
 * This example shows how to use Junctions without any react-router
 * integrations, except the `<Link>` component (which is not specific
 * to Junctions).
 *
 * In particular, we forgo use of the `<Router>` component, instead
 * creating a managing our own `Converter` object within the `<BasicExample>`
 * component.
 */

import React, { Component, PropTypes } from 'react'
import { createJunction, createConverter, locationsEqual } from 'junctions'
import { Link } from 'react-junctions'


// Create a Junction to specify the possible navigation states of our
// <AppScreen> component
const junction = createJunction({
  about: {},
  help: {},
})

function AppScreen({ route, locate, history }) {
  // Choose what content to render based on the current state of our
  // junction, as read from `props.route`
  let content
  switch (route ? route.key : route) {
    case 'about':
      content = <h2>About</h2>
      break

    case 'help':
      content = <h2>Help</h2>
      break

    // As our Junction has no default branch, we handle the default
    // case 
    case null:
      content = <h2>Home</h2>
      break

    // An undefined route indicates that the converter didn't know how
    // to handle the received location
    case undefined:
      content = <h2>404 - Computer Says No</h2>
      break
  }

  return (
    <div>
      <nav>
        {/*
          Use `locate()` to get a `Location` for the current route, but with
          any children nulled out
        */}
        <Link history={history} to={locate()}>
          Home
        </Link>


        <Link history={history} to={locate(junction.createRoute('about'))}>
          About
        </Link>
        <Link history={history} to={locate(junction.createRoute('help'))}>
          Help
        </Link>

        {/*
          We can specify our own Location with the `<Link>` component, but
          there is no gaurantee it will be correct!
        */}
        <Link history={history} to={{ pathname: '/computer-says-no' }}>
          Fail
        </Link>
      </nav>
      {content}
    </div>
  );
}


/**
 * All of the live examples export a single component that takes a `history`
 * object which is passed in by the documentation website app.
 * 
 * You could still use these example component's as-is in a standard React
 * app -- you'd just need to create and pass in your own `history`.
 * 
 * To find out about `history` objects, see
 * https://github.com/mjackson/history.
 */
export default class BasicExample extends Component {

  componentWillMount() {
    // As an application's Junction doesn't usually change at runtime,
    // we only ever need a single application-wide converter
    this.converter = createConverter(junction)

    // Handle the application's initial location
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
    // Convert the Location object emitted by our history into a Route
    // through our application Junction
    const route = this.converter.route(location)

    // The Route produced by the converter may contain informatino which
    // the received Location object doesn't, due to default parameters
    // and default branches. If this is the case, create a new Location
    // object containing the new information, and redirect to it
    const canonicalLocation = route && this.converter.locate(route)
    if (route && !locationsEqual(location, canonicalLocation)) {
      this.props.history.replace(canonicalLocation)
    }

    // Add the route to component state to trigger a re-render
    this.setState({ route })
  }

  render() {
    return (
      // Screen Components always take `route` and `locate` props, so they
      // can decide what to render, and create Locations for any Links
      // and redirects.
      //
      // In this example, we also pass a history. Usually, this would be
      // passed via context, using a <Router> or <HistoryContext> component.
      <AppScreen
        route={this.state.route}
        locate={this.converter.locate}
        history={this.props.history}
      />
    )
  }

}


