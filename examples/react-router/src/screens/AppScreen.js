import React, { Component } from 'react'
import { JunctionSet, Junction, Branch, Param, createRoute } from 'junctions'
import { Link } from 'react-junctions'
import ContactsScreen from './ContactsScreen'


const Main = Junction({
  Contacts: Branch({
    default: true,
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
})


export default class AppScreen extends Component {
  static junctionSet = JunctionSet({ main: Main })

  render() {
    const locate = this.props.locate
    const { main } = this.props.routes

    return (
      <div>
        <nav>
          <Link to={locate(createRoute(Main.Contacts))}>Contacts</Link>
        </nav>
        <main.data.Component
          locate={main.locate}
          routes={main.children}
          params={main.params}
        />
      </div>
    );
  }
}
