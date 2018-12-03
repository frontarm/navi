Let's make a blog!
==================

This tutorial will walk you through the process of creating a statically rendered blog with Navi and create-react-app. You'll start with a quick introduction to create-react-app, then methodically add new  features to your blog, including:

- `pushState` based routing
- An automatically generated list of posts
- Smooth transitions between pages
- Proper 404 handling
- Code splitting for each post
- MDX support

And once everything works, you'll even learn how to deploy your new site to the web!

If you'd like to take a peek at what you'll be making, the final source for this tutorial is available in [this GitHub repository]().

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

Because your `navigation` object can't match the URL to a page, it's passed you a `NotFoundError` on your `route` object. Now you *could* implement a 404 page using this information, but don't dive in and do it just yet -- there's an easier way that I'll cover later.

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

There's nothing special about the `<a>` tags in the above example; they're 100% vanilla `<a>` tags. They don't call the browser's `history.pushState()` function. They're just standard links, and when you click them, their `href` URL will be loaded from scratch. But... your app doesn't *have* a `/posts/spaceship` file. So what's going on?

One of the things about both create-react-app and Frontend Armory's Demoboard editor is that they're both rather forgiving about 404 errors. Specifically, if you request a file that they don't know about, they'll respond with the `index.html` file instead.

The good part about this is that the above app *actually works*. The less good part about it is that each time you click a link, the app will be reloaded from scratch -- throwing out the app's state along the way. To fix this, you'll want to use `history.pushState()` to update the browser's URL *without* reloading the page. And luckily, Navi provides a React component to help.


Links and Layout
----------------

Navi exports a bunch of useful React components from its `react-navi` package. But before you can use these components, you'll need to make two changes.

The first change is pretty obvious: you'll need to install `react-navi`:

```bash
npm install --save react-navi
```

The second change is a little less obvious, but is probably familiar nonetheless if you've used Redux, Apollo, or any other popular React libraries: you'll need to wrap your app with a `<NavProvider>` component.

