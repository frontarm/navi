# <a href='https://github.com/jamesknelson/junctions/blob/master/README.md'><img src='https://raw.githubusercontent.com/jamesknelson/junctions/master/media/logo-title-dark.png' alt="Junctions" width='232'></a>

Routing you can understand. Built on the excellent [history](https://github.com/mjackson/history) package.

Why use Junctions?

- **It's built for components.** Use with React, Vue, or even Angular!
- **It makes links composable.** Now routing is reusable too!
- **It works with HTML5 History.** Don't limit yourself to old tech.
- **It's simple.** Everything you need in 4 functions and 4 methods.

## Demo

See [live demo](http://jamesknelson.com/react-junctions-example/), with source available in [examples/raw-react](https://github.com/jamesknelson/junctions/tree/master/examples/raw-react). Then read the [Getting Started](https://junctions.js.org/docs/getting-started/Locations.html) guide to see how it works.

## Installation

At minimum, you'll need the junctions package

```
npm install junctions --save
```

If you want a `<Link>` component to get `pushState` working with React, install `react-junctions`

```
npm install react-junctions --save
```

Or if you want to use junctions-based components within a react-router application, install `react-router-junctions`

```
npm install react-router-junctions --save
```

Alternatively, use plain-ol' script tags with unpackage. See the live demo source for an example.

```
<script src="https://unpkg.com/junctions@0.2.6/dist/junctions.js"></script>
<script src="https://unpkg.com/react-junctions@0.2.6/dist/index.js"></script>
```

## Getting Started

But first, you really should understand whether you even *need* a router. The [Introduction](https://junctions.js.org/docs/introduction/DoINeedARouter.html) covers this, before introducing the three main concepts you'll use with Junctions. And as a bonus, it uses pictures!

The next step is to actually use them. The [Tutorial]() is makes this easy. You'll have your first app working in just a few minutes.

And once you've finished the tutorial and have built something with Routes, Locations and Junctions, you'll be ready to build the next unicorn killer! But if you'd like to explore the limits of Junctions, the [API documentation]() has you covered.

## Example

The best way to understand Junctions is to see it in action. This example demonstrates how you could write a master-detail contact list component, using Junctions for routes. To see how to use this within an actual application, see one of the projects in this repository's [examples](https://github.com/jamesknelson/junctions/tree/master/examples) directory.

```jsx
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
    const { route, locate, contacts } = this.props.locate
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
```
