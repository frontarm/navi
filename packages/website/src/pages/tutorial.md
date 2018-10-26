import { Link } from 'react-navi'

Junctions Tutorial: Make this site
==================================

This tutorial will walk you through creating a small documentation website using create-react-app, react-junctions, and Markdown. In fact, it'll actually walk you through creating *this* website. Cool, huh?

*You can see the end result of this tutorial at its [companion repository](https://github.com/jamesknelson/junctions-tutorial). If you get stuck, try comparing your code to this repo.*

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
import { createJunctionTemplate, createPageTemplate } from 'navi'

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

#### Why call them "templates", and not just "pages" or "junctions"?

Each time the browser's location changes, your templates are used to create new [Page](/api-reference/#Page) and [Junction](/api-reference/#Junction) objects. These contain information that can't be set ahead of time in the templates, including a Page's current URL, or a Junction's active child.

</aside>

Now that you've defined `AppJunctionTemplate`, your app has the information it needs to render different content for different URLs. But how do you *use* this information?


The `<JunctionNavigation>` Component
------------------------------------

The `<JunctionNavigation root={JunctionTemplate}>` component keeps track of the browser's current location, rendering the root junction's component whenever the URL changes.

If you're familiar with react-router, this is a bit like the `<Router>` <small>(v3)</small> or `<BrowserRouter>` <small>(v4)</small> component. The main difference is that `<JunctionNavigation>` also does a bit of housekeeping -- managing the document title, scrolling to `#hash` links, and keeping track of code splits.

### Let's add a `<JunctionNavigation>`

By default, create-react-app starts the app by rendering an `<App>` element in `index.js`:

```jsx
ReactDOM.render(<App />, document.getElementById('root'))
```

You'll want to replace this `<App>` element with a `<JunctionNavigation>` element, passing in `AppJunctionTemplate` from the previous step as its `root` prop:

```jsx
import { JunctionNavigation } from 'react-junctions'
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

#### `Junction`

- **`activeChild`:** Holds a `Page` object, based on the active child from the junction's `children` -- or `undefined` if there is no active child.
- **`children`:** *Copied from the junction template.*
- **`component`:** *Copied from the junction template.*
- **`status`:** Either `"ready"`, or `"notfound"`.

[See all properties &raquo;](/api-reference#Junction)

</div>

Each `Junction` object is based on one of your Junction Templates, but has extra properties that are derived from the browser's current URL -- including `status` and `activeChild`.

The `activeChild` property is particularly important; it contains a `Page` object, with details on whichever page is selected by the current URL:

<div className="properties">

#### `Page`

- **`component`:** *Copied from the page template.*
- **`title`:** *Copied from the page template.*
- **`url`:** The URL at which the page is mounted.

[See all properties &raquo;](/api-reference#Page)

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
      this.props.junction.activeChild && 
      this.props.junction.activeChild.component
    
    if (!Component) {
      // If the user enters an unknown URL, there will be no active child,
      // and thus no component.
      return <h1>404: Page Not Found</h1>
    }
    else {
      // Render the page's component, passing in the active Page object
      // as a prop.
      return <Component page={this.props.junction.activeChild} />
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

Once you've made this change and saved the file, your site should display the index page's content. And if you change the browser's URL to `http://localhost:3000/api-reference`, the heading should change too.

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
import React from 'react'
import { Link } from 'react-junctions'

export const Navbar = () =>
  <ul className="Navbar">
    <li><Link href="/">Junctions</Link></li>
    <li><Link href="/api-reference">API Reference</Link></li>
  </ul>
```

Where should this `<Navbar>` element be rendered from? One possibility would be to add it to each of your page's components. But as the site grows, this would become painful.

Instead, it makes sense to render the `<Navbar>` element from the `<App>` component, along with the current page. Here's an example:

```jsx
import { Navbar } from './Navbar'

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


Markdown Components
-------------------

If you're creating a documentation website, you'll probably want to write your content in a plain-text format like [Markdown](https://daringfireball.net/projects/markdown/). <small>HTML is great, but the 42nd time you have to type out &lt;p&gt; is just so...</small>

The problem, of course, is that Junctions doesn't expect plain-text content; it expects pages to provide a React Component.

One possible solution would be to load your content as text, and render it with a component like [react-remarkable](https://github.com/acdlite/react-remarkable). And while this works, it has one major problem: your links will be plain-old `<a>` elements. And they'll be *slow*.

Instead, you'll want to convert your Markdown directly into a React component with `<Link>` elements for links. There are two ways to do this:

- At runtime, using [react-markdown](https://github.com/rexxars/react-markdown).
- At build time, using [mdx-loader](https://github.com/jamesknelson/mdx-loader).

I recommend doing that conversion at build time, as it produces smaller builds, faster responses, and also allows you to import files and use JSX within your markdown. <small>Disclaimer: I created mdx-loader.</small>


### Let's add a Markdown page

To start, you'll need to add a couple packages to your project:

```bash
npm install --save-dev mdxc mdx-loader
```

You'll also need to add this `.babelrc` to the root directory of your project:

```json
{
  "presets": ["babel-preset-react-app"]
}
```

With this setup complete, you can now import Markdown files as if they were React components!

---

To test this out, you'll first need a Markdown file. I like to place my site's markdown files under a `src/content` directory, so let's add a `src/content/index.md` file:

```markdown
Junctions
=========

**A batteries-included router for React.**

## Documentation

- [API Reference](/api-reference)
```

You can then import the document as a React component by prefixing the filename with `!babel-loader!mdx-loader!`. This tells Webpack to run `index.md` through MDX, and then Babel, before importing the resulting JavaScript.

You'll also need to tell eslint that it is ok to use the Webpack `!` syntax; make sure that the following comment goes at the very top of your file!

```jsx
/* eslint-disable import/no-webpack-loader-syntax */
import IndexDocument from '!babel-loader!mdx-loader!./content/index.md'
```

Finally, set your index page's `component` property to `IndexDocument` and refresh the page; you should see the contents of your new Markdown file!


### Configuring the Markdown link component

By default, MDX uses vanilla `<a>` tags for links -- but we want to use `<Link>` elements to improve performance.

Luckily, MDX allows you to configure [factories](https://github.com/jamesknelson/mdxc#factories) for each type of markup that it can produce. To do so, you just pass a `factories` prop to the document component.

For example, here's how you'd create an `IndexDocumentWrapper` component that renders its links as JSX `<Link>` elements:

```jsx
// Define factories outside of the component, so that the factories aren't
// re-created each time the document renders
let factories = {
  a: (props, ...children) =>
    React.createElement(Link, props, ...children)
}

const IndexDocumentWrapper = () =>
  <IndexDocument factories={factories} />
```

By using `IndexDocumentWrapper` as your index page `component`, you'll ensure that the page's links are just as snappy as any other links within your application.

You can also use MDX factories to configure other behaviors. For example, you could use factories to add `#hash` links to each of your document's headings.

But while factories give you flexibility, they're also rather verbose. Creating a new wrapper component for each page would quickly get tiresome. But luckily, you don't have to!


Split Content
-------------

Up until now, this tutorial has only used a subset of the available options for page templates. In fact, you can configure more than just a `title` and a `component`; you can see the full suite of options in the [API Reference](/api-reference/#createPageTemplate).

There is one option in particular that comes in handy: `getContent`. This option lets you specify a function that returns your content, or a *promise* to your content. The function will then be called the first time the page is loaded.

Your content can be anything -- a text file, a React component, or even a module returned by ESNext's proposed `import` syntax. And once your content is available, it can be accessed by the page's component under the `content` property of your Page object.

For example, here's how you'd use `getContent` and `import()` to dynamically load a markdown file when the page is first accessed:

```jsx
createPageTemplate({
  title: 'Junctions API Reference',

  getContent: () =>
    // `import()` returns a promise to an object with all of the module's
    // exports.
    import('!babel-loader!mdx-loader!./content/api-reference.md'),

  // When the import statement completes, the loaded module will be available
  // under `page.content`.
  component: ({ page }) =>
    !page.content
      ? <div>Loading...</div>
      : React.createElement(page.content.default),
}),
```


### Content Wrapper Components

Now that your page's content has been separated from the component that renders it, it is possible to create a single Wrapper component that can be shared over all markdown pages.

You have a lot of flexibility in how you implement this. You can add loading spinners, error messages, markdown factories, menus, and a bunch of other bits and pieces.

For example, here's a stripped-down version of the [wrapper component](https://github.com/jamesknelson/junctions/blob/master/site/src/MDXWrapper.js) for this website. It makes use of the Page object's `contentStatus` property to give the user feedback on the content's status.

```jsx
import React from 'react'
import { Link } from 'react-junctions'

function createHeadingFactory(type) {
  return (props, ...children) => {
    return React.createElement(
      type,
      props,
      ...children,
      // Append a hash link to each heading, which will be hidden via
      // CSS until he mouse hovers over the heading.
      <Link className='heading-link' href={'#'+props.id}>#</Link>
    )
  }
}

export class MarkdownWrapper extends React.Component {
  factories = {
    a: (props, ...children) =>
      React.createElement(Link, props, ...children),

    h1: createHeadingFactory('h1'),
    h2: createHeadingFactory('h2'),
    h3: createHeadingFactory('h3'),
  }
 
  render() {
    let page = this.props.page
    return (
      <div className='MarkdownWrapper'>
        { page.contentStatus === 'busy' &&
          <div className='page-loading' />
        }
        { page.contentStatus === 'ready' &&
          <div className='page-ready'>
            {React.createElement(page.content.default, {
              factories: this.factories,
              page: page,
            })}
          </div>
        }
        { page.contentStatus === 'error' &&
          <div className='page-error'>
            <h1>Gosh darn it.</h1>
          </div>
        }
      </div>
    )
  }
}
```

Once you have a Markdown wrapper component, you can use it in a page template's `component` property:

```jsx
createPageTemplate({
  title: 'Junctions API Reference',
  component: MarkdownComponent,
  getContent: () =>
    import('!babel-loader!mdx-loader!./content/api-reference.md'),
}),
```

Congratulations on getting this far through the tutorial! By now, you've learned everything you need to re-create this website -- at least within create-react-app's development server!

The only thing left to do is to turn your site into a production-ready static website!


Static Builds
-------------

To create a static website from a junctions app, you'll first need to add the `junctions-static` package to your app:

```bash
npm install --save-dev junctions-static
```

This package includes a command-line tool that loads the output of CRA's `build` script, then walks through each junction template's children to find your app's URLs.

You can call the command line tool manually, by I recommend adding it to the end of the `build` script in `package.json`. Here's what the resulting line will look like:

```json
"build": "react-scripts build && junctions-static build -m build/static/js/main.*.js -r create-react-app",
```


### Changes to `index.js`

To get the static build working, you'll need to make some changes to your app's entry point. Here's an example of a modified `index.js`; I'll go through the changes one-by-one after the code listing.

```jsx
function main() {
  let content =
    <JunctionNavigation
      root={AppJunctionTemplate}
      waitForInitialContent
    />

  let node = document.getElementById('root')
  if (process.env.NODE_ENV === 'production') {
    ReactDOM.hydrate(content, node)
  }
  else {
    ReactDOM.render(content, node)
  }
}

if (process.env.NODE_ENV !== 'production') {
  main()
  registerServiceWorker()
}

window.JunctionsStaticApp = {
  root: AppJunctionTemplate,
  main: main
}
```

#### 1. Add a `main` function

Because junctions-static loads your app from a Node environment, you won't want your app to follow its normal boot process in a static build.

To solve this, I recommend moving the contents of `index.js` into a `main()` function, and only calling that function when running from CRA's development server.

```js
if (process.env.NODE_ENV !== 'production') {
  main()
  registerServiceWorker()
}
```

#### 2. Call `ReactDOM.hydrate` in production

This method is just like `ReactDOM.render`, but it lets React know that the
content has been statically rendered, and is already available in the DOM.

```js
ReactDOM.hydrate(content, node)
```

#### 3. Export your root junction template and `main()` function

Junctions-static can't find your application's junctions unless you tell it where they are. Likewise, it can't call the `main()` function unless it has access to it.

To solve this, you'll need to export your junction template and `main` function by adding them to the global `window` object.

```js
window.JunctionsStaticApp = {
  root: AppJunctionTemplate,
  main: main
}
```

#### 4. Add the `waitForInitialContent` prop to `<JunctionNavigation>`

This prop tells Junctions to wait for your initial page's content promise to resolve before rendering any content. This ensures that you don't see a loading message while the first page is loading.

```jsx
<JunctionNavigation
  root={AppJunctionTemplate}
  waitForInitialContent
/>
```

### Congratulations!

With these changes, your build should now work! To test it out, just run:

```bash
npm run build
```

And then follow CRA's instructions to start a build server!

There's just one thing left to do. If you open your site in a browser, Junctions will update the document title to "Junctions"... but not before flashing CRA's default title for a split second.

To makes sure that each of your page's files has the correct title, change the `<title>` line in `public/index.html` to the following:

```html
<title>%PAGE_TITLE%</title>
```

In fact, if you add a `meta` property to your page templates, you'll be able to access any of its values using the `%template%` syntax within `index.html`. You can see this in action in [the source](https://github.com/jamesknelson/junctions/blob/master/site/public/index.html) for this site's `index.html`.

And with that, you're ready to start building sites with junctions. Congratulations!
