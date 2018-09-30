Static builds with create-react-app
===================================

This article will guide you through adding static builds to a fresh create-react-app project.

Before getting started, make sure you've installed the dependencies:

```bash
npm install --save junctions react-junctions junctions-static
```


## 1. Export a Junction from `App.js`

To build a static website with `junctions-static`, you'll first need to define your app's route templates with [`createJunctionTemplate`](/api-reference/#createJunctionTemplate) and [`createPageTemplate`](/api-reference/#createPageTemplate).

There are a number of approaches you can use to structure your route templates, but I recommend starting out by exporting a root `AppJunctionTemplate` from `App.js`. Here's an example; for more information on defining templates see the documentation on `createJunctionTemplate` and `createPageTemplate`.

```jsx
import { createJunctionTemplate, createPageTemplate } from 'junctions'
import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'


class App extends Component {
  renderChild() {
    // The `junction` prop receives information on which of the App junction's
    // children corresponds to the current URL.
    let junction = this.props.junction

    if (junction.activeChild) {
      return React.createElement(junction.activeChild.component, {
        [junction.activeChild.type]: junction.activeChild,
      })
    }
    else {
      return <div>404</div>
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        {this.renderChild()}
      </div>
    );
  }
}


export const AppJunctionTemplate = createJunctionTemplate({
  children: {
    '/': createPageTemplate({
      title: 'Welcome to React',
      component: () =>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
    })
  },

  component: App,
})
```


## 2. Update `index.js`

In a stock create-react-app project, `index.js` just imports the App component
and renders it. However, you'll need to make a few changes to get static builds
working:

1.  **Replace the `<App>` element with a [`<JunctionNavigation>`](/api-reference/#JunctionNavigation) element.**

    The `<JunctionNavigation>` component takes the junction template from
    `App.js`, and uses it to create the `junction` prop that contains your
    app's current navigation state.

    This component also keeps the page title up to date, handles scrolling,
    loads split bundles when required, and follows any redirects it encounters.

    For details on how to implement this, see the example below.

2.  **Use `ReactDOM.hydrate` in production.**

    This method is just like `ReactDOM.render`, but it lets React know that the
    content has been statically rendered, and is already available in the DOM.

3.  **Add a `main()` function.**

    Junctions keeps track of the dependencies of each of your site's pages, and
    only starts the app once those dependencies have been loaded.

    Because of this, you'll need to move your app's bootstrap code into a `main()`
    function, and only call it directly when in create-react-app's development
    environment.

4. **Export our root junction, and a `main()` function.**

    The junctions build tool needs access to your app's junction template and
    its `main` function.


Here's what this looks like in practice:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { AppJunctionTemplate } from './App'
import { JunctionNavigation } from 'react-junctions'
import './index.css'

function main() {
    // The `<JunctionNavigation>` component re-renders the app each time
    // the browser's location changes.
    //
    // It renders the `component` property of the template defined in App.js,
    // passing in a `junction` prop with the app's navigation state.
    let content =
        <JunctionNavigation
            root={AppJunctionTemplate}
            waitForInitialContent
        />

    // React requires us to call "hydrate" if the content already exists in
    // the DOM, which is the case for statically rendered pages.
    let node = document.getElementById('root')
    if (process.env.NODE_ENV === 'production') {
        ReactDOM.hydrate(content, node)
    }
    else {
        ReactDOM.render(content, node)
    }
}


// When building the static version of the app, we don't want to run the
// `main` function, as there is no DOM to render to.
if (process.env.NODE_ENV !== 'production') {
    main()
}


// Make the `root` template and `main` function available to junctions-static,
// so it knows what to render and how to start the app.
window.JunctionsStaticApp = {
    root: AppJunctionTemplate,
    main: main
}
```

## 3. Update the `build` script in your `package.json`

To build your app's HTML files, you'll need to call the `junctions-static`
tool once `react-scripts build` has completed:

```js
"build": "react-scripts build && junctions-static build -m build/static/js/main.*.js -r create-react-app",
```

This tool takes the output of create-react-app's standard
build process, and builds a HTML file for each of the pages under the junction
template at `window.JunctionsStaticApp.root`.

*Did you see the `-r create-react-app` argument? This tells junctions-static to use a build-in HTML renderer that works with create-react-app. But what if you need more flexibility, you can pass a custom script that renders each URL to a HTML file.*

## 4. Add the `%PAGE_TITLE%` variable to `index.html`

To make sure your static pages contain the correct title, replace the `<title>`
tag in `index.html` with this one:

```html
<title>%PAGE_TITLE%</title>
```

## 5. That's it!

To build your site, just type `npm run build`, as before!
