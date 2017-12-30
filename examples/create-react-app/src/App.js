import React, { Component } from 'react'
import { createJunction, createPage, createRedirect } from 'junctions'
import logo from './logo.svg'
import './App.css'


class App extends Component {
  render() {
    let route = this.props.route

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        <a href="/users/">View users</a>
        <a href="/old-users/">Old page</a>

        {
          route.child.component &&
          React.createElement(route.child.component, { route: route.child })
        }
      </div>
    );
  }
}


export default createJunction(({ split }) => ({
  component: App,

  children: {
    '/users': split(() => import('./Users').then(m => m.default)),
    '/old-users': createRedirect('/users/'),
    '/': createPage({
      title: 'Junctions Example',
    }) 
  },
}))
