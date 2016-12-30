import React, { Component } from 'react'
import { Link } from 'react-junctions'
import { createJunction } from 'junctions'
import ContactDetailsScreen from './ContactDetailsScreen'


const mainJunction = createJunction({
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

const modalJunction = createJunction({
  add: {},
})


export default class ContactsScreen extends Component {
  static junction = { main: mainJunction, modal: modalJunction }

  render() {
    const locate = this.props.locate
    const { main: mainRoute, modal: modalRoute } = this.props.route

    return (
      <div>
        {
          modalRoute &&
          <div>
            Add A Contact
          </div>
        }
        <div>Page: {this.props.params.page}</div>
        <div>Page Size: {this.props.params.pageSize}</div>
        <div>
          <nav>
            <Link to={ locate(mainRoute, modalJunction.createRoute('add')) }>Add</Link>
          </nav>
          <ul>
            <li>
              <Link to={ locate(mainJunction.createRoute('details', { id: 'abcdef', slug: 'james-nelson' })) }>James Nelson</Link>
            </li>
          </ul>
        </div>
        {
          mainRoute.data.Component &&
          <mainRoute.data.Component
            locate={mainRoute.locate}
            route={mainRoute.next}
            params={mainRoute.params}
          />
        }
      </div>
    )
  }
}
