# Using Navi with react-helmet

While Navi includes some basic meta-tag management, it also works great with [react-helmet](https://github.com/frontarm/navi/tree/master/examples/react-helmet). There's just a couple things you'll need to change to configure it:

## Setting up react-helmet

### 1. Export the `Helmet`

In order to access the `<head>` info rendered by `Helmet` within the static renderer, you'll need to export it along with your `<App>` component. This means that you'll need to update the `exports` object in your call to `Navi.app()`:

```js
Navi.app({
  pages,

  // These exports will be passed to the `renderPageToString()` function in
  // navi.config.js. Learn more about `renderPageToString()` at
  // https://frontarm.com/navi/guides/static-rendering/
  exports: {
    App,

    // react-helmet stores each rendered page's <head> data directly within
    // the `Helmet` variable, so you'll need to export it too. Note that you
    // can't just import this within the renderer, as it'll re-import it as
    // completely separate object.
    Helmet,
  },

  async main() {
    //...
  }
})
```

### 2. Add a `navi.config.js`

By default, Navi doesn't know how to use the exported Helmet object -- so you'll need to teach it. To do so, you'll need to add a `renderPageToString()` function to your `navi.config.js`.

```
import * as Navi from 'navi'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { renderCreateReactAppTemplate } from 'react-navi/create-react-app'

export async function renderPageToString({
  // The URL to be rendered
  url,

  // The `exports` object passed to `Navi.app()`
  exports,
  
  // The `pages` switch passed to `Navi.app()`
  pages,

  // An object containing all rendered pages and redirects
  siteMap,
}) {
  // Create an in-memory Navigation object with the given URL
  let navigation = Navi.createMemoryNavigation({
    pages,
    url,
  })

  // Wait for any asynchronous content to finish fetching
  await navigation.steady()

  // Navi simulates a DOM using jsdom, so we'll need to manually tell
  // react-helmet that we're not in a browser.
  exports.Helmet.canUseDOM = false

  // Render the <App> element to a string, passing in `navigation` and `siteMap`
  // objects as props
  let appHTML = ReactDOMServer.renderToString(
    React.createElement(exports.App, {
      navigation,
      siteMap,
    })
  )

  // Generate metadata 
  let helmet = exports.Helmet.renderStatic();
  let metaHTML = `
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
  `

  // Read the `index.html` produced by create-react-app's build script, then
  // inject `appHTML` into the `<div id="root"></div>` tag, and replace the
  // `<title>` tag with `metaHTML`.
  return renderCreateReactAppTemplate({
    insertIntoRootDiv: appHTML,
    replaceTitleWith: metaHTML,
  })
}
```

### 3. Disable Navi's title management

By default, Navi will set your page title as you navigate. However, if you're using react-helmet, this can get in the way. You can disable it by setting the `setDocumentTitle` option to `false` in your call to `createBrowserHistory()`:

```js
let navigation = Navi.createBrowserNavigation({
  pages,
  
  // Disable Navi's title management so that it doesn't get in the way
  // of react-helmet.
  setDocumentTitle: false,
});
```

### 4. Use the `<Helmet>`

With that done, just use the `<Helmet>` component to set your meta and head information within your documents! For example:

```markdown
import { Helmet } from "react-helmet"

<Helmet>
  <title>Home</title>
  <meta name="description" content="An example of integrating react-helmet with Navi." />
</Helmet>

# Home

This page has it's `<head>` managed using [react-helmet](https://github.com/nfl/react-helmet).
  
The contents of the helmet will be added to each of your pages' `<head>` tags at build time.
```

For more details on how to use `<Helmet>`, see [react-helmet's documentation](https://www.npmjs.com/package/react-helmet).


## Running the example

To try it, change into this directory, install the dependencies, and then start the dev server or build the production version:

```
cd basic

# Install dependencies
npm install

# Start the dev server
npm start

# Build the production version
npm run build
```