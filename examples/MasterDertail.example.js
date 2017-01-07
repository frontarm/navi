class ContactsScreen extends React.Component {
  /**
   * A `Junction` object represents a set of possible routes which a component
   * knows how to render.
   *
   * Junctions-based apps use a convention where a component can tell its
   * consumers about these available routes by setting a `junction` or
   * `junctions` static property.
   */
  static junction = createJunction({
    Add: {
      data: {
        Component: NewContactScreen,
      },
    },

    Details: {
      paramTypes: {
        contactId: { required: true },
      },
      data: {
        Component: ContactDetailsScreen,
      },
    }
  })

  /**
   * Components which have defined their possible routes by setting the
   * `junction` static will expect to receive `route` and `locate` props.
   */
  static propTypes = {
    /**
     * A Route object representing the current route for this component
     * @type LocatedRoute
     */
    route: React.PropTypes.object.isRequired,

    /**
     * A function which converts a Route for this component's Junction into
     * a Location object, allowing use of Links and HTML5 History
     * @type (route: Route): Location
     */
    locate: React.PropTypes.func.isRequired,
  }

  render() {
    const { route, locate, contacts } = this.props
    const junction = ContactsScreen.junction

    /**
     * The <Link> component exported by `react-junctions` expects to be passed
     * a Location object. To get these Locations, we create Route objects with
     * `junction.createRoute`, and pass them to `this.props.locate`.
     */
    const locations = {
      add: locate(junction.createRoute('Add')),
      details: (contactId) => locate(junction.createRote('Details', { contactId }))
    }

    /**
     * Each type of route defined in a Junction has a `data` property, whose
     * value will be available on matching routes.
     *
     * By storing a Component in this `data` property, we can render a
     * different component depending on th route. And we can pass in any
     * parameters we need as well!
     */
    const content = 
      route &&
      <div className='content'>
        <route.data.Component {...route.params} />
      </div>

    return (
      <div>
        <div className='list'>
          <nav>
            <Link to={locations.add}>Add</Link>
          </nav>
          <ul>
            {contacts.map(contact =>
              <li>
                <Link to={locations.details(contact.id)}>James Nelson</Link>
              </li>
            }
          </ul>
        </div>
        {content}
      </div>
    )
  }
}
