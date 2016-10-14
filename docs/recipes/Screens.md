# Screens

Screens are a pattern where a component has the following:

- A `junctionSet` static
- A `Component` property on the primary route's `data`

This allows you to mimic more traditional routing systems by rendering a child component based on the current Route's `Component` property, and its `params`, `locate` and `children`. 

```js
import { JunctionSet, Junction, Branch, Param } from 'junctions'
import { Link } from 'react-junctions'


const Content = Junction({
  Dashboard: Branch({
    data: {
      Component: DashboardScreen,
    },
  }),
  Contacts: Branch({
    path: '/contacts',
    children: ContactsScreen.junctionSet,
    data: {
      Component: ContactsScreen
    }
  }),
}, 'Dashboard')


export default class AppScreen extends Component {
  static junctionSet = JunctionSet({ content: Content }, 'content')

  render() {
    const locate = this.props.locate
    const { content } = this.props.routes

    return (
      <div>
        <nav>
          <Link to={locate({ content: Content.Contacts() })}>Contacts</Link>
          <Link to={locate({ content: Content.Dashboard() })}>Dashboard</Link>
        </nav>
        <content.data.Component
          locate={content.locate}
          routes={content.children}
          params={content.params}
        />
      </div>
    );
  }
}
```
