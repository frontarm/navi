import React, { Component } from 'react'
import { createJunction } from 'junctions'
import { Link } from 'react-junctions'
import ContactsScreen from './ContactsScreen'


const junction = createJunction({
  contacts: {
    default: true,
    path: '/contacts',
    children: ContactsScreen.junction,
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
  static junction = junction

  render() {
    const { route, locate } = this.props

    return (
      <div>
        <nav>
          <Link to={locate(junction.createRoute('contacts'))}>Contacts</Link>
        </nav>
        <route.data.Component
          locate={route.locate}
          route={route.children}
          params={route.params}
        />
      </div>
    );
  }
}
