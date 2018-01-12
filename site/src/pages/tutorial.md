Junctions Tutorial
==================

This tutorial will walk you through creating a small documentation website using create-react-app and react-junctions. In fact, it'll actually walk you through creating *this* website. Pretty meta, huh?


Creating a react app
--------------------

Let's start out by installing create-react-app and react-junctions, and spinning up a fresh project:

```bash
# Install the create-react-app command-line tool
npm install -g create-react-app

# Create a new project under the `junctions-tutorial` directory
create-react-app junctions-tutorial

# Install react-junctions and start the app
cd junctions-tutorial
npm install --save react-junctions
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

There are three types of templates: page templates, redirect templates, and junction templates. And these templates do pretty much what you'd expect:

- **Page templates** define the pages that users can visit.
- **Redirect templates** specify redirects between URLs.
- **Junction templates** map URL path segments to pages, redirects, and/or *more junctions*.


### Let's add a template

At the root of every app, you'll need a junction template that maps your app's URLs to templates. So let's add one.

You'll want to add it to `App.js`; the root React component lives there, so it makes sense that the root junction template will too.

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

This junction says a few things:

1. The app has two URLs: `/`, and `/api-reference`
2. The `App` component will be used to render each of the app's URLs (including 404s!)
3. The two pages have the specified titles, and should be rendered with the given components.

With this junction added, your app now knows about two URLs. But how does it know what to render?


The `<JunctionNavigation>` Component
------------------------------------

...

- After saving `index.js` and viewing your app, you'll see that it should show a spinning React logo again!
- But unfortunately, it *doesn't* display a `<h1>Junctions<h1>`, even though you're viewing the root URL. So what gives?


Junction objects
----------------

When your `<JunctionNavigation>` component renders the `<App>` component, it passes in a `junction` prop. This prop contains the navigation state for your entire app, and looks a little like this:

**`junction` shape**

- `children` - *Identical to `AppJunctionTemplate`.*
- `component` - *Identical to `AppJunctionTemplate`.*
- `status` - If no child matches the current URL, this will be `notfound`.
- `activeChild` - Holds a Junction or Page object based on one of the junction's `children`.

You can see that the `junction` prop actually looks a lot like your `AppJunctionTemplate` -- that's where the word *Template* comes.

But importantly, the `junction` has two extra bits of information: `status`, and `activeChild`. And these can be used by the `App` component to decide what to render.


Junction Components
-------------------

TODO: just give an example, go over the fact that page objects are based on page templates afterwards as it is probably obvious.

- `activeChild` can contain page objects
- `page` templates, like `junction` templates`, have components`
- so if there is an `activeChild`, there will also be an `activeChild.component`. And 

- it would get tiring to have to write this for each junction in your application, so react-junctions exports the `<JunctionActiveChild junction>` helper component. This helper renders the active child's component, or a message based on the status.


Links
-----

- rewrite the App component with a sidebar on the left, and content on the right


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