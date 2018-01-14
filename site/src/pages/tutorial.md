import { Link } from 'react-junctions'

Junctions Tutorial: Make this site
==================================

This tutorial will walk you through creating a small documentation website using create-react-app and react-junctions. In fact, it'll actually walk you through creating *this* website. Pretty meta, huh?


Creating a react app
--------------------

Let's start out by installing create-react-app and react-junctions, and spinning up a fresh project:

```bash
# Install the create-react-app command-line tool
npm install -g create-react-app

# Create a new project under the `junctions-tutorial` directory
create-react-app junctions-tutorial
cd junctions-tutorial

# Install junctions and react-junctions
npm install --save junctions react-junctions

# Start a development server at http://localhost:3000
npm run start
```

If all has gone well, this should have created a few files for you, and opened a browser window with a spinning React logo. So far, so good.

Now, we just need to add some templates!


Templates
---------

In a junctions-based app, **templates** are the objects that define your app's URL structure. Here's an example:

```jsx
let ReadmeTemplate = createPageTemplate({
  title: 'Junctions',
  component: () =>
    <div>
      <h1>Junctions README</h1>
      <p>Blah blah blah</p>
    </div>
})
```

There are three types of templates:

- **Page templates** define the pages that users can visit.
- **Redirect templates** specify redirects between URLs.
- **Junction templates** map URL parts to pages, redirects, and/or more junctions.

### Let's add a template

At the root of every app, you'll need a `JunctionTemplate` that maps URLs to content. So let's add one.

You'll want to add it to `App.js`; the root React component lives there, so it makes sense that the root `JunctionTemplate` will too.

```js
export const AppJunctionTemplate = createJunctionTemplate({
  children: {
    '/': createPageTemplate({
      title: 'Junctions',
      component: () =>
        <div>
          <h1>Junctions</h1>
        </div>
    }),

    '/api-reference': createPageTemplate({
      title: 'Junctions API Reference',
      component: () =>
        <div>
          <h1>Junctions API Reference</h1>
        </div>
    }),
  },

  component: App,
})
```

This junction template says a few things:

1. The app has two URLs: `/api-reference`, and `/` (the root URL)
2. The `App` component will be used to render these URLs
3. The two pages have titles, and should be rendered with the specified components.

<aside>
<markdown>
#### Why call them "templates", and not just "pages" or "junctions"?

Each time the browser's location changes, your templates are used to create new [Page](/api-reference/#Page) and [Junction](/api-reference/#Junction) objects. These contain information that can't be added to the templates, including a Page's current URL, or a Junction's active child.
</markdown>
</aside>

Now that you've defined `AppJunctionTemplate`, your app has the information it needs to render different content for different URLs. But how do you *use* this information?


The `<JunctionNavigation>` Component
------------------------------------

The `<JunctionNavigation root={JunctionTemplate}>` component keeps track of the browser's current location, rendering the root junction's component whenever the URL changes.

If you're familiar with react-router, this is a bit like the `<Router>` <small>(v3)</small> or `<BrowserRouter>` <small>(v4)</small> component. The main difference is that `<JunctionNavigation>` also does a bit of housekeeping -- managing the document title, scrolling to `#hash` links, and keeping track of code splits.

### Let's add a `<JunctionNavigation>`

By default, create-react-app starts the app by rendering an `<App>` element in `index.js`:

```jsx
ReactDOM.render(
  <App />,
  document.getElementById('root')
)
```

You'll want to replace this `<App>` element with a `<JunctionNavigation>` element, passing in `AppJunctionTemplate` from the previous step as its `root` prop:

```jsx
import { AppJunctionTemplate } from './App'

// Instead of rendering `<App>` directly, it will be rendered by
// `<JunctionNavigation>`.
ReactDOM.render(
  <JunctionNavigation root={AppJunctionTemplate} />,
  document.getElementById('root')
)
```

Go ahead - try making this change if you haven't already. Once you've saved the file, create-react-app's development server should automatically reload the page, and you should still see a spinning React logo.

*But you shouldn't see any change in the content!*

The thing is, `<JunctionNavigation>` is just rendering `<App>`. And we haven't changed touched the `App` class yet, so nothing *visible* has changed.

But one thing has changed: the `<App>` component is now receiving a `junction` prop.


Junctions and Pages
-------------------

