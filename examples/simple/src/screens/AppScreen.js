import React, { Component } from 'react'
import { Junction, Branch } from 'react-navi'
import { Link } from 'react-router'
import ContactsScreen from './ContactsScreen'


const Content = Junction({
  Contacts: Branch({
    children: ContactsScreen,
    data: {
      Component: ContactsScreen
    }
  }),
}, 'Contacts')


export default class AppScreen extends Component {
  static junctions = { content: Content }

  render() {
    const link = this.props.link
    const { content } = {} //TODO: this.props.routes

    return (
      <div>
        <nav>
          <Link to={link(Content.Contacts())}>Contacts</Link>
        </nav>
        {/*<content.data.Component link={content.link} routes={content.children} params={content.params} />*/}
      </div>
    );
  }
}
