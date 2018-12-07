# Authenticated Routes

With Navi, it's possible to specify Page content or Switch paths as a *function* of the current environment. For example, you might have a switch whose content depends on URL parameter:

```js
createSwitch({
  paths: {
    '/demoboard/:slug': async env => {
      let demoboard = await fetchDemoboard(env.params.slug)

      return createPage({
        title: demoboard.title,
        content: demoboard,
      })
    }
  }
})
```

Whenever a Page or Switch specifies something as a function of the environment, that function will receive an [Env object](../../reference/declarations/#env-objects) -- which contains a configurable `context` property. By storing the current authentication state on this object, it's possible to make content that varies with authentication state.


## Setting authentation state

To set the value of `env.context`, just pass a `context` option when creating your `Navigation` object:

```js
let navigation = createBrowserNavigation({
  pages,
  context: {
    currentUser: {
      accountId: 'momo-taro-industries',
      displayName: 'Momo Taro',
      isAdmin: true,
    },
  },
})
```

You can then update `env.context` by calling `navigation.setContext()`:

```js
navigation.setContext({
  currentUser: null,
})
```

Calling `setContext` will cause your navigation state to be recomputed, ensuring that any changes will be immediately reflected in the rendered routes.


## Redirecting to a login screen

When a guest user views a path that requires authentication, you can redirect them to a login screen instead:

```js
Navi.createSwitch({
  paths: {
    '/': env =>
      !env.context.currentUser ? (
        Navi.createRedirect(
          '/login?redirectTo='+
          encodeURIComponent(env.pathname+env.search)
        )
      ) : (
        Navi.createPage({
          title: 'Launch Control',
          content:
            <LaunchControl currentUser={env.currentUser} />,
        })
      )
  }
})
```

If you have many authenticated pages, you can create a helper to wrap a page with an authentication redirect:

```js
function authenticated(page) {
  return env =>
    env.context.currentUser ? page : Navi.createRedirect(
      '/login?redirectTo='+
      encodeURIComponent(env.pathname+env.search)
    )
}

Navi.createSwitch({
  paths: {
    '/': authenticated(
      Navi.createPage({
        title: 'Launch Control',
        getContent: env =>
          <LaunchControl currentUser={env.currentUser} />,
      })
    )
  }
})
```


## Bypassing the login screen

When a user is already logged in, you can route them to their requested page without showing them a redundant login screen:

```js
Navi.createSwitch({
  paths: {
    '/login': env =>
      env.context.currentUser ? (
        Navi.createRedirect(
          decodeURIComponent(env.params.redirectTo)
        )
      ) : (
        Navi.createPage({
          title: 'Login',
          content: <Login />,
        })
      )
  }
})
```


## Authentication and Static Rendering

When deciding what to render, Navi's static renderer defaults to using an empty object for `env.context`. This means that using the above pattern, Navi will treat authenticated routes as redirects to the login screen -- saving you the hassle of figuring out what to render for screens that aren't expected to deal with logged out users.

By default, navi-scripts renders redirects as a HTML file with `<meta>`-based redirect. While this default will usually get the job done, you can configure a platform-specific redirect format by exporting `renderRedirectToString()` and/or `getRedirectPathname()` functions from your `navi.config.js`.

```js
export function renderRedirectToString({ url, siteMap, meta, to }) {
  return `<meta http-equiv="refresh" content="0; URL='${to}'" />`
}

export function getRedirectPathname({ url, siteMap, meta, to }) {
  return url === '/' ? 'index.html' : path.join(url.pathname.slice(1), 'index.html')
}
```

