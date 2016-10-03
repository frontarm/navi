import React, { Component } from 'react'
import Link from 'react-junctions/Link'
import { JunctionSet, Junction, Branch, Param } from 'junctions'
import ContactDetailsScreen from './ContactDetailsScreen'


const Content = Junction({
  List: Branch(),
  Details: Branch({
    path: '/:slug/:id',
    params: {
      id: Param({ required: true }),
      slug: Param({ default: '-' }),
    },
    data: {
      Component: ContactDetailsScreen
    },
  }),
}, 'List')

const Modal = Junction({
  Add: Branch(),
})


export default class ContactsScreen extends Component {
  static junctionSet = JunctionSet({ content: Content, modal: Modal }, 'content')

  render() {
    const locate = this.props.locate
    const { content, modal } = this.props.routes

    return (
      <div>
        {
          modal &&
          <div>
            Add A Contact
          </div>
        }
        <div>Page: {this.props.params.page}</div>
        <div>Page Size: {this.props.params.pageSize}</div>
        <div>
          <nav>
            <Link to={ locate({ content, modal: Modal.Add() }) }>Add</Link>
          </nav>
          <ul>
            <li>
              <Link to={ locate({ content: Content.Details({ id: 'abcdef', slug: 'james-nelson' }) }) }>James Nelson</Link>
            </li>
          </ul>
        </div>
        {
          content.data.Component &&
          <content.data.Component locate={content.locate} routes={content.children} params={content.params} />
        }
      </div>
    )
  }
}
