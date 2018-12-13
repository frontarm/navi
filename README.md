# <a href='https://frontarm.com/navi/'><img src='/media/logo-title.png' height='100' alt='Navi Logo' aria-label='frontarm.com/navi' /></a>

[![NPM](https://img.shields.io/npm/v/navi.svg)](https://www.npmjs.com/package/navi)

Navi lets you create big, fast, CDN-delivered websites with great SEO & SMO, and all with vanilla create-react-app.

🚀 Optimize SEO with static HTML for each page<br />
🔥 Ergonomic code splitting and page loading transitions<br />
🗺️ Generate JSON site maps at runtime or build time<br />
👌 A dead-simple API<br />
🏷️ Great TypeScript support<br />
📜 Scroll management that just works<br />
♿️ Page `<title>` management for accessibility<br />
⚠️ Console warnings when a `<Link>` points to a 404<br />


The minimal example
-------------------

After spinning up a fresh app with [create-react-app](https://github.com/facebook/create-react-app), start by installing the Navi packages:

```bash
npm install --save navi react-navi
```

### 1. Declare some pages

To declare your pages, you'll use Navi's `createSwitch()` and `createPage()` functions. Switches are used to map paths to pages. Pages represent individual locations that you can navigate to.

```js
// pages/index.js
import { createPage, createSwitch } from 'navi'
import * as React from 'react'
import { NavLink } from 'react-navi'

export default createSwitch({
  paths: {
    '/': createPage({
      title: "Navi",
      content:
        <div>
          <h2>Navi</h2>
          <p>A router/loader for React</p>
          <nav><NavLink href='/reference'>API Reference</NavLink></nav>
        </div>
    }),

    '/reference': createPage({
      title: "API Reference",
      getContent: () => import('./reference.js')
    }),
  }
})
```

As you'll see later, your content can be *anything*. You can return markdown, JSON, or even arbitrary functions! But `react-navi` has special support for React elements and components, so let's start by defining the content that way.

But what about the `/reference` page? It's not returning an element or component. It's returning a *Promise* to a component -- and this is where Navi shines. When the user clicks the "API reference" link, instead of immediately rendering a blank page, Navi will wait until `reference.js` has loaded ---  and *then* it'll render the page.

```js
// pages/reference.js
import * as React from 'react'
import { Link } from 'react-navi'

export default function Reference() {
  return (
    <div>
      <h2>Reference</h2>
      <p>Coming soon.</p>
    </div>
  )
}
```

### 2. Create a `Navigation` object

Navi does all of the hard work within a `Navigation` object. This is where Navi watches for history events, matches URLs to pages and content, and turns all this info into an object that you can use.

To create a `Navigation`, just call `createBrowserNavigation()` within `index.js`, passing in the `pages` object that you defined earlier. Once you have a `Navigation`, wait for the content to be ready -- and then just render it!

```js
// index.js
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { createBrowserNavigation } from 'navi'
import pages from './pages'
import App from './App'

async function main() {
  let navigation = createBrowserNavigation({ pages })

  // Wait until async content is ready, or has failed.
  await navigation.steady()

  ReactDOM.render(
    <App navigation={navigation} />,
    document.getElementById('root')
  );
}

// Start the app
main()
```


### 3. Render the content within `<App>`

The `navigation` object that you just passed to `<App>` contains all of the information that you need to render your app. And while you *could* consume all of that information yourself, it's far simpler to just use Navi's built in components.

To start out, you'll only need two components: `<NavProvider>`, and `<NavRoute>`. You'll want to wrap `<NavProvider>` around your entire App, and then place `<NavRoute>` wherever the content should go.

```js
// App.js
import * as React from 'react'
import { NavLink, NavProvider, NavRoute } from 'react-navi'
import './App.css'

class App extends React.Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">
              <NavLink href='/'>Navi</NavLink>
            </h1>
          </header>
          <NavRoute />
        </div>
      </NavProvider>
    );
  }
}

export default App;
```

And that's it --- you've built a working app with asynchronous routes! Of course, this tiny app is just an example, but Navi handles real-world apps with ease. In fact, [Frontend Armory](https://frontarm.com) is built with Navi.

In fact, let's add a couple real-world tweaks as a bonus step, just to see how easy it can be.


### Loading indicators

As Navi doesn't render the new page until it has loaded, there can sometimes be a large delay between clicking a link seeing the result. In cases like this, it's important to keep the user in the loop. And to do so, you can wrap your route with a `<NavLoading>` component:

```js
class App extends React.Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <NavLoading>
          {isLoading =>
            <div className="App">
              {
                isLoading &&
                <div className="App-loading-bar" />
              }
              <header className="App-header">
                <h1 className="App-title">
                  <NavLink href='/'>Navi</NavLink>
                </h1>
              </header>
              <NavRoute />
            </div>
          }
        </NavLoading>
      </NavProvider>
    );
  }
}
```

The `<NavLoading>` component accepts a render function as its children, to which it passes the loading state of the content rendered by its nested `<NavRoute>` component. You can use this to show a loading bar or some other indicator.


### Handling 404s

```js
class App extends React.Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <NavLoading>
          {isLoading =>
            <div className="App">
              {
                isLoading &&
                <div className="App-loading-bar" />
              }
              <header className="App-header">
                <h1 className="App-title">
                  <NavLink href='/'>Navi</NavLink>
                </h1>
              </header>
              <NavNotFoundBoundary render={renderNotFound}>
                <NavRoute />
              </NavNotFoundBoundary>
            </div>
          }
        </NavLoading>
      </NavProvider>
    );
  }
}

function renderNotFound() {
  return (
    <div className='App-error'>
      <h1>404 - Not Found</h1>
    </div>
  )
} 
```


License
-------

Navi is MIT licensed.
