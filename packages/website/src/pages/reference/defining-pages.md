Declaring Pages
===============

Navi provides four **declaration functions**, which you'll use to map URLs to pages and their content:

- [createSwitch()](#createswitch)
- [createPage()](#createpage)
- [createRedirect()](#createredirect)
- [createContext()](#createcontext)

Each of these declaration functions returns a **Declaration object**, which you can pass to a Switch's `paths` option to build your routing tree.


`createSwitch()`
---------------

```js
createSwitch(options: {
  paths: {
    [name: string]: Declaration | (env => Declaration)
  },

  // Optionally one of:
  title?: string,
  getTitle?: (env) => string | Promise<string>,

  // Optionally one of:
  content?: any,
  getContent?: (env) => any | Promise<any>,

  // Optionally one of:
  meta?: object,
  getMeta?: (env) => object | Promise<object>,
})
```

A switch's `paths` object is how you map URLs to pages and redirects. Switch paths can also be specified as [getter functions](#constants-vs-getters), allowing a path's children to vary with the switch's context.

The `content`, `meta` or `title` options are entirely optional; Navi itself doesn't actually make use of them. However, if you *do* provide them, then their values will be available in `Route` objects that match this switch. The only exception is that `content` will not be made available for the `Route` objects in a site map.

### The `paths` option

A switch's `paths` object is how you declare the app's routing tree. It maps URL patterns to the Pages, Switches and Redirects that should handle them.

```js
{
  // When the user accesses the `./create-switch` path relative to the
  // URL at which the switch is mounted, they'll see this page.
  '/create-switch': Navi.createPage({
    title: 'The createSwitch() function`,
    getContent: () => import('./createSwitch.mdx'),
  }),

  // When the user accesses the `./create-junction` path relative to the
  // URL at which the switch is mounted, they'll be redirected to the
  // create-switch page.
  '/create-junction': Navi.createRedirect(
    env => path.join(env.pathname, 'create-switch')
  ),
}
```

While the `paths` object's keys should generally be specific path segments, it's also possible to specify wildcard segments by starting the segment with the `:` character. The values of these wildcard segments will be made available via your `Route` or `Env` objects' `params` property. 

```js
{
  '/demoboard/:slug': async env => {
    let demoboard = await fetchDemoboard(env.params.slug)

    return createPage({
      title: demoboard.title,
      content: demoboard,
    })
  }
}
```

The `/` path is special; if you map it to a `Page` or `Redirect` declaration, then it will be used when the user accesses the URL at which the switch itself is mounted.

### Examples

A basic switch with two paths:

```js
Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: 'Home',
      content: <div>Home</div>,
    }),

    '/about': Navi.createPage({
      title: 'About',
      content: <div>About</div>,
    })
  }
})
```

A switch that redirects it's `/members` path to a `/login` page when the user is unauthenticated:

```js
Navi.createSwitch({
  paths: {
    '/members': env =>
      !env.context.currentUser ? (
        Navi.createRedirect(
          '/login?redirectTo='+encodeURIComponent(env.pathname+env.search)
        )
      ) : (
        Navi.createPage({
          title: 'My Page',
          content: <div>My Page Content</div>,
        })
      )
  }
})
```


`createPage()`
--------------

```typescript
createPage(options: {
  // One of:
  title?: string,
  getTitle?: (env) => string | Promise<string>,

  // One of:
  content?: any,
  getContent?: (env) => any | Promise<any>,

  // Optionally one of:
  meta?: object,
  getMeta?: (env) => object | Promise<object>,
})
```

Creates a `Page` object, which can be passed to the `createSwitch()` function's `paths` option to specify a URL's title, content, and metadata.

The page's `title`, `meta` and `content` can be specified as a constant value, or as a [getter function](#constants-vs-getters). 

The current page's **title** option, if provided, will be used by Navi as the document's `<title>`.

### Example

```js
createPage({
  title: 'Frontend Armory',
  meta: {
    description: "Advanced React for Experienced Developers.",
  },
  getContent: () => import('./landing.mdx'),
})
```


`createRedirect()`
------------------

```typescript
createRedirect(
  to:
    | string
    | Partial<URLDescriptor>
    | (env =>
        | string
        | Partial<URLDescriptor>
        | Promise<string | Partial<URLDescriptor>
      )
)
```

Redirects can be mapped to one of switch's paths to declare that any visits to that path will automatically navigate to a `to` path.

For the `to` path, you can specify either an absolute path, a [partial URL descriptor](./routes-and-segments#url-descriptors), or a getter function that returns either of these.

### Examples

Redirect to `/browse`, relative to the application root:

```js
createRedirect('/browse')
```

Redirect to `./browse`, relative to the path at which the redirect is mounted:

```js
createRedirect(env => url.pathname + '/browse')
```

Redirect to `/login?redirectTo=...`, appending the current URL as parameter, so that the login screen can redirect back to it when complete:

```js
createRedirect(env => '/login?redirectTo='+encodeURIComponent(env.pathname+env.search)
```


`createContext()`
-----------------

```typescript
createContext(
  getChildContext: (env) => any | Promise<any>,
  childDeclaration: Declaration | ((env) => Declaration)
)
```

The `createContext()` declaration will set the value of `env.context` within the `childDeclaration` argument, and any of it's ancestors. It won't make any effort to merge in the parent context, but since the parent context is available in the `env.context` object provided to `getChildContext`, you can merge it in yourself.

This declaration can be used to fetch data that is common to a number of ancestors once, instead of fetching it within each ancestor's getters.

### Examples

Frontend Armory's courses are composed of a course Switch with a number of nested another of Page declarations. Context is used to provide the course details to each of it's pages.

```js
import course from './courseDetails'

let context = createContext(
  (env) => ({
    course,
    coursePathname: env.pathname,

    // Merge in the parent context
    ...env.context
  }),
  createSwitch({
    paths: course.paths,
    meta: course,
  })
)
```


Constants vs. Getters
---------------------

The `createPage()` and `createSwitch()` declaration functions take an options object, where most available options can be specified in one of two ways: you can specify a **constant value**, or you can specify a **getter function**.

For example, here's how you'd specify a constant value for a page's `content` option:

```js
{
  content: <div>how much would could a woodchuck chuck</div>
}
```

And here's how you'd specify a dynamic value using a getter function:

```js
{
  getContent: async (env) => fetch('/would-chuck-volume')
}
```

While getter functions are more verbose than constant values, they provide a number of extra capabilities:

- Getters receive an [Env object](#env-objects), which can be used to created values that depend on a page's url, context, or on other routes.
- Getters will be recomputed whenever the user navigates and whenever your `Navigation` object's context changes.
- If a getter function returns a Promise, then Navi will use that value that the promise resolves to. This means that you can use both standard functions and async functions as getters.
- If a getter functions returns a promise to an object of the shape `{ default: value }`, then Navi will use the value under the `default` key. This facilitates use of JavaScript's dynamic `import()` expression.


Env objects
-----------

The `env` object passed to your getter functions contains information about the context in which the declaration is mounted.

```typescript
{
  // Contains your Navigation object's context, or the context provided
  // a `createContext` declaration if one exists as an ancestor.
  context: any,

  // Contains all URL parameters, along with all query parameters
  params: { [name: string]: string },

  // The pathname at which this declaration is mounted.
  pathname: string,

  // Contains parameters extracted from the URL's `?search`, but excludes
  // any parameters extract from URL the URL via `:param` patterns.
  query: { [name: string]: string },

  // A router object, which can be used to resolve routes and sitemaps
  // for other URLs.
  router: Router,

  // If the current URL contains a `?search` string, it'll be made
  // available here.
  search: string,
}
```