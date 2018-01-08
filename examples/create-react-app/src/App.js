import React, { Component } from 'react'
import { createJunctionTemplate, createPageTemplate, createRedirectTemplate } from 'junctions'
import logo from './logo.svg'
import './App.css'


class App extends Component {
  render() {
    let junction = this.props.junction

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        <a href="/users/">View users</a>
        <a href="/old-users/">Old page</a>

        {
          junction.activeChild.component &&
          React.createElement(junction.activeChild.component, { segment: junction.activeChild })
        }
      </div>
    );
  }
}


export default createJunctionTemplate(({ split }) => ({
  component: App,

  children: {
    '/users': split(() => import('./Users').then(m => m.default)),
    '/old-users': createRedirectTemplate('/users/'),
    '/': createPageTemplate({
      title: 'Junctions Example',
    }) 
  },
}))
