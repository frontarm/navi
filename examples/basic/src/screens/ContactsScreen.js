import React, { Component } from 'react'
import { Link } from 'react-junctions'
import { createJunction } from 'junctions'
import ContactDetailsScreen from './ContactDetailsScreen'


const Main = createJunction({
  list: {
    default: true
  },
  details: {
    path: '/:slug/:id',
    paramTypes: {
      id: {
        required: true
      },
      slug: {
        default: '-'
      },
    },
    data: {
      Component: ContactDetailsScreen
    },
  },
})

const Modal = createJunction({
  add: {},
})


export default class ContactsScreen extends Component {
  static junctions = { main: Main, modal: Modal }

  render() {
    const locate = this.props.locate
    const { main, modal } = this.props.routes

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
            <Link to={ locate(main, Modal.createRoute('add')) }>Add</Link>
          </nav>
          <ul>
            <li>
              <Link to={ locate(Main.createRoute('details', { id: 'abcdef', slug: 'james-nelson' })) }>James Nelson</Link>
            </li>
          </ul>
        </div>
        {
          main.data.Component &&
          <main.data.Component locate={main.locate} routes={main.children} params={main.params} />
        }
      </div>
    )
  }
}
