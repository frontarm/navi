Let's make a blog!
==================

This tutorial will walk you through the process of creating a statically rendered blog with Navi and create-react-app. You'll start with a quick introduction to create-react-app, then methodically add new  features to your blog, including:

- `pushState` based routing
- An automatically generated list of posts
- Smooth transitions between pages
- Proper 404 handling
- Code splitting for each post
- MDX support

And once everything works, you'll even learn how to deploy this entire new site to the web:

```js{unpersisted}

```

The final source for this tutorial is also available [on GitHub](), and includes a bonus node-specific feature that improves on the above demo.

Before you start, there are a few prerequisites. You should already:

1. Be comfortable working with the command line.
2. Have [node.js](https://nodejs.org/) installed and ready to go.
3. Be familiar with React's basics. If you need a hand, start by completing the [React (without the buzzwords)](https://frontarm.com/courses/learn-raw-react/) course.
4. Have a solid understanding of JavaScript Promises and the new `async`/`await` syntax. If you need to brush up, start by completing the [Mastering Async JavaScript](https://frontarm.com/courses/async-javascript/) course.

But assuming that you're ready to go, let's dive in and set up your project skeleton!


Creating a project skeleton
---------------------------

*If you're comfortable with creating your own project skeleton with create-react app, then you can [skip through to the next section](#declaring-pages).*

The first step to creating any new React app is to set up a project skeleton. While there are a number of approaches that you can take, [create-react-app]() lets you create an entire project skeleton with a single shell command:

```bash
# create a new project using create-react-app
npm init react-app ./blog
```

There's a bit of magic going on here, so let me explain. The first two words in the above shell command -- `npm init` -- are reasonably simple. By themselves, they'll just create a new `package.json` file in the current directory. But the third word -- `react-app` -- is where the magic happens.

When NPM sees a third argument for `npm init`, it looks for a package whose name *ends* with that argument, but *begins* the characters `create-`. In the above case, the resulting package name is `create-react-app`, and so `npm` downloads it and uses it to create a project skeleton within the `./blog` directory.

The created skeleton will include a bunch of files, but I'd like to draw your attention to three files in particular:


### 1. `package.json`

The `package.json` file contains configuration for npm itself. You might know this files as the place where your `dependencies` are specified, but it has another important function: it specifies your project's `scripts`.

```json
{
  scripts: {
    start: "react-scripts start"
  }
}
```

The `start` script in particular is worth understanding. This line in `package.json` tells `npm` what to do when you run `npm start` or `npm run start` in the project directory. In this case, it runs the `react-scripts start` command, which starts a dev server and opens your browser at [localhost:3000](http://localhost:300).

To see this for yourself, try changing into the project directory and running `npm start`:

```shell
cd blog
npm start
```

This should open up your browser with a page that looks like this:

!image

Neat -- you've got a React app! But where is the site's code?


### 2. `src/index.js`

This file is your app's entry point, i.e. it contains the code that starts your app.

Given that you know React's fundamentals, *most* of this file's contents should feel familiar. You can ignore any unfamiliar parts, including the service worker stuff. All that you really need to know is that the call to `ReactDOM.render()` starts your app by rendering the `<App />` component.


### 3. `src/App.js`

This file contains the component that actually renders the stuff you see when you start the app. The best way to get a feel for this is by making a change and saving it. For example, you could change these lines:

```js
<p>
  Edit <code>src/App.js</code> and save to reload.
</p>
```

to this:

```js
<p>
  PURPLE MONKEY DISHWASHER!
</p>
```

After saving, you'll notice that the browser automatically updates -- *saving* you the trouble of *saving*... sorry.

There's one more interesting thing about `src/App.js`: *it imports a CSS file*. In fact, create-react-app lets you import `.css` files, [`.scss` files](https://sass-lang.com/guide) and [CSS modules](https://github.com/css-modules/css-modules) from *any* JavaScript file. I won't cover how this works within this tutorial, but it's worth knowing that the feature exists, as it lets you keep your CSS files in the same filesystem directory as the components that use them.

Ok, so you're now basically an expert on create-react-app. But you're here to create a blog -- so let's add some pages!
 

Declaring pages
---------------

In a Navi app, you'll use two functions to define your pages: [`Navi.createSwitch()`](./reference/defining-pages/#createswitch) and [`Navi.createPage()`](/reference/defining-pages/#createpage).

These functions are part of the `navi` package, so before you can use these functions, you'll need to add `navi` to your app. To do this, you'll use the `npm install` command:

aside: you'll need to stop the server before you can run `npm install --save navi`. you can do this by pressing *ctrl-c* within the terminal.

```bash
npm install --save navi
```

With the `navi` package installed, your next task is to `import` it somewhere and use it to declare some pages. By convention, a Navi app's pages go in the `src/pages` folder -- which you'll need to create.

```bash
mkdir src/pages
```

Once the folder exists, you'll want to add an `index.js` file to it that looks something like this:

```js
import React from 'react'
import * as Navi from 'navi'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: 'My great blog',
      meta: {
        description: 'The greatest blog in the world.',
      },
      content:
        <main>
          <h1>Welcome to my great blog!</h1>
        </main>
    }),
  }
})
```

This file should be fairly self explanatory, so if you haven't already, take a read through the above code. And once you're done, indulge me while I give you my own take on it.

The above file declares a single Page, specifying:

- A `title` string that will be used to set the document's `<title>` tag
- A meta `description` for SEO, and
- The `content` that should be rendered when the user views the page

The page is then mapped to the `/` URL of a Switch object. Now you may think that this means that the page will be displayed when the user visits your site's `/` URL, but actually... Switch objects can be mounted *anywhere*. They're a little bit like components in that regard -- you can compose switches by mapping a switch to a path within another switch.

Of course, given that the above page's title is *My great blog*, you'll probably want to mount this switch at the root of your application. So let's move onto the next section where you'll find out how.


Your `navigation` object
------------------------

Within a Navi app, the hard routing work is performed within a [`Navigation`](./reference/navigation/) instance. When you create a `Navigation`, it'll:

- Watch the browser history for changes
- Match each new URL with your declared Switches and Pages
- Fetch any necessary content, and then
- Pass all this informatino to you via a [Route object](./reference/route/#route)

To create a `Navigation` object, just pass your app's Switch to the `Navi.createBrowserHistory()` function as its `pages` option. I like to do this in `src/index.js`, just before I call `ReactDOM.render()`:

aside: when you import a directory like `./pages` with node.js, it'll look for an index.js file, and if it exists, it will import that.

```js
import * as Navi from 'navi'
import pages from './pages'

// Create a browser history object, configured with the pages you defined
// in src/pages/index.js
let navigation = Navi.createBrowserHistory({ 
  pages
})

ReactDOM.render(<App />, document.getElementById('root'))
```

Did you try this out? Great! Did you notice any changes? I hope not -- because nothing should have changed *just* yet. Because in order to actually get any benefit from that `navigation` object, you'll need to do something with it!

To start with, you can call `navigation.getCurrentValue()` to return a [NavigationSnapshot](../reference/navigation/#navigationsnapshot). This is a plain old JavaScript object that contains information about the current URL. In particular, it has a `route` property that contains the current page's `url`, `title` and `content`:

```js{unpersisted,defaultRightPanel=console}
///index.js
import * as Navi from 'navi'
import pages from './pages'

// Create a browser history object, configured with the pages you defined
// in src/pages/index.js
let navigation = Navi.createBrowserHistory({ 
  pages
})

let route = navigation.getCurrentValue().route

console.log(route.title)
console.log(route.meta)
console.log(route.content)
```

If you take a look in the above example's console, you'll see something funny about `route.content`: *it's an object*. In fact, this is what React elements look like when you log them to the console -- remember, when you declared your Page with `createPage()`, you passed in a React element as its content.

Of course, if `route.content` is just a React element, then it makes sense that you'd be able to render it with `ReactDOM.render()`! So, let's do an exercise: 

**Your task is to render the current page's content with `ReactDOM.render()`.**

Once you've given this exercise a try, you can check the solution with the button at the bottom of this editor.

```js{unpersisted}
///index.js
import ReactDOM from 'react-dom'
import * as Navi from 'navi'
import pages from './pages'

// Create a browser history object, configured with the pages you defined
// in src/pages/index.js
let navigation = Navi.createBrowserHistory({ 
  pages
})

let route = navigation.getCurrentValue().route
```

Did you give the exercise a go? Great! So now that you know how to declare switches and pages, and how to access the current `route` object, let's expand your blog with some links and posts.


Adding posts
------------

Before adding any posts, let's start by adding a *link* to the post that you haven't added yet. The simplest way to do this is by adding a plain old `<a>` tag to your page's content, like so:

```js{unpersisted}
///pages.js
import React from 'react'
import * as Navi from 'navi'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: 'My great blog',
      meta: {
        description: 'The greatest blog in the world.',
      },
      content:
        <main>
          <h1>All my great blog posts!</h1>
          <ul>
            <li><a href="/posts/welcome-to-my-blog">Welcome to my blog.</a></li>
            <li><a href="/posts/spaceship">SPACESHIP!</a></li>
          </ul>
        </main>
    })
  }
})
```

If you click one of the links in the above editor, you'll notice that the content disappears -- as you'd kinda expect. The curious thing though is that nothing else happens. There's no errors, no 404 page. Just silence. So what's going on?

To find out, let's take a look at `navigation.getCurrentValue().route` again. In particular, take a look at its `status` and `error` properties.

```js{unpersisted}
///index.js
import * as Navi from 'navi'
import pages from './pages'

// Create a browser history object, configured with the pages you defined
// in src/pages/index.js
let navigation = Navi.createBrowserHistory({ 
  pages
})

let route = navigation.getCurrentValue().route

console.log(route.content)
console.log(route.status)
console.log(route.error)
```

Because your `navigation` object can't match the URL to a page, it's passed you a `NotFoundError` on your `route` object. Now you *could* implement a 404 page using this information, but don't dive in and do it just yet -- there's an easier way that we'll cover in [Usage with React](#usage-with-react).

For the moment, let's just fix the error by actually declaring the missing pages. In fact, let's do this an exercise!

**Your task is to add a new `/posts` switch with the missing pages.**

If you get stuck, just click the *Solution* button at the bottom of the editor to see how I've gone about it.

```js
///pages.js
import React from 'react'
import * as Navi from 'navi'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: 'My great blog',
      meta: {
        description: 'The greatest blog in the world.',
      },
      content:
        <main>
          <h1>All my great blog posts!</h1>
          <ul>
            <li><a href="/posts/welcome-to-my-blog">Welcome to my blog.</a></li>
            <li><a href="/posts/spaceship">SPACESHIP!</a></li>
          </ul>
        </main>
    }),
  }
})
///solution:pages.js
import React from 'react'
import * as Navi from 'navi'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: 'My great blog',
      meta: {
        description: 'The greatest blog in the world.',
      },
      content:
        <main>
          <h1>All my great blog posts!</h1>
          <ul>
            <li><a href="/posts/welcome-to-my-blog">Welcome to my blog.</a></li>
            <li><a href="/posts/spaceship">SPACESHIP!</a></li>
          </ul>
        </main>
    }),

    '/posts': Navi.createSwitch({
      paths: {
        '/welcome-to-my-blog': Navi.createPage({
          title: 'Welcome to my blog',
          content: <div>Isn't it wonderful!</div>,
        }),

        '/spaceship': Navi.createPage({
          title: 'SPACESHIP!',
          content: <div>🚀</div>,
        }),
      }
    })
  }
})
```

Once you've added these new pages, you should find that clicking the links will cause you to navigate to the new content. If you're not seeing this result, make sure to take a look at my solution! But once you have it working, then congratulations! You've built a blog!

There's just one weird thing about this blog... it really shouldn't even work.


### Black Magic Tooling

- Aside: Speaking of black magic...

Since you've already creating two pages with `createPage()`, you can probably see that this isn't going to work for a real blog. It takes too much effort. Instead, you'll want to be able to just drop a file in a directory and start typing.

Luckily, this is possible with a little black magic -- I'll show you how towards the end of the article

- end aside.

There's nothing special about the `<a>` tags in the above example; they're 100% vanilla `<a>` tags. They don't call the browser's `history.pushState()` function. They're just standard links, and when you click them, the URL that they point to will be loaded from scratch. But... your app doesn't *have* a `/posts/spaceship` file. So what's going on?

One of the things about both create-react-app and Frontend Armory's Demoboard editor is that they're both rather forgiving about 404 errors. Specifically, if you request a file that they don't know about, they'll respond with the `index.html` file instead.

The good part about this is that the above app actually works. The *less good* part about it is that each time you click a link, the app will be reloaded from scratch -- throwing out the app's state along the way. To fix this, you'll want to use `history.pushState()` to update the browser's URL *without* reloading the page. And we'll get to this in a moment. But before we do, there's a more pressing problem to solve: *ain't nobody gonna use a blog where you need to update a stinkin' list with each post.*


Generating a list of posts
--------------------------

In order to convert URLs to `Route` objects, your `navigation` instance uses a `Router` object. And while you normally don't need to interact with the router directly, it can come in handy when you need routing information for a URL *other* than the current URL.

The `navigation.router` object has two important methods. The simplest of these is `resolve()`, which takes a URL and returns a promise to a `Route`.

```js
///index.js
import * as Navi from 'navi'
import pages from './pages'

let navigation = Navi.createBrowserHistory({ pages })

// The `router.resolve()` function lets you find routing information
// for a specific URL, even when the user isn't currently viewing it.
let routePromise = navigation.router.resolve('/posts/spaceship')

console.log(routePromise)
```

Nice and easy, right? But a single `route` isn't going the help you generate a list of posts. For that, you'll need *every* URL under `/posts`, along with *every* resolved `Route`. And you can get these by calling `router.resolveSiteMap()`.

```js
///index.js
import * as Navi from 'navi'
import pages from './pages'

let navigation = Navi.createBrowserHistory({ pages })

// The `router.resolveSiteMap()` function builds an object that maps
// each URL under the specified path to the `Route` object that it
// would resolve to.
let siteMapPromise = navigation.router.resolveSiteMap('/posts')

console.log(siteMapPromise)
```

If you take a look at the `siteMapPromise` in the above editor's console, you'll notice something interesting. While the object *does* contain your two posts' URLs and `Route` objects, if you take a second look at the `Route` objects, you'll notice that their `content` property is undefined. This is because `resolveSiteMap()` omits the content by default, allowing you to build index pages without eagerly fetching the content for each page. Don't worry though -- if you do need the content, then you can just pass `{ withContent: true }` as a second argument.

```js
///index.js
import * as Navi from 'navi'
import pages from './pages'

let navigation = Navi.createBrowserHistory({ pages })

// Passing `withContent: true` ensures that content will be fetched along
// with titles and meta.
let siteMapPromise = navigation.router.resolveSiteMap('/posts', {
  withContent: true
})

console.log(siteMapPromise)
```

Once you have a site map, building your index is just a matter of slicing and dicing its `pages` object into a React element, and then rendering it somewhere. How you do this is really a matter of taste. You could use a `siteMap` to build anything from a wordpress style index to a sidebar like the one on the left (yep, that sidebar is generated from a `siteMap`!)

Here's one (rather ugly) take on how you could create and render the list:

```jsx
///index.js
import * as Navi from 'navi'
import pages from './pages'
import BlogIndex from './BlogIndex'

// Wrap everything in an `async` function so that we can use `await`,
// as top-level await is still not supported by JavaScript.
async function main() {
  let navigation = Navi.createBrowserHistory({ pages })
  let route = navigation.getCurrentValue().route
  let siteMap = await navigation.router.resolveSiteMap('/posts', {
    withContent: true
  })

  ReactDOM.render(
    route.url.path === '/'
      ? <BlogIndex siteMap={siteMap} />
      : route.content,
    document.getElementById('root')
  )
}

// Start the app.
main()
///BlogIndex.js

export default function BlogIndex(props) {
  return (
    <div>
      <h1>My Blog</h1>
    </div>
  )
}
```

There's a couple things that I'd like to draw your attention to in the above example.

First, did you notice how I wrapped everything in an async function? This makes it possible to `await` the result of `resolveSiteMap()` before rendering the app, ensuring that you don't need to deal with incomplete data within your React components, and thus making static HTML generation *much* easier. I'll go into more detail on this a little later.

Next, take a look at how this example conditionally renders the site index when `route.url.pathname` is `/`. Honestly, this is *pretty darn ugly*. It'd be so much nicer if you could just assign `<BlogIndex>` to your index page's `content` property. The thing is, there's a circular dependency getting in the way.

To create a site map, you need a `Navigation` object. And to create a `Navigation` object, you need to have already declared your `pages`. So how can you access a site map from `createPage()`? It's just not possible, unless...


Asynchronous content
--------------------

With Navi, you have two options for declaring a page's content. You've already seen the first: you can pass `createPage()` a constant `content` property.

```jsx
createPage({
  title: 'Can he swing, from a web?',
  content: <h1>No he can't, he's a pig.</h1>
})
```

But what if you don't want to fetch your content until it is actually needed? Or what if your content depends on information like the page's URL or a site map? In that case, you can specify a `getContent()` function!

aside: 

You can also specify `getTitle` and `getMeta` functions. In fact, you can even provide a getter function to a switch's `paths` object, allowing you to compute entire Page or Switch objects on the fly! For more details, see [Declaring pages](../reference/defining-pages/) in the API reference.

end aside:

```jsx
createPage({
  title: 'The greatest page in the universe',
  getContent: () =>
    <main>
      <h1>Welcome to my great blog!</h1>
    </main>
})
```

A page's `getContent()` function does precisely what you'd expect it to -- it just returns the page's content. But unlike `content` constants, `getContent()` functions have access to an `env` object that provides the page's full `pathname`, URL `params`, and other useful information.

```jsx
createPage({
  title: 'Demoboard',
  getContent: env =>
    <Demoboard source={env.params.source} />
})
```

I won't cover all of the `env` object's properties in this tutorial -- you can read up on the details in the [Declaring pages](../reference/defining-pages/) section of the API reference. However, there are two properties in particular that I'd like to point out:

1. `env.pathname` contains the full path at which the page is mounted, which can be used to compute paths that are relative to the current page.

2. `env.router` contains your app's `router` instance -- the same `router` that you used in the previous lesson to create a site map.

Given that `getContent()` has access to your app's `router`, and the router's method both return promises, you may surmise that `getContent()` can *also* return a Promise. And you'd be right!

```jsx
createPage({
  title: 'The greatest page in the universe',

  // getContent() can also return a promise to its content,
  // which means that getContent() can be an async function.
  getContent: async env => {
    let siteMap = await env.router.resolveSiteMap('/posts', {
      withContent: true
      })
    return createIndexElementFromPosts(siteMap.posts)
  }
})
```

There's just one problem. If you actually add the above `getContent()` function to your project, *then the index page will go blank!* What's going on?!

If this is a little confusing at first, try updating the `pages.js` file in the below editor with an async `getContent()`, and then inspecting the `route` object that's being rendered. Like actually, go check `route` with a `console.log()`. I'll still be here when you're done!

```javascript
///index.js
import ReactDOM from 'react-dom'
import * as Navi from 'navi'
import pages from './pages'

// Create a browser history object, configured with the pages you defined
// in src/pages/index.js
let navigation = Navi.createBrowserHistory({ 
  pages
})

let route = navigation.getCurrentValue()

ReactDOM.render(
  // In this example, the content is a function component, so the
  // content needs to be turned into an element.
  React.createElement(route.content),
  document.getElementById('root')
)
///pages.js
import React from 'react'
import * as Navi from 'navi'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: 'My great blog',
      meta: {
        description: 'The greatest blog in the world.',
      },
      content: () =>
        <main>
          <h1>Welcome to my great blog!</h1>
        </main>
    }),
  }
})

///HomePage.js
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to my great blog!</h1>
    </main>
  )
}
```

Did you take a look inside `route`? Then you'll be able to see why nothing is being displayed: *the content is `undefined`!* But you set `getContent()` correctly, so why should the content be `undefined`? The answer, of course, is that `getContent()` returns a *promise* to some content, and promises don't immediately resolve. In fact, the `route` object even tells you that the content isn't available yet -- just take a look at its `status` property:

```js
import ReactDOM from 'react-dom'
import * as Navi from 'navi'
import pages from './pages'

let navigation = Navi.createBrowserHistory({ pages })
let route = navigation.getCurrentValue().route

console.log(route.status)
```

Because [JavaScript is single-threaded](https://frontarm.com/courses/async-javascript/promises/why-async/), Navi can't just wait for your content promise to be fulfilled. Instead, it sets `route.status` to `'busy'`, and then creates *another* `route` object once the content is ready (or has failed in some way). And to receive notification of the next route, you'll need to make a subscription.


### Waiting for asynchronous content

Navi gives you two ways to respond to changes in routing state: a hard way, and an easy way.

To start, let's take a look at the hard way: `navigation.subscribe()`. Despite being the hard way, this method is super simple: you just pass it a function that will be called whenever a new `Route` is available.

```js
import ReactDOM from 'react-dom'
import * as Navi from 'navi'
import pages from './pages'

let navigation = Navi.createBrowserHistory({ pages })

// Log the initial route with `getCurrentValue()`
console.log('initial state', navigation.getCurrentValue())

// `subscribe()` will call its supplied callback
// whenever the app's routing state changes.
navigation.subscribe(navigationSnapshot => {
  console.log('next state', navigationSnapshot)
})
```

If you take a look in the console, you'll see that the `route` passed to your `subscribe()` callback contains the page's `content`! Hooray! We can render it with `ReactDOM.render()`! But let's not, because there's a far easier solution: you can just `await navigation.steady()` instead.

```js
import ReactDOM from 'react-dom'
import * as Navi from 'navi'
import pages from './pages'

async function main() { 
  let navigation = Navi.createBrowserHistory({ pages })

  // Wait until the initial page's content has loaded, or
  // has failed with an error.
  await navigation.steady()

  // After `navigation.steady()` has resolved, `getCurrentValue()`
  // will return a route that contains the complete page content.
  let route = navigation.getCurrentValue().route

  ReactDOM.render(
    route.content,
    document.getElementById('root')
  )
}

main()
```

The `navigation.steady()` function returns a Promise that resolves after the current route's content has loaded (or failed to load). If you wait until that promise has resolved, then `getCurrentValue()` will hold the page's full content. You can then render this content as-is with a simple `ReactDOM.render()` -- even if the page's `getContent()` function returned a promise!

The `navigation.steady()` function is the secret sauce that makes server-side rendering with Navi so easy. As long as your content is declared with `createPage()`, it will always be available in the initial render, making `ReactDOMServer.renderToString()` *far* more useful.

There's just one problem. `navigation.steady()` is great for waiting for the *initial* content -- but what if the URL changes? What if you want to use `history.pushState()`? In that case, your app will still need to use `navigation.subscribe()`. But luckily, you won't need to implement this yourself, because `<NavProvider>` does it for you!


Usage with React
----------------

While Navi's API gives you enough power to integrate with any JavaScript framework, it just so happens that you're currently building a *React* app. And given that you're building a React app, you can avoid reinventing a number of wheels by using the components exported by `react-navi`. However, before you can use these components, you'll need to make a couple changes.

The first change is pretty obvious: you'll need to install `react-navi`:

```bash
npm install --save react-navi
```

The second change is a little less obvious, but if you've used Redux, Apollo, or any other popular React libraries then it will be familiar nonetheless: you'll need to wrap your app with a `<NavProvider>` component.


### `<NavProvider>`

Your app's `<NavProvider>` component is responsible for subscribing to the latest navigation state, and passing that state to Navi's *other* components (which you'll learn about in a moment). But `<NavProvider>` won't know what to subscribe to unless you *tell* it -- so you'll need to pass it a `navigation` prop.

```jsx
<NavProvider navigation={navigation}>
  ...
</NavProvider>
```

Where should you put your `<NavProvider>`? To answer this, you'll need to be aware that by default, Navi will pass a `navigation` object to your `<App>` component during static rendering. Because of this, you can save yourself some work later on by rendering your `<NavProvider>` within the `<App>` component.


### `<NavRoute>`

A lone `<NavProvider>` within `<App>` won't accomplish much -- you'll also need a way to render the content! Navi gives you a few ways to do this, but the easiest is to use the `<NavRoute>` component. This component accepts a *function* as a child, and then decides what to render by calling that function with each new `route` object.

```jsx{unpersisted}
///App.js
import React from 'react'
import { NavProvider } from 'react-navi'

export function App(props) {
  return (
    <NavProvider navigation={props.navigation}>
      <NavRoute>
        {route => route.content}
      </NavRoute>
    </NavProvider>
  )
}
```

By using a function to map your `route` to a React element, `<NavRoute>` gives you the flexibility to handle *any* type of content. But given that your `content` will often just be React elements or React components, this kind of power can feel a little overkill. That's why `<NavRoute>` lets you omit the `children` function if you'd like to render the content as is.

```js
///App.js
import React from 'react'
import { NavProvider } from 'react-navi'

export function App(props) {
  return (
    <NavProvider navigation={props.navigation}>
      <NavRoute />
    </NavProvider>
  )
}
///index.js
import ReactDOM from 'react-dom'
import * as Navi from 'navi'
import App from './App'
import pages from './pages'

let navigation = Navi.createBrowserHistory({ pages })

async function main() {
  await navigation.steady()

  ReactDOM.render(
    <App navigation={navigation} />,
    document.getElementById('root')
  )
}
///pages.js
throw new Error('unimplemented')
```

Caution: Steady State

Until React releases server-side rendering support for Suspense, you'll still need to wait for `navigation.steady()` to resolve before rendering the initial content -- otherwise `<NavRoute>` will initially have no content to render!

End Caution.


### Layout

Because `<NavProvider>` and `<NavRoute>` are just plain old React elements, you can mix them with other elements to create a site layout. The only rule is that `<NavRoute>` has to be inside `<NavProvider>` -- but it doesn't have to be a *direct* child!

For example, you could add a layout with `<header>`, `<main>` and `<footer>` elements, and a `<NavLink>` back to the home page (which we'll cover next):

```js
///App.js
import React from 'react'
import { NavLink, NavProvider } from 'react-navi'

export function App(props) {
  return (
    <NavProvider navigation={props.navigation}>
      <header>
        <NavLink href="/" activeStyle={{ color: 'red' }}>
          Home
        </NavLink>
      </header>
      <main>
        <NavRoute />
      </main>
      <footer>
        Get in touch via Twitter at @james_k_nelson
      </footer>
    </NavProvider>
  )
}
```

### `<NavLink>`

The `<NavLink>` component is like an `<a>` that doesn't reload your app -- massively improving the smoothness of navigation, and also have the benefit of *not throwing out your entire application's state when you click it*.

Internally, `<NavLink>` still renders an `<a>` element, ensuring that links in statically rendered content will work even before your page's JavaScript has loaded. The major difference from `<a>` is that once your app *has* loaded, `<NavLink>` prevents the browser's default `<a>` behavior, and instead calls `history.pushState()` to navigate.

So how do you decide whether to use `<a>` or `<NavLink>`? Simple: never use `<a>`, always use `<NavLink>`. There are basically no downsides other than needing to type out a few more characters. And with this in mind, I have an exercise for you:

**Your task is to replace the `<a>` elements on the index page with `<NavLink>` elements.**

```js
///App.js
import React from 'react'
import { NavLink, NavProvider } from 'react-navi'

export function App(props) {
  return (
    <NavProvider navigation={props.navigation}>
      <header>
        <NavLink href="/" activeStyle={{ color: 'red' }}>
          Home
        </NavLink>
      </header>
      <main>
        <NavRoute />
      </main>
      <footer>
        Get in touch via Twitter at @james_k_nelson
      </footer>
    </NavProvider>
  )
}
```

With all the `<a>` tags replaced with `<NavLink>` elements, you should be able to smoothly navigate between pages! 

The `<NavLink>` component provides many other benefits over plain `<a>` tags. You can see a full list of features in the [Documentation](), but there's one in particular I'd like to point out: `<NavLink>` logs a warning when you point it to a page that doesn't exist! You can see this in action in the following example, where I've added a `<NavLink>` to `/about` *without* actually adding an about page.

```jsx
///App.js
import React from 'react'
import { NavLink, NavProvider } from 'react-navi'

export function App(props) {
  return (
    <NavProvider navigation={props.navigation}>
      <header>
        <NavLink href="/" activeStyle={{ color: 'red' }}>
          Home
        </NavLink>
        <NavLink href="/about" activeStyle={{ color: 'red' }}>
          About
        </NavLink>
      </header>
      <main>
        <NavRoute />
      </main>
      <footer>
        Get in touch via Twitter at @james_k_nelson
      </footer>
    </NavProvider>
  )
}
```

Here's a question for you: what happens when you actually *click* that link broken link? Go ahead and click it to find out...


### `<NavNotFoundBoundary />`

When you navigate to a URL that Navi doesn't know about, it'll set the route's `error` property to a `NotFoundError`. And when `<NavRoute>` encounters something in `route.error`, it'll `throw` it -- as you'll have seen when you clicked the "About" link in the previous example.

Now you *could* handle this error by using React's `componentDidCatch()` lifecycle method to show some sort of error screen. But given that most apps will want to handle Not Found errors in roughly the same way, Navi provides a `<NavNotFoundBoundary>` component that does this for you.

To use `<NavNotFoundBoundary>`, simply wrap it around the part of your content that should be hidden when displaying a 404 error, and then a function to the `render` prop that renders the 404 message. 

```js
///App.js
import React from 'react'
import { NavLink, NavProvider } from 'react-navi'

export function App(props) {
  return (
    <NavProvider navigation={props.navigation}>
      <header>
        <NavLink href="/" activeStyle={{ color: 'red' }}>
          Home
        </NavLink>
        <NavLink href="/about" activeStyle={{ color: 'red' }}>
          About
        </NavLink>
      </header>
      <main>
        <NavNotFoundBoundary render={renderNotFound}>
          <NavRoute />
        </NavNotFoundBoundary>
      </main>
      <footer>
        Get in touch via Twitter at @james_k_nelson
      </footer>
    </NavProvider>
  )
}

function renderNotFound() {
  return (
    <h1>404 I Think That Page Got Left In A Taxi Somewhere</h1>
  )
}
```

And with that, you've built a working `pushState` based blog! But nobody likes writing blog posts in HTML, so let's add Markdown support with MDX.


MDX support
-----------

If you've ever tried to write documents with HTML, then you know how painful typing out `</p>` for the 42nd time is. And while you can always just grit your teeth and type on, one way to save a bunch of frustration is to write in a text-based format like Markdown.

The easiest way to use Markdown with create-react-app is to use a tool called [mdx-loader](), which lets you `import` Markdown files as if they were JavaScript files that exported a React component.

Aside: mdx-loader?

create-react-app is based around a tool called Webpack, and in the Webpack world, *loaders* are libraries that convert one file format to another.

End Aside.

There's just a few steps to setting up `mdx-loader` with create-react-app. First off, you'll need to install it:

```bash
npm install --save mdx-loader
```

Next, in order to have create-react-app compile the JSX produced by `mdx-loader`, you'll need to add this `.babelrc` file in your project's root directory:

```json
{
  "presets": ["babel-preset-react-app"]
}
```

And with those two steps complete, all that is left is to create a Markdown file and `import` it! But there's two tricks to doing so:

1. To tell the create-react-app that you're importing a Markdown file, you'll need to prefix the filename with `!babel-loader!mdx-loader!`.
2. To avoid a linter warning, you should use a dynamic `import()` expression instead of a top level `import`.

For example, say you were to create a `src/pages/spaceship.md` file with the following Markdown:

```markdown
SPACESHIP 🚀
===========

Spaceship! Spaceship, spaceship, spaceship, spaceship, spaceship!
```

Passing this Markdown file through the MDX tool will result in a JavaScript file that exports a single React component as its default export, looking something like this:

```js
import React from "react"

export default function(props) {
  return (
    <div>
      <h1 id="spaceship-">SPACESHIP 🚀</h1>
      <p>Spaceship! Spaceship, spaceship, spaceship, spaceship, spaceship!</p>
    </div>
  )
}
```

aside: import() is a new JavaScript feature that will load a module, and return a promise to it. It's supported out of the box with demoboard and create-react-app.

In order to use this function as the content for your `/posts/spaceship` page, you'd just `import()` it and return it from the page's `getContent()` function. In fact, when `getContent()` returns a promise to an object with a `default` property, Navi is clever enough to use the `default` property's value automatically. All you need to do is return an `import()` expression from `getContent()`.

```js
createPage({
  title: 'SPACESHIP',
  getContent: () => import('!babel-loader!mdx-loader!./spaceship.md'),
})
```

One thing to keep in mind is that the `!babel-loader!mdx-loader!` syntax will *not* work in most JavaScript environments. It will only work with [Webpack]-based tools like create-react-app. For example, Frontend Armory's Demoboard editor doesn't support the `!babel-loader!mdx-loader!` syntax -- but it *does* support `.mdx` files *without* the syntax:

```js{unpersisted}
demoboard MDX example
```

*For a full example that uses create-react-app, MDX, and the `!babel-loader!mdx-loader!` syntax, take a look at this guide's [GitHub repository]().*


Loading transitions
-------------------

When `getContent()` needs to fetch content over a network connection, it can often take enough time that the user starts to notice. In particular, users on mobile connections may have to wait multiple seconds before the content for their requested page becomes available. So how does Navi handle the transition between pages?

The easiest way to get a feel for this is to see for yourself! And to help you do so, I've put together an example with 2 second delays before each page's content is loaded. Try navigating between pages and see what happens!

```js

```

If you gave this a try, then you'll have seen how `<NavRoute>` handles transitions by default: it shows the most recent *available* content, even while the next content is being loaded. This is a lot like React Suspense, and for good reason -- once React Suspense supports server side rendering, it should be easy to bring your Navi-based routing into the future.

While the default behavior provides a distraction-free experience to users on fast connections, it doesn't suit everyone. In particular, even tiny fetches can cause users on mobile devices to face delays measured in seconds. In this case, you'll probably want to keep the user in the loop with a loading spinner. And while Navi won't do this for you, it does provide a tool to help

Navi's `<NavLoading>` component exposes a boolean with the loading state of if its nested `<NavRoute>`. To access this information, you'll need to pass `<NavLoading>` a function that accepts the boolean and returns the content to render:

```js
<NavLoading>
  {isNestedRouteLoading =>
    <NavRoute />
  }
</NavLoading>
```

You can then use `isNestedRouteLoading` however you'd like within the rendered children. For example, you could use it to show a loading bar that is displayed only after the content has been loading for at least 333ms.

```js
///App.js
import BusyIndicator from 'react-busy-indicator'

<NavLoading>
  {isNestedRouteLoading =>
    <>
      <BusyIndicator isBusy={isNestedRouteLoading} color="#ff0000" delayMs={333} />
      <NavRoute />
    </>
  }
</NavLoading>
```

And just like that, your app has a smooth, animated transition between pages! Of course, you can always add more complicated transitions with [react-transition-group](https://www.npmjs.com/package/react-transition-group) and a render function for `<NavRoute />`. But if you're on a time budget, the above example will still give your readers a better experience than 99% of the internet.

Of course, given that you're building a blog, it's not just your readers' experience that counts -- your experience as a writer is just as important! So as a final step before building and deploying your blog, let's make adding a new post as easy as possible.


Importing all posts
-------------------

Before jumping into this lesson, there's something you should know:

Caution: Webpack Alert

This lesson relies on sparsely-document features of Webpack -- which is used internally by create-react-app. While it's sometimes possible to use Webpack features from within create-react-app, it's *not* supported by the create-react-app team.

End Caution.

As you've probably heard, create-react-app is built around a popular tool called Webpack. And while create-react-app tries to hide Webpack from the developer where possible, it doesn't do a perfect job, and it's sometimes still possible to use magical Webpack-specific features.

One Webpack feature that is available to create-react-app users is [require.context()](https://webpack.js.org/guides/dependency-management/#require-context). This function allows you to import a whole directory full of files -- and even lets you *exclude* files that don't match a pattern that you specify. For example, here's how you'd lazily import all Markdown files in your `/posts` directory:

```js
// Creates a Webpack Context that includes all files ending with
// `.md` and `.mdx` in '.', i.e. this directory.
//
// The `true` passed in as the second argument tells webpack
// to also include files in subdirectories of '.'.
// 
// The `lazy` keyword indicates that the modules shouldn't be
// fetched until they're actually needed.
const webpackContext = require.context('.', true, /\.mdx?$/, 'lazy')
```

The tricky thing about `require.context()` is that the returned `webpackContext` isn't an array of modules. Instead, it's a function that takes a path and returns the associated module -- just like CommonJS `require()`. Of course, the whole point of `require.context()` is that you don't want to manually require each file. So luckily, you can get an array of available paths, relative to the directory that `require.context()` is searching in, by calling `webpackContext.keys()`.

```js
// ['spaceship.md', 'my-great-blog.md']
let pathnames = webpackContext.keys()
```

- create a switch
- you can get more fancy with the logic you use to create your switch. for example, see create-react-blog. it:
  * extracts a date from the file's pathname
  * keeps metadata in a separate file, so that less information needs to be loaded when building an index page
  * has pagination and tags


Build it
--------

This builds your app without individually rendererd pages

```bash
npx react-scripts build
```

This is what usually happens when you call `npm run build`. This is configured in `package.json`. But it still only produces a single HTML file. while you want to produce one for each page. The `navi-scripts` package lets you do this.

The way that Navi builds your app is that it loads your already built JavaScript, reads its `pages` switch, and uses it to create a site map of all of the site's URLs. Then, it creates a `navigation` object for each of those pages, passing it to `<App>` and rendering that `<App>` element to a string using `renderToString`.

But before building your app with Navi, you'll need to need to make a small change to `src/index.js`. Because Navi's static renderer needs to be able to access your `pages` and `App` objects, you'll need to export them from `src/index.js`. But create-react-app doesn't give you a way to export these from your App, so Navi has its own way of doing this: the `Navi.app()` function. To use it, you'll just need to pass it your `pages`, `App` and `main` function within `src/index.js`

```js
Navi.app({
  pages,
  exports: App,
  main: async function main() {
    // ...
  }
})
```

A couple things:

- The `Navi.app()` function takes care of calling your main function when appropriate, so you no longer need to call `main()` yourself.

- `App` is passed out via exports, as it's the only thing that navi's create-react-app renderer needs. However, if you want to create a custom renderer, you can pass out other things via `exports`.

With this change made, all you need to do is call `navi-scripts build`:

```bash
npx react-scripts && npx navi-scripts build
```

And presto -- you'll have one HTML file for each page in your `build` directory!

You can make this process even easier by adding the script to your `package.json`:

```javascript
'build': 'react-scripts build && navi-scripts build'
```

Then to build your app, all you need to type is `npm run build`.

Of course, you'll want a way to test your newly built app, and for that you can just use the `serve` command of navi-scripts:

```bash
npx navi-scripts serve
```

This will start a server at localhost:3000, which you can open up to test out your statically built site. And if you do open it up and view source, you'll see that it has `<title>` and `<meta>` tags in the head corresponding to your page's `title` and `meta` props. It alsoy has the page content.

```javascript
'serve': 'navi-scripts serve'
```

after adding adding this to your `package.json `


by default, each entry of the `meta` property of your pages will be added as a `<meta>` tag
this can be customized by creating a `navi.config.js` object with a `` function


Deploy it
---------

There are a number of ways to deploy, but the easiest I've found is to use [surge.sh](https://surge.sh/). To deploy with surge, just run this:

```bash
npx surge
```
