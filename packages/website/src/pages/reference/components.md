# Components


## `<NavProvider>`

Your app's `<NavProvider>` component is responsible for subscribing to the latest navigation state, and passing that state to Navi's *other* components.

As a result, all other components must be rendered inside a `<NavProvider>`.

### Props

#### `navigation: Navigation`

A `Navigation` object, as returned from `createBrowserNavigation()` or `createMemoryNavigation()`


## `<NavLink>`

This component can be used as a drop-in replacement for `<a>` tags. Internally, it renders an `<a>` tag so that statically rendered links will work even if JavaScript is disabled.

### Props

#### `active: boolean` <small>(optional)</small>

Allows you to explicit enable or disable the `activeClassName` and `activeStyle` props.

#### `activeClassName: string` <small>(optional)</small>

Will be added to your link's `className` if the app's current URL matches the `href` prop, or if the `active` prop is set to `true`.

#### `activeStyle: object` <small>(optional)</small>

Will be merged into your link's `style` if the app's current URL matches the `href` prop, or if the `active` prop is set to `true`.

#### `exact: bool` <small>(optional)</small>

If true, the link will only be considered to "match" the current URL if it is an *exact* match.

By default, a partial match at the beginning of the current URL will also be considered a match. This facilitates nav links, which often need to be highlighted when child pages are active.

#### `href: string` <small>(required)</small>

The url to navigate to; identical to the `href` attribute of a HTML `<a>` tag.

#### `precache: boolean` <small>(required)</small>

If specified, the linked page's content will be loaded as soon as the link is rendered.


## `<NavRoute>`

Renders the content for the latest route that has complete content.

If you'd like to render the next switch that corresponds to the next URL segment -- as opposed to rendering the innermost page - then use `<NavSegment>` or `<NavContentSegment>` instead.

#### Example

```js
class App extends Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <div className="App">
          <NavRoute />
        </div>
      </NavProvider>
    );
  }
}
```

## `<NavLoading>`

A headless component that outputs a boolean that will be true when it contains a `<NavRoute />`, `<NavSegment />` or `<NavContentSegment />` that is loading.

### Example

```js
class App extends Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <NavLoading>
          {loading =>
            <div className="App">
              <BusyIndicator show={loading} />
              <NavRoute />
            </div>
          }
        </NavLoading>
      </NavProvider>
    );
  }
}
```

## `<NavNotFoundBoundary>`

Catches not found errors thrown by `<NavRoute />`, `<NavSegment />` or `<NavContentSegment />` 

```js
class App extends Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <NavLoading>
          {loading =>
            <Nav.NotFoundBoundary render={() =>
              <h1>Not Found</h1>
            }>
              <div className="App">
                <BusyIndicator show={loading} />
                <NavRoute />
              </div>
            </Nav.NotFoundBoundary>
          }
        </NavLoading>
      </NavProvider>
    );
  }
}
```


## `<NavSegment>`

TODO


## `<NavContentSegment>`

TODO