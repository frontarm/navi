# <a href='https://github.com/jamesknelson/junctions/blob/master/README.md'><img src='https://raw.githubusercontent.com/jamesknelson/junctions/master/media/logo-title-dark.png' alt="Junctions" width='232'></a>

Composable and context-free routing for React, built on the excellent [history](https://github.com/mjackson/history) package.

Why use Junctions?

- They're **composable**. Re-use components, even if they contain links!
- They're **superimposable**. Because sometimes two routes can be active at once.
- They're **context-free**. Now you can understand how your own app works!
- They're **simple**. See for yourself in the [Introduction](https://junctions.js.org/docs/introduction/Motivation.html).

## Demo

See [live demo](http://jamesknelson.com/react-junctions-example/), with source available in [examples/raw-react](https://github.com/jamesknelson/junctions/tree/master/examples/raw-react).

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
<script src="https://unpkg.com/junctions@0.1.0/dist/junctions.js"></script>
<script src="https://unpkg.com/react-junctions@0.1.0/dist/index.js"></script>
```

## Getting Started

See the what brought this package about in the short [Introduction](https://junctions.js.org/docs/introduction/Motivation.html). Then, once you're convinced it is right for you, learn how to use it with the [Getting Started](https://junctions.js.org/docs/getting-started/Locations.html) guide.

## Example

This is an example of a [Screen Component](https://junctions.js.org/docs/getting-started/ScreensAndLinks.html) written with Junctions. To see how to use this within an actual example, see one of the applications in the project's [examples](https://github.com/jamesknelson/junctions/tree/master/examples) directory.

```jsx
const ContactsMain = Junction({
  Details: Branch({
    path: '/:contactId',
    params: {
      contactId: Param({ required: true }),
    },
    data: {
      Component: ContactDetailsScreen,
    },
    children: ContactDetailsScreen.junctionSet,
  }),
})

const ContactsModal = Junction({
  Add: Branch({}),
})

class ContactsScreen extends React.Component {
  static junctionSet =
    JunctionSet({
      main: ContactsMain,
      modal: ContactsModal,
    })

  static propTypes = {
    routes: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
    locate: React.PropTypes.func.isRequired,
  }

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
        <div>
          <nav>
            <Link to={ locate(main, createRoute(ContactsModal.Add)) }>Add</Link>
          </nav>
          <ul>
            <li>
              <Link to={ locate(createRoute(ContactsMain.Details, { id: 'abcdef' })) }>James Nelson</Link>
            </li>
          </ul>
        </div>
        {
          main.data.Component &&
          <main.data.Component
            locate={main.locate}
            routes={main.children}
            params={main.params}
          />
        }
      </div>
    )
  }
}
```
