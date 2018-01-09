Static websites with create-react-app
=====================================

Where a normal create-react-app project will output only a single "index.html" file, this project will output one HTML file for each of your app's routes.

But you get a lot more than just a few HTML files:

- The page `<title>` is set as you navigate, as well as in the statically generated files
- You can dynamically load pages using `import`
- Scrolling is handled when the URL changes, and `#hash` links are handled even when there's a delay due to dynamic page loads
- You can declare redirects which will be followed at runtime, and output as `.headers` files at build time
- You'll be notified at build time if any `<Link>` tags have invalid `href` attributes

*And all this without ejecting.*


Try it out
----------

From the project's, you can install, build and start a server for the app with 3 commands:

```bash
npm install
npm run build
npm run view
```

Then just open http://localhost:3000, and presto!


What magic is this?
-------------------

This app declares all of its routes using something called *Template* objects. There are three types of templates: Pages, Redirects, and Junctions. Here you can see all three in action:

```jsx
class AppComponent extends React.Component {
  static propTypes = {
    junction: PropTypes.shape({
      activeChild: PropTypes.object,
    })
  }

  render() {
    let junction = this.props.junction

    if (!junction.activeChild) {
      return <div>Not Found</div>
    }
    else {
      return React.createElement(junction.activeChild.component, {
        page: junction.activeChild,
      })
    }
  }
}


export default createJunctionTemplate({
  children: {
    '/': createRedirectTemplate('/hello'),

    '/hello': createPageTemplate({
      title: "Hello, world!",

      component: ({ page }) =>
        <div>
          <h1>{page.title}</h1>
        </div>
    })
  },

  component: AppComponent,
})
```

Notice how the component is *inside* the template? This is important; it means that the routes can be loaded and analyzed without actually running any React code, making it possible to build a static version of your app..


Creating templates
------------------

Your app's routes are defined Template objects. There are three types of templates: pages, redirects, and junctions.

### `createPageTemplate(options)`

Page templates are simple, they just define something that can be rendered when the user visits a URL.

#### Options

- `title` *(required)*

  The page's title, which will be set when the user navigates to the page.

- `component` *(required)*

  A component that will be used to render the page. The component will receive
  a `page` prop, with the following keys:

  * `url` - the URL at which the page was mounted
  * `title`
  * `meta`
  * `content`
  * `contentStatus`
  * `params`

- `meta` *(optional)*

  An object containing arbitrary information about the page. It's values are available as template variables within `/public/index.html`.

- `getContent()` *(optional)*

  If present, this will be called when the page is first loaded, and its result will be made available to the component under the `page.content` prop.

  You can also return a promise to the content, which makes it ideal for use with dynamic imports via `import()`. If a promise is returned, you can check whether the content is loaded by accessing `page.contentStatus`, which will have a value of `ready`, `busy` or `error`.

- `params` *(optional)*

  An array of names of URL query parameters that belong to this page.

#### Example

```js
createPageTemplate({
  title: 'React Armory',
  meta: {
    description: "Advanced React for Experienced Developers.",
  },
  component: MarkdownWrapper,
  getContent: () => import('!raw!./pitch.md'),
})
```

### `createRedirectTemplate(path | (mountLocation) => path)`

Redirect templates let you specify that a given path should redirect to another path.

You can either provide an absolute path, or you can provide a function that takes the path which the redirect is mounted at, and returns the path to redirect to.

#### Example

```js
// Redirect to '/new', underneath the path where the location was mounted
createRedirectTemplate((location) => path.join(location.pathname, 'new'))
```

### `createJunctionTemplate(options | getOptions)`

Junction Templates let you map paths to child templates.

Generally, you'll just pass this function an options object. However, if you want to perform dynamic loading of your site's components via the proposed `import()` syntax, you'll need to pass a function that returns your options, and use the supplied `split` function to wrap the promises (see the example below for details).

#### Options

- `children` *(required)*

  An object that maps URL paths to the Pages, Redirect and Junctions which
  should handle them.

  The '/' path is special; if you provide a Page or Redirect, it will be used
  when the user accesses the URL at which the junction itself is mounted.

- `component` *(required)*

  A component that will be used to render this junction.

  Generally, you can just use the `JunctionComponent` component that is
  exported from the `react-junctions` package -- see the example for details.
  
  You can also specify your own component. It will receive a `junction` prop,
  with the following keys:

  * `url` - the URL at which the junction was mounted
  * `activeChild` - a Page or Junction object that corresponds with one of the
    templates in `children`, or `undefined` if there is no matching child.
  * `activePattern` - the key of the active child within the `children` object.
  * `status` - when using dynamically loaded junctions, this indicates whether
    the junction is ready. Possible values are `ready`, `busy`, `error` or
    `notfound`.
  * `meta`
  * `params`

- `meta` *(optional)*

  Any arbitrary data that you'd like to associate with the junction.

- `params` *(optional)*

  An array of names of URL query parameters that belong to this junction.

#### Examples

##### Basic

This example has the same behavior as the example at the top; it just uses
react-junctions' `JunctionComponent` instead of a hand-rolled component.

```jsx
import { JunctionComponent } from 'react-junctions'

createJunctionTemplate({
  children: {
    '/': createRedirectTemplate('/hello'),

    '/hello': createPageTemplate({
      title: "Hello, world!",

      component: ({ page }) =>
        <div>
          <h1>{page.title}</h1>
        </div>
    })
  },

  component: JunctionComponent
})
```

##### Dynamic Loading

Here's a cut-down version of the root junction used in React Armory. It uses JavaScript's proposed `import()` syntax to dynamically load templates from other files when the user first visits a page.

```jsx
import { JunctionComponent } from 'react-junctions'

createJunctionTemplate(({ split }) => {
  children: {
    '/': split(() => import('./landing/LandingPage').then(x => x.defaut)),

    '/articles': split(() => import('./articles/ArticlesJunction').then(x => x.default)),

    '/members/login': split(() => import('./members/LoginPage').then(x => x.default)),
    '/members/logout': split(() => import('./members/LogoutPage').then(x => x.default)),
  },

  component: JunctionComponent,
})
```

#### Notes

Junction Templates shouldn't contain any content themselves; if you want to display content at the URL which a junction is mounted at, add a Page Template to the '/' path.


Loading the app
---------------

This repository's main difference from vanilla create-react-app is in how the app is loaded, in `index.js`.

Instead of always starting the app, this project checks for a `REACT_APP_STATIC` environment variable, and only starts the app if it is missing. This allows the `junctions-static` tool to load the app's junction templates without rendering the complete app.

The other major difference is that the `ReactDOM.render` call now loads a `<Navigation>` component, which in turn wraps the `<App>` component. This `<Navigation>` component handles code splitting, scroll handling, setting document titles, etc.

For more info, see the comments in the `index.js` file.