import React, { Component } from 'react'
import { Link } from 'react-router'
import { Junction, Branch, Param } from 'react-navi'
import ContactScreen from './ContactsScreen'


const Content = Junction({
  List: Branch(),
  Details: Branch({
    params: {
      id: Param({ required: true }),
      slug: Param(),
    },
    data: {
      Component: ContactScreen
    },
  }),
}, 'List')

const Modal = Junction({
  Add: Branch(),
})


export default class ContactsScreen extends Component {
  static junctions = { content: Content, modal: Modal }
  static primaryJunction = Content

  render() {
    const link = this.props.link
    const { content, modal } = this.props.routes

    return (
      <div>
        <div>
          <nav>
            <Link to={ link({ content, modal: Modal.Add() }) }>Add</Link>
          </nav>
          <ul>
            <li>
              <Link to={ link(Content.Details({ id: 'abcdef', slug: 'james-nelson' })) }>James Nelson</Link>
            </li>
          </ul>
        </div>
        {
          content.data.Component &&
          <content.data.Component link={content.link} routes={content.children} params={content.params} />
        }
      </div>
    )
  }
}
