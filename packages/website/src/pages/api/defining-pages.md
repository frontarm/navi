## Defining Pages

### `createPage(options)`

Pages are simple, they just define something that can be rendered when the user visits a URL.

#### Options

- `title`

  The page's title, which will be set when the user navigates to the page.

- `getContent()`

  Returns the page's content. For a React app, it will often return an element, or component.

  This can be an async function, or can return a promise. In this case, Navi will wait until the promise has resolved before changing the browser's location.

  If this returns a promise to an object with a `default` property, the default property will be treated as content. This allows you to easily use it with `import()` statements.

- `meta` *(optional)*

  An object containing arbitrary information about the page. When used with navi-scripts, this information will be added in the head as `<meta>` tags.

- `params` *(optional)*

  An array of names of URL query parameters that belong to this page.

#### Example

```js
createPage({
  title: 'React Armory',
  meta: {
    description: "Advanced React for Experienced Developers.",
  },
  component: MarkdownWrapper,
  getContent: () => import('!raw!./pitch.md'),
})
```

### `createRedirect(path | (URLDescriptor) => path)`

Redirect templates let you specify that a given path should redirect to another path.

You can either provide an absolute path, or you can provide a function that takes the path which the redirect is mounted at, and returns the path to redirect to.

#### Example

```js
// Redirect to '/browse', underneath the path where the location was mounted
createRedirect((urlDescriptor) => path.join(url.pathname, 'browse'))
```

### `createSwitches(options | getOptions)`

Switches let you mount multiple things at different subpaths. A switch's paths can point to pages, redirects, or even other switches.

#### Options

- `paths` *(required)*

  An object that maps URL paths to the Pages, Redirect and Switches which should handle them.

  The '/' path is special; if you provide a Page or Redirect, it will be used when the user accesses the URL at which the junction itself is mounted.

- `getContent()` *(optional)*

- `title` *(optional)*

- `meta` *(optional)*

  Any arbitrary data that you'd like to associate with the switch.

- `params` *(optional)*

  An array of names of URL query parameters that belong to this switch.
