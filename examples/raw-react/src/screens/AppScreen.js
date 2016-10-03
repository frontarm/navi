import React, { Component } from 'react'
import { JunctionSet, Junction, Branch, Param } from 'junctions'
import Link from 'react-junctions/Link'
import ContactsScreen from './ContactsScreen'


const Content = Junction({
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
}, 'Contacts')


export default class AppScreen extends Component {
  static junctionSet = JunctionSet({ content: Content }, 'content')

  render() {
    const locate = this.props.locate
    const { content } = this.props.routes

    return (
      <div>
        <nav>
          <Link to={locate({ content: Content.Contacts() })}>Contacts</Link>
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
