import React, { Component } from 'react'
import { Link } from 'react-junctions'
import { JunctionSet, Junction, Branch, Param, createRoute } from 'junctions'
import ContactDetailsScreen from './ContactDetailsScreen'


const Main = Junction({
  List: Branch({ default: true }),
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
})

const Modal = Junction({
  Add: Branch(),
})


export default class ContactsScreen extends Component {
  static junctionSet = JunctionSet({ main: Main, modal: Modal })

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
            <Link to={ locate(main, createRoute(Modal.Add)) }>Add</Link>
          </nav>
          <ul>
            <li>
              <Link to={ locate(createRoute(Main.Details, { id: 'abcdef', slug: 'james-nelson' })) }>James Nelson</Link>
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