Navi's `<NavProvider>` component accepts a single `navigation` prop, and uses React's [Context API](https://reactjs.org/docs/context.html) to provide this `navigation` object to the other components exported by `react-navi`. Because of this, it *seems* like the easiest place to put the `<NavProvider>` would be `src/index.js`, where you already have access to the `navigation` object. However, static rendering actually turns out to be a lot easier when your `<NavProvider>` is rendered from the `<App>` component. So let's put it there, instead.

```js
///App.js
import React from 'react'
import { NavProvider } from 'react-navi'

/**
 * The <App /> component receives a `navigation` object and
 * `content` element via props.
 */
export function App(props) {
  return (
    <NavProvider navigation={props.navigation}>
      {props.content}
    </NavProvider>
  )
}
///index.js
import ReactDOM from 'react-dom'
import * as Navi from 'navi'
import App from './App'
import pages from './pages'

let navigation = Navi.createBrowserHistory({ pages })
let route = navigation.getCurrentValue().route

ReactDOM.render(
  <App
    content={route.content}
    navigation={navigation}
  />,
  document.getElementById('root')
)
///pages.js
throw new Error('unimplemented')
```

You might have noticed that in the above example, I've passed `route.content` through to the `<App>` element via `props`. Remember: there's nothing special about a route's `content` property -- it just points to the matched page's `content` option. In this case, you happened to define the page's content as a React element, so you can interpolate it into your JSX as with any other React element!

Of course, the `props.content` element doesn't have to be there all by itself. You can also add other elements as children of the `<NavProvider>`, So let's add a header with a `<NavLink>` that points back to the home page.

```js
///App.js
import React from 'react'
import { NavLink, NavProvider } from 'react-navi'

export function App(props) {
  return (
    <NavProvider navigation={props.navigation}>
      <header>
        <NavLink href="/">Home</NavLink>
      </haeder>
      {props.content}
    </NavProvider>
  )
}
```

Ok, so now that you've added a `<NavLink>`, I should probably explain what it does: `<NavLink>` renders an `<a>` tag that calls `history.pushState()` when you click it. Basically, it's like an `<a>` that doesn't reload your app -- massively improving the smoothness and speed of navigation between pages, and also have the side benefit of *not throwing out your entire application's state when you click it*.

So how do you decide whether to use `<a>` or `<NavLink>`? Simple: never use `<a>`, always use `<NavLink>`. There are basically no downsides other than needing to type out a few more characters. And with this in mind, I have an exercise for you:

**Your task is to replace the `<a>` tags in your home page with `<NavLink>` tags.**

```js
///App.js
import React from 'react'
import { NavLink, NavProvider } from 'react-navi'

export function App(props) {
  return (
    <NavProvider navigation={props.navigation}>
      <header>
        <NavLink href="/">Home</NavLink>
      </haeder>
      {props.content}
    </NavProvider>
  )
}
```

As always, you can check the solution if you get stuck. And once you're done, let's figure out how to automate the creation of this list in the home page. Because seriously, ain't nobody gonna use a blog where you need to update a stinkin' list with each post.


Generating a list of posts
--------------------------

- generate a pagemap using `navigation.router.resolvePageMap`
- it returns a promise, so we'll need to wait for it to resolve. I like to create an `async function main()` and just use `await`

- fun note: see that sidebar on the left of Navi's documentation? It's automatically generated from the output of resolvePageMap!

- you can then check route.url, and render the site map if it matches '/'
- note that navi URLs always end with '/' -- if you try and navigate to something without it, it will be appended. this makes strings comparisons like this easier
- but there's gotta be an easier way
- and there is: async content


Asynchronous content
--------------------

When you create a page object with `createPage`, you have two options for declaring it's content. You've already seen the first option: you can synchronously pass in a `content` property. But what if your content isn't available immediately, or varies with the URL? In that case, instead of specifying a `content` option, you can specify a `getContent()` function.

In it's simplest form, using `getContent()` function is basically identical to using `content`; you can just synchronously return some content

```javascript
createPage({
  title: 'The greatest page in the universe',
  getContent: () =>
    <main>
      <h1>Welcome to my great blog!</h1>
    </main>
})
```

But `getContent()` differs in two ways:

- it also receives an `env` object which gives you access to the route's URL and the navigation's `router` object
- it gives you the option of returning a *Promise* to your content.

It's not just content that be specified with a getter function - you can also specify `getTitle` or `getMeta`. In fact, you can even provide a function to a switch's path mapping! I won't go into the details here, but check the API reference for details.

In the meantime, let's generate a list of posts using the router passed through on `env`, and return it as the page's content.

`getContent` receives an `env` object as its sole argument, from which you can access the same `router` that  you used to generate the site map. This lets you generate a list of posts for the index page's content!

```javascript
createPage({
  title: 'The greatest page in the universe',
  getContent: async () =>
    // TODO
})
```

There's just one problem. If you try and actually update your project with the above change, it'll cause an error to be emitted. To see exactly what happens, update the `pages.js` file in the below editor to use an async `getContent()` function, and watch what happens in the console.

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


Once you've updated the above example, you should get an error along the lines of this:

```
TODO: find error
```

If this is a little confusing at first, try adding this `console.log()` line on the line before `ReactDOM.render()`.

```js
console.log(route.content)
```

After adding this log, you'll be able to see why there's an error: *the content is undefined!* But you set `getContent()` correctly, so why should the content be undefined? The answer, of course, is that `getContent()` returns a *promise* to some content, and promises don't resolve until the next tick. In fact, the `route` object can tell you that this is the case -- just taken a look at it's `contentStatus` property:

```js
import ReactDOM from 'react-dom'
import * as Navi from 'navi'
import pages from './pages'

let navigation = Navi.createBrowserHistory({ pages })
let route = navigation.getCurrentValue()

console.log(route.contentStatus)
```

It turns out that in the real world, you'll often find that content needs to be fetched from somewhere that's at least a few milliseconds away. And because [JavaScript is single-threaded](), this means that waiting for the content to be ready would jam up the user's browser. So Navi *doesn't* wait for your content to be ready. 

Instead, Navi immediately outputs a `route` object with a `contentStatus` of `busy`, and then outputs *another* `route` once the content is ready (or has failed in some way). To get notified of this new `route` object, you'll need to make a subscription. And Navi provides two ways to do this: a hard way, and an easy way. 

First off, let's take a quick look at the hard way: `navigation.subscribe()`. If you know about observables or have used Redux, then this method may feel familiar. If not, all you need to know is that if you pass it a function, it'll call that function with a new `Route` object each time that the current route changes:

```js
import ReactDOM from 'react-dom'
import * as Navi from 'navi'
import pages from './pages'

let navigation = Navi.createBrowserHistory({ pages })

// Log the initial route with `getCurrentValue()`
console.log(navigation.getCurrentValue())

// `subscribe()` will call it's argument function with each subsequent
// route. In this case, the function logs it to the console.
navigation.subscribe(route => {
  console.log(route)
})
```

note: like a store for your navigation state

navigation objects are a bit like redux stores: both have `subscribe` methods,
and redux's `getState()` method is functionally identical to navi's `getCurrentValue()` method.

the difference is that navigation objects don't have a `dispatch` method. Instead, there are
a limited set of predefined actions that are run in response to changes in history, and
changes to context (which we'll discuss later)

end note

given that you now have access to each and every `route` object, it would be possible to
check for content, and call `ReactDOM.render()` each time that new content appears. But honestly, this is a PITA. So let's take a look at other options.

One possibility is that you could use React's `create-subscription` package to subscribe to `navigation`:

```
TODO: example with create-subscription
```

but while this works pretty well, it still has issues. for one, it still makes you manually check for content. for two, it doesn't handle transitions very well; if you navigate to a new page whose content is a promise, then your `route.content` disappears, and the best you can do is show a loading spinner until the content is loaded -- which might makes sense if the content takes seconds to load, but is just annoying if the content loads 20ms later.

Now you *could* solve all these problems yourself by caching the latest complete route, and end up with smooth and polished transitions between routes. But before you dive in, let me introduce *the easy way*.


`<NavRoute />`
--------------

- is a set of components that do the work of subscribing to a `navigation` object, and rendering the latest available content
- also provides helpers for creating `pushState` links, presenting prompts on navigation (for example, when the user has unsaved changes), and accessing the underlying `history` object (for programmatic navigation)

```bash
npm install --save react-navi
```

the best way to see how react-navi works is by example, so let's dive in! to start with, you'll need to wrap your app with a `<NavProvider>` component, similar to what you would do or Redux's `<Provider>` with apollo's `TODO`. Then, just place a `<NavRoute />` element wherever you want your content.

For example, here's how you'd render your existing routes

aside: unlike react-router's `<Router>` component, Navi's `<NavProvider>` doesn't store any routing state. Instead, navigation state is stored in a `navigation` object. `<NavProvider>` just subscribes to it and provides it to other react-navi components via [React Context](https://reactjs.org/docs/context.html)

```js

```

Note: `<NavRoute />` lets you render is the content of the current page, but sometimes you want to do more things. Sometimes you want your routes to have content that *isn't* a react element or component (which you can do by passing a render function to NavRoute), or sometimes you want nested routes (which you can render with `<NavSegment>` or `<NavContentSegment>`). I won't go into the details here, but if you need this functionality, take a look at the API reference
End note.


Page transitions
----------------

`<NavLoading />`


Handling 404s
-------------

`<NavNotFoundBoundary />`


Code splitting
--------------

For example, you can use this along with a dynamic `import()` call to split your content into a component in a separate `HomePage.js` file, and import it dynamically:

aside: import() is a new JavaScript feature that will import a module as it's called and return a promise. It's supported out of the box with demoboard and create-react-app

```javascript
///pages.js
createPage({
  title: 'The greatest page in the universe',
  getContent: () => import('./HomePage.js'),
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

- split out a file
- navigate
- it just works!
- until
- try reloading the page after navigating
- oops.
- because the content is async, there's now no content on the initial render
- wait for initial content with navigation.steady()
- aside: server side rendering with React suspense should make it possible to omit navigation.steady(), but you'll always have the option of using it
- content can come from anything that returns a promise - whether that be `import()`, `fetch()`, or some other promise-returning API. e.g. you could fetch content from firebase or AWS to build a serverless blog


MDX support
-----------


Importing the posts directory
-----------------------------

automatically import all MDX documents in a directory as posts



Build it
--------

by default, each entry of the `meta` property of your pages will be added as a `<meta>` tag
this can be customized by creating a `navi.config.js` object with a `` function


Deploy it
---------

there are a number of ways to deploy, but the easiest I've found is to use surge.sh
