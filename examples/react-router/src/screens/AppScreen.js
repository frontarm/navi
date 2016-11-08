import React, { Component } from 'react'
import { createJunction } from 'junctions'
import { Link } from 'react-junctions'
import ContactsScreen from './ContactsScreen'


const Main = createJunction({
  contacts: {
    default: true,
    path: '/contacts',
    children: ContactsScreen.junctions,
    paramTypes: {
      page: {
        default: 1
      },
      pageSize: {
        default: 20
      },
    },
    data: {
      Component: ContactsScreen
    }
  },
})


export default class AppScreen extends Component {
  static junctions = { main: Main }

  render() {
    const locate = this.props.locate
    const { main } = this.props.routes

    return (
      <div>
        <nav>
          <Link to={locate(Main.createRoute('contacts'))}>Contacts</Link>
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
