# Example

Let's put this all together with an example of Junctions usage which follows the above Junctions diagram. I've written the example in React, but you should be able to use Junctions with any component-based view library.

```jsx
const history = History.createBrowserHistory()
const { JunctionSet, Junction, Branch, Param, Serializer } = Junctions
const { Link } = ReactJunctions


/*
 * Dashboard Screen
 */

const DashboardScreen = React.createClass({
  render: function() {
    return (
      <div>
        <h2>Dashboard</h2>
      </div>
    )
  },
})


/*
 * Contacts Screen
 */

const ContactsContent = Junction({
  list: Branch({}),

  id: Branch({
    path: '/:id',
    params: {
      id: Param({ required: true }),
    }
  }),
},
'list')

const ContactsModal = Junction({
  add: Branch({}),
})


const ContactsScreen = React.createClass({
  statics: {
    junctionSet:
      JunctionSet({
        content: ContactsContent,
        modal: ContactsModal,
      },
      'content')
  },

  render: function() {
    const locate = this.props.locate
    const { page, pageSize } = this.props.params
    const { content, modal } = this.props.routes

    const detail = 
      content &&
      content.branch == ContactsContent.id &&
      <div>
        <h3>Contact #{content.params.id}</h3>
      </div>

    const modalElement =
      modal &&
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{backgroundColor: 'white'}}>
          <h1>Add</h1>
          <nav>
            <Link to={ locate({ content, modal: null }) } history={history}>Close</Link>
          </nav>
        </div>
      </div>

    return (
      <div>
        <div>
          <h2>Contacts Page {this.props.params.page}</h2>
          <nav>
            <Link to={ locate({ content, modal: ContactsModal.add() }) } history={history}>Add</Link>
          </nav>
          <ul>
            <li><Link to={ locate({ content: ContactsContent.id({ id: 'james-nelson' }) }) } history={history}>James K Nelson</Link></li>
          </ul>
        </div>
        {detail}
        {modalElement}
      </div>
    )
  },
})


/*
 * App Screen
 */

const AppContent = Junction({
  dashboard: Branch({
    data: {
      Component: DashboardScreen,
    },
  }),
  contacts: Branch({
    path: '/contacts',
    data: {
      Component: ContactsScreen,
    },
    children: ContactsScreen.junctionSet,
    params: {
      page: Param({
        default: 1,
        serializer: Serializer({ serialize: x => String(x), deserialize: x => x === '' ? null : parseInt(x) })
      }),
      pageSize: Param({
        default: 20,
        serializer: Serializer({ serialize: x => String(x), deserialize: x => x === '' ? null : parseInt(x) })
      }),
    },
  }),
},
'dashboard')


const AppScreen = React.createClass({
  statics: {
    junctionSet:
      JunctionSet({
        content: AppContent,
      },
      'content')
  },

  render: function() {
    const locate = this.props.locate
    const { content } = this.props.routes

    return (
      <div>
        <p>
          Hi! This is a demo for the <a href="https://github.com/jamesknelson/junctions">Junctions</a> routing system for React.
        </p>
        <p>
          The source is all contained in old-school script tags. View source to get smarter. Also check out the <a href="">Junction Diagram</a>.
        </p>
        <hr />
        <nav>
          <Link to={ locate({ content: AppContent.dashboard() }) } history={history}>Dashboard</Link>
          <Link to={ locate({ content: AppContent.contacts() }) } history={history}>Contacts</Link>
        </nav>
        <content.data.Component
            routes={content.children}
            locate={content.locate}
            params={content.params}
        />
      </div>
    )
  },
})


/*
 * Entry Point
 */

const baseLocation = { pathname: '/' }
const locationConverter = Junctions.createConverter(AppScreen.junctionSet)
const locate = routeSet => locationConverter.getLocationFromRouteSet(routeSet, baseLocation)

function render(routes) {
  ReactDOM.render(
    <AppScreen
      routes={routes}
      locate={locate}
    />,
    document.getElementById('app')
  )
}

function handleLocationChange(location) {
  const routes = locationConverter.getRouteSetFromLocation(location, baseLocation)
  const canonicalLocation = locate(routes)

  if (!Junctions.locationsEqual(location, canonicalLocation)) {
    history.replace(canonicalLocation)
  }

  render(routes)
}

handleLocationChange(history.location)
history.listen(handleLocationChange)
```