When your `<JunctionNavigation>` component renders the `<App>` component, it passes it a `junction` prop. This prop contains the navigation state for your entire app, and looks a little like this:

<div className="properties">
<markdown>
#### `Junction`

- **`activeChild`:** Holds a `Page` object, based on the active child from the junction's `children` -- or `undefined` if there is no active child.
- **`children`:** *Copied from the junction template.*
- **`component`:** *Copied from the junction template.*
- **`status`:** Either `"ready"`, or `"notfound"`.

[See all properties &raquo;](/api-reference#Junction)
</markdown>
</div>

Each `Junction` object is based on one of your Junction Templates, but has extra properties that are derived from the browser's current URL -- including `status` and `activeChild`.

The `activeChild` property is particularly important; it contains a `Page` object, with details on whichever page is selected by the current URL:

<div className="properties">
<markdown>
#### `Page`

- **`component`:** *Copied from the page template.*
- **`title`:** *Copied from the page template.*
- **`url`:** The URL at which the page is mounted.

[See all properties &raquo;](/api-reference#Page)
</markdown>
</div>


Rendering Content
-----------------

Now that your `App` component receives a `junction` prop, you can decide what to render by checking `this.props.junction.activeChild`.

Keeping in mind that `activeChild` may be `undefined`, your new App class may look something like this:

```js
class App extends React.Component {
  renderContent() {
    let { junction } = this.props

    // If there is a currently selected page, get its component.
    // Use an uppercase `C` so the variable can be used in a JSX element.
    let Component =
      this.props.activeChild && 
      this.props.activeChild.component
    
    if (!Component) {
      // If the user enters an unknown URL, there will be no active child,
      // and thus no component.
      return <h1>404: Page Not Found</h1>
    }
    else {
      // Render the page's component, passing in the active Page object
      // as a prop.
      return <Component page={this.props.activeChild} />
    }
  }

  render() {
    return (
      <div className='App'>
        {this.renderContent()}
      </div>
    )
  }
}
```

Once you've made this changed and saved the file, your site should display the index page's content. And if you change the browser's URL to `http://localhost:3000/api-reference`, the heading should change too.

Did your app work as expected? If not, you'll want to figure out what is wrong before continuing, as this step is crucial to making a working app.

So does your app work? In that case, congratulations! You've built a working app with Junctions!


Links
-----

Because junctions produces static files, you *can* create links with HTML `<a>` tags. But they won't be ideal.

The thing about `<a>` tags is that they'll cause the browser to completely reload the page. For example, you can try clicking on the link below, which goes to the *Links* heading above:

`<a href="/tutorial#Links">`<a href="/tutorial#Links">Tutorial / Links</a>`</a>`

When clicking this link, you may notice a flash of no content as the browser reloads the page. <small>(Or you might not, because Junctions generates ridiculously fast websites.)</small>

To solve this, you can use the HTML5 History API's [pushState](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method) method. This method changes the URL in the browser's location bar, *without* reloading the page.

But writing your own `pushState` code wouldn't be much fun, which is why Junctions gives you a `<Link>` component. This component behaves like `<a>`, but uses `pushState` internally. Notice the speed difference when you click this link:

`<Link href="/tutorial#Links">`<Link href="/tutorial#Links">Tutorial / Links</Link>`</Link>`


### Let's add a navbar

The navbar on the left of this page is chock-full of links. So let's test out the `<Link>` component by creating an unstyled `<Navbar>`:

```jsx
// src/Navbar.jsx

export const Navbar = () =>
  <ul className="Navbar">
    <li><Link href="/">Junctions</Link></li>
    <li><Link href="/api-reference">API Reference</Link></li>
  </ul>
```

Where should this `<Navbar>` element be rendered from? One possibility would be to add it to each of your page's components. But as the site grows, this would become painful.

Instead, it makes sense to render the `<Navbar>` element from the `<App>` component, along with the current page. Here's an example:

```jsx
render() {
  return (
    <div className='App'>
      <Navbar />
      <div className='App-content'>
        {this.renderContent()}
      </div>
    </div>
  )
}
```


Page Content
------------

```bash
npm install mdxc mdx-loader
```

- use MDX-loader to convert markdown into React Components
- configure an `a` factory to get push-state enabled links within markdown


Static Builds
-------------

- add .babelrc, so MDX-loader's ES6 output will be compiled into ES5
- see [building with create-react-app](/static-sites-with-create-react-app)